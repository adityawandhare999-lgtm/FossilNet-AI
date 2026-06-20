import torch
from transformers import pipeline, AutoProcessor, AutoModel
import ollama
from django.conf import settings
from PIL import Image
import requests
from io import BytesIO
import os
import numpy as np
import soundfile as sf
import time
import librosa

class LocalAIService:
    _clip_pipeline = None
    _ner_pipeline = None
    _stt_pipeline = None
    _tts_pipeline = None
    _speaker_embeddings = None
    _device = "cuda" if torch.cuda.is_available() else "cpu"

    # Cache for raw SigLIP components used in explainable AI
    _siglip_model = None
    _siglip_processor = None

    # Cache for RAG Embeddings
    _rag_embedding_model = None

    @classmethod
    def get_clip_pipeline(cls):
        if cls._clip_pipeline is None:
            print(f"Loading local SigLIP model (google/siglip-base-patch16-224) on {cls._device}...")
            cls._clip_pipeline = pipeline("zero-shot-image-classification", model="google/siglip-base-patch16-224", device=cls._device)
        return cls._clip_pipeline

    @classmethod
    def get_ner_pipeline(cls):
        if cls._ner_pipeline is None:
            print(f"Loading local NER model (dslim/bert-base-NER) on {cls._device}...")
            cls._ner_pipeline = pipeline("ner", model="dslim/bert-base-NER", device=cls._device)
        return cls._ner_pipeline

    @classmethod
    def get_stt_pipeline(cls):
        if cls._stt_pipeline is None:
            print(f"Loading local Whisper model (openai/whisper-base) on {cls._device}...")
            cls._stt_pipeline = pipeline("automatic-speech-recognition", model="openai/whisper-base", device=cls._device)
        return cls._stt_pipeline

    @classmethod
    def get_tts_pipeline(cls):
        if cls._tts_pipeline is None:
            print(f"Loading local TTS model (microsoft/speecht5_tts) on {cls._device}...")
            cls._tts_pipeline = pipeline("text-to-speech", model="microsoft/speecht5_tts", device=cls._device)
        return cls._tts_pipeline

    @classmethod
    def get_rag_embedding_model(cls):
        if cls._rag_embedding_model is None:
            from sentence_transformers import SentenceTransformer
            print(f"Loading local SentenceTransformer model (sentence-transformers/all-MiniLM-L6-v2) on {cls._device}...")
            cls._rag_embedding_model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2", device=cls._device)
        return cls._rag_embedding_model

    @classmethod
    def get_siglip_model_and_processor(cls):
        if cls._siglip_model is None or cls._siglip_processor is None:
            print(f"Loading raw SigLIP model components for Explainable AI on {cls._device}...")
            cls._siglip_processor = AutoProcessor.from_pretrained("google/siglip-base-patch16-224")
            cls._siglip_model = AutoModel.from_pretrained("google/siglip-base-patch16-224").to(cls._device)
        return cls._siglip_model, cls._siglip_processor

    @staticmethod
    def classify_image(image_data, labels):
        try:
            if isinstance(image_data, str) and image_data.startswith('http'):
                response = requests.get(image_data)
                img = Image.open(BytesIO(response.content))
            else:
                img = image_data
            pipe = LocalAIService.get_clip_pipeline()
            with torch.inference_mode():
                return pipe(img, candidate_labels=labels)
        except Exception as e:
            return {"error": f"Local Image Classification failed: {str(e)}"}

    @staticmethod
    def generate_attention_heatmap(image_data, label_text):
        try:
            if isinstance(image_data, str) and image_data.startswith('http'):
                response = requests.get(image_data)
                img = Image.open(BytesIO(response.content))
            else:
                img = image_data

            model, processor = LocalAIService.get_siglip_model_and_processor()

            inputs = processor(images=img, text=[label_text], return_tensors="pt", padding="max_length")
            inputs = {k: v.to(LocalAIService._device) for k, v in inputs.items()}

            with torch.inference_mode():
                vision_outputs = model.vision_model(inputs["pixel_values"])
                last_hidden = vision_outputs.last_hidden_state
                patch_embeds = model.visual_projection(last_hidden)
                patch_embeds = patch_embeds / patch_embeds.norm(dim=-1, keepdim=True)

                text_outputs = model.text_model(input_ids=inputs["input_ids"], attention_mask=inputs["attention_mask"])
                text_embeds = model.text_projection(text_outputs.pooled_output)
                text_embeds = text_embeds / text_embeds.norm(dim=-1, keepdim=True)

                similarities = torch.bmm(patch_embeds, text_embeds.unsqueeze(-1)).squeeze()
                similarity_grid = similarities.view(14, 14).cpu().numpy()

            s_min, s_max = similarity_grid.min(), similarity_grid.max()
            if s_max - s_min > 1e-5:
                similarity_grid = (similarity_grid - s_min) / (s_max - s_min)
            else:
                similarity_grid = similarity_grid - s_min

            grid_img = Image.fromarray((similarity_grid * 255).astype(np.uint8))
            grid_resized = grid_img.resize(img.size, Image.Resampling.BILINEAR)
            grid_arr = np.array(grid_resized)

            x = grid_arr / 255.0
            r = np.clip(1.5 - np.abs(4 * x - 3), 0, 1) * 255
            g = np.clip(1.5 - np.abs(4 * x - 2), 0, 1) * 255
            b = np.clip(1.5 - np.abs(4 * x - 1), 0, 1) * 255

            heatmap_arr = np.stack([r, g, b], axis=-1).astype(np.uint8)
            heatmap_img = Image.fromarray(heatmap_arr)

            img_rgb = img.convert("RGB")
            blended = Image.blend(img_rgb, heatmap_img, alpha=0.45)

            buffered = BytesIO()
            blended.save(buffered, format="JPEG")
            import base64
            img_str = base64.b64encode(buffered.getvalue()).decode()
            return f"data:image/jpeg;base64,{img_str}"
        except Exception as e:
            print(f"Error generating heatmap: {e}")
            return None

    @staticmethod
    def extract_entities(text):
        """
        Full NER pipeline with:
        - Pre-extraction of specimen IDs via regex (before BERT tokenises them apart)
        - B-/I- token merging into complete multi-word entities
        - ##subword reconstruction
        - Stopword / noise filtering
        - Deduplication
        - Category mapping to paleontology-meaningful labels
        """
        import re

        # ── 0. Stopword blacklist ────────────────────────────────
        STOP_ENTITIES = {
            "et", "à", "a", "an", "the", "and", "of", "or", "in",
            "on", "at", "by", "de", "la", "le", "les", "du", "des",
            "un", "une", "au", "aux", "pour", "avec", "sur", "par",
            "from", "to", "for", "is", "was", "are", "were", "be",
            "its", "it", "this", "that", "these", "those",
            # single letters and digits
            "v", "i", "s", "c", "e", "g", "n", "p", "r", "t",
        }

        # ── 1. Regex: capture specimen / catalogue IDs first ─────
        specimen_pattern = re.compile(
            r'\b([A-Z]{2,}-[A-Z0-9]+-\d+|[A-Z]{2,}\s*[-–]\s*[A-Z]\s*[-–]\s*\d+)\b'
        )
        specimen_entities = []
        for m in specimen_pattern.finditer(text):
            sid = m.group(0).strip()
            specimen_entities.append({
                "entity": "SPEC_ID",
                "category": "SPECIMEN ID",
                "word": sid,
                "score": 1.0,
                "start": m.start(),
                "end": m.end()
            })

        # ── 2. BERT NER ──────────────────────────────────────────
        try:
            pipe = LocalAIService.get_ner_pipeline()
            with torch.inference_mode():
                raw = pipe(text)
        except Exception as e:
            return {"error": f"Local NER extraction failed: {str(e)}"}

        # ── 3. Merge B-/I- tokens and ##subwords ─────────────────
        # BERT returns individual wordpiece tokens tagged B-TYPE / I-TYPE.
        # We merge consecutive tokens that share the same entity group or
        # are wordpiece continuations (##…) into a single entity.
        merged_ner = []
        current = None

        for tok in raw:
            tag      = tok["entity"]          # e.g. "B-LOC", "I-LOC", "B-PER"
            is_begin = tag.startswith("B-")
            is_inner = tag.startswith("I-")
            base_tag = tag[2:] if (is_begin or is_inner) else tag  # "LOC", "PER", …

            word     = tok["word"]
            is_sub   = word.startswith("##")
            clean    = word[2:] if is_sub else word

            if current is None:
                # Start a new span
                current = {
                    "entity": base_tag,
                    "word":   clean,
                    "score":  tok["score"],
                    "start":  tok["start"],
                    "end":    tok["end"]
                }
            elif is_sub or (is_inner and base_tag == current["entity"]):
                # Continuation: append directly (no space for subwords)
                sep = "" if is_sub else " "
                current["word"]  += sep + clean
                current["end"]    = tok["end"]
                current["score"]  = min(current["score"], tok["score"])
            else:
                merged_ner.append(current)
                current = {
                    "entity": base_tag,
                    "word":   clean,
                    "score":  tok["score"],
                    "start":  tok["start"],
                    "end":    tok["end"]
                }

        if current:
            merged_ner.append(current)

        # ── 4. Category mapping (BERT → Paleo domain labels) ─────
        CATEGORY_MAP = {
            "LOC":  ("LOC",     "EXCAVATION SITE"),
            "PER":  ("PER",     "INVESTIGATOR"),
            "ORG":  ("ORG",     "INSTITUTION"),
            "MISC": ("MISC",    "TAXONOMIC / MISC"),
        }

        # ── 5. Filter noise + deduplicate ─────────────────────────
        seen = set()
        clean_entities = []

        for ent in merged_ner:
            word  = ent["word"].strip()
            lower = word.lower()

            # Drop short noise, pure digits, stopwords
            if len(word) < 2:
                continue
            if lower in STOP_ENTITIES:
                continue
            if re.fullmatch(r'[\d\s\W]+', word):
                continue
            # Drop entities that are just punctuation or hyphens
            if re.fullmatch(r'[-–—,.:;!?()"\'\s]+', word):
                continue

            key = lower
            if key in seen:
                continue
            seen.add(key)

            cat_key, cat_label = CATEGORY_MAP.get(ent["entity"], (ent["entity"], ent["entity"]))
            clean_entities.append({
                "entity":   cat_key,
                "category": cat_label,
                "word":     word,
                "score":    round(ent["score"], 3),
                "start":    ent["start"],
                "end":      ent["end"]
            })

        # ── 6. Add pre-extracted specimen IDs (if not already seen) ──
        for sp in specimen_entities:
            key = sp["word"].lower()
            if key not in seen:
                seen.add(key)
                clean_entities.append(sp)

        return clean_entities

    @staticmethod
    def chat_assistant(prompt, model_name=None):
        import ollama
        prompt_lower = prompt.lower()
        if any(w in prompt_lower for w in ["where", "dig", "site", "formation", "prospect", "excavat", "map"]):
            agent = "Excavation Agent"
            system_msg = (
                "You are the FossilNet Excavation Advisor, a field geology expert specializing in stratigraphy, fossil preservation conditions, and site logistics. "
                "Provide detailed, structured field recommendations, coordinates, and layer details. Use markdown."
            )
        elif any(w in prompt_lower for w in ["paper", "literature", "article", "journal", "read", "ner", "text"]):
            agent = "Literature Agent"
            system_msg = (
                "You are the FossilNet Literature Mining Analyst, specializing in scientific taxonomy, extracting names/locations from papers, and bibliographic data. "
                "Analyze papers with precision. Use markdown."
            )
        elif any(w in prompt_lower for w in ["era", "period", "million", "year", "cambrian", "jurassic", "cretaceous", "timeline", "age"]):
            agent = "Geological Agent"
            system_msg = (
                "You are the FossilNet Chronostratigrapher, an expert on the geological time scale, plate tectonics, and macroevolutionary cycles. "
                "Detail eras, epochs, and biological radiations. Use markdown."
            )
        else:
            agent = "Fossil Expert Agent"
            system_msg = (
                "You are the FossilNet Paleontologist, a world-class expert on fossil morphology, classification, evolution, and anatomical structures. "
                "Provide highly specific scientific details. Use markdown."
            )

        models_to_try = [model_name] if model_name else []
        models_to_try += ['qwen2.5:7b', 'deepseek-r1:8b', 'mistral:7b', 'mistral']
        models_to_try = [m for m in models_to_try if m]

        response_text = ""
        used_model = "None"

        for model in models_to_try:
            try:
                response = ollama.chat(model=model, messages=[
                    {'role': 'system', 'content': system_msg},
                    {'role': 'user', 'content': prompt},
                ])
                response_text = response['message']['content']
                used_model = model
                break
            except Exception:
                continue

        if not response_text:
            used_model = "Simulated Fallback (Ollama Offline)"
            response_text = (
                f"**[Response from {agent} – Local LLM Offline]**\n\n"
                f"Your query: *\"{prompt}\"*\n\n"
                f"To get a full generative response, please ensure Ollama is installed and running (`ollama run mistral` or `qwen2.5`). "
                f"Here is a brief paleontological insight from our offline reference core:\n"
                f"- Fossils are preserved remains of organisms from past geological ages.\n"
                f"- Dig locations like Hell Creek or Burgess Shale are globally renowned for spectacular preservation.\n"
                f"- The geological time scale spans billions of years, dividing Earth's history into eons, eras, periods, and epochs."
            )

        return {
            "generated_text": response_text,
            "agent": agent,
            "model": used_model
        }

    @staticmethod
    def transcribe_audio(audio_file_path):
        try:
            print(f"DEBUG: Transcribing audio from {audio_file_path}...")
            import librosa
            audio, sr = librosa.load(audio_file_path, sr=16000)

            pipe = LocalAIService.get_stt_pipeline()
            with torch.inference_mode():
                result = pipe(audio)
            print(f"DEBUG: Transcription result: '{result['text']}'")
            return {"text": result["text"]}
        except Exception as e:
            err_msg = str(e)
            if not err_msg:
                err_msg = repr(e)
            if "ffmpeg" in err_msg.lower() or "nobackenderror" in err_msg.lower():
                err_msg = "FFmpeg backend not found or not in PATH. If you recently installed FFmpeg, you MUST restart your backend Django terminal."
            print(f"DEBUG: Transcription error: {err_msg}")
            return {"error": f"STT failed: {err_msg}"}

    @classmethod
    def get_speaker_embeddings(cls):
        if cls._speaker_embeddings is None:
            local_path = os.path.join(os.path.dirname(__file__), "speaker_embeddings.npy")
            if os.path.exists(local_path):
                try:
                    print("Loading speaker embeddings from local cache...")
                    emb = np.load(local_path)
                    # Cast to float32 — avoids Double/Float dtype mismatch with SpeechT5
                    cls._speaker_embeddings = torch.tensor(emb).float().unsqueeze(0).to(cls._device)
                    return cls._speaker_embeddings
                except Exception as e:
                    print(f"Failed to load local speaker embeddings: {e}")

            try:
                from datasets import load_dataset
                print("Downloading speaker embeddings dataset from HF (regisss/cmu-arctic-xvectors)...")
                embeddings_dataset = load_dataset("regisss/cmu-arctic-xvectors", split="validation")
                xvector = embeddings_dataset[7306]["xvector"]
                # Cast to float32
                cls._speaker_embeddings = torch.tensor(xvector).float().unsqueeze(0).to(cls._device)
                np.save(local_path, np.array(xvector))
                print(f"Saved speaker embedding to local cache: {local_path}")
            except Exception as e:
                print(f"Dataset loading failed ({e}). Using stable fallback.")
                cls._speaker_embeddings = torch.zeros((1, 512)).float().to(cls._device)
        return cls._speaker_embeddings

    @staticmethod
    def synthesize_speech(text):
        try:
            start_time = time.time()
            if len(text) > 250:
                truncated = text[:250]
                last_punc = max(truncated.rfind('.'), truncated.rfind('?'), truncated.rfind('!'))
                if last_punc > 100:
                    text = truncated[:last_punc + 1]
                else:
                    last_space = truncated.rfind(' ')
                    text = truncated[:last_space] + "..." if last_space > 100 else truncated + "..."

            pipe = LocalAIService.get_tts_pipeline()
            speaker_embeddings = LocalAIService.get_speaker_embeddings()

            max_chunk_len = 400
            text_chunks = [text[i:i+max_chunk_len] for i in range(0, len(text), max_chunk_len)]

            combined_audio = []
            sampling_rate = 16000

            with torch.inference_mode():
                for chunk in text_chunks:
                    clean_chunk = chunk.strip()
                    if not clean_chunk:
                        continue
                    res = pipe(clean_chunk, forward_params={"speaker_embeddings": speaker_embeddings})
                    combined_audio.append(res["audio"])
                    sampling_rate = res["sampling_rate"]

            if not combined_audio:
                return {"error": "No text to synthesize"}

            final_audio = np.concatenate(combined_audio)
            max_val = np.max(np.abs(final_audio))
            if max_val > 0:
                final_audio = final_audio / max_val

            filename = "response_speech.wav"
            output_path = os.path.join(settings.MEDIA_ROOT, filename)
            os.makedirs(settings.MEDIA_ROOT, exist_ok=True)
            sf.write(output_path, final_audio, sampling_rate)

            print(f"DEBUG: TTS synthesis completed in {time.time() - start_time:.2f} seconds")
            return {"audio_url": f"{settings.MEDIA_URL}{filename}?t={int(time.time())}"}
        except Exception as e:
            return {"error": f"TTS (SpeechT5) failed: {str(e)}"}


class HuggingFaceService(LocalAIService):
    pass


# ─────────────────────────────────────────────────────────────
#  Administrative / boilerplate section detector.
#  Chunks containing these signals are dropped at index-time
#  so they never surface during retrieval or summarisation.
# ─────────────────────────────────────────────────────────────
_JUNK_PATTERNS = [
    "acknowledgement", "acknowledgment",
    "author contribution", "authors' contribution",
    "competing interest", "conflict of interest",
    "data availability", "availability of data",
    "supplementary information", "supplementary material",
    "creative commons", "cc by", "cc-by",
    "open access article", "this article is licensed",
    "this work is licensed", "all rights reserved",
    "rights and permissions", "reprints and permission",
    "correspondence and requests",
    "additional information",
    "declarations\n", "declarations:",
    "funding\n", "funding:",
    "springer nature", "nature communications",
    "received:", "revised:", "accepted:", "published online",
    "how to cite", "cite this article",
]

# One occurrence of these is enough to discard the entire chunk
_STRONG_JUNK = [
    "creative commons", "competing interest", "author contribution",
    "this article is licensed", "all rights reserved",
    "data availability", "correspondence and requests",
    "supplementary information",
]


def _is_junk_chunk(text: str) -> bool:
    """
    Scan the FULL chunk text for administrative / boilerplate signals.
    Returns True when the chunk should be excluded from the vector index.
    """
    t = text.lower()
    if any(s in t for s in _STRONG_JUNK):
        return True
    return sum(1 for p in _JUNK_PATTERNS if p in t) >= 2


def _expand_query(query: str) -> str:
    """
    Replace vague summarisation requests with domain-rich expansions
    so embedding search targets abstract / results / discussion sections
    rather than license / funding pages.
    """
    q = query.lower().strip()
    generic_triggers = [
        "summarize", "summary", "what is this", "what does this",
        "what is the paper about", "overview", "explain the document",
        "tell me about", "describe the paper", "what are the findings",
        "main points", "key points",
    ]
    if any(t in q for t in generic_triggers):
        return (
            "abstract introduction methodology experimental results "
            "discussion conclusions main findings research objectives "
            "scientific analysis data specimen"
        )
    return query


class RAGService:
    _current_chunks: list = []
    _current_embeddings = None
    _document_name: str = ""

    # ──────────────────────────────────────────────────────────
    #  UPLOAD  →  parse  →  junk-filter  →  chunk  →  embed
    # ──────────────────────────────────────────────────────────
    @classmethod
    def upload_pdf(cls, file_obj, filename):
        try:
            import io, re
            import pypdf

            # Read bytes into a fresh BytesIO — guarantees stream pointer = 0
            raw_bytes = file_obj.read()
            if not raw_bytes:
                return {"error": "Uploaded file is empty."}

            pdf_stream = io.BytesIO(raw_bytes)
            try:
                pdf_reader = pypdf.PdfReader(pdf_stream)
            except Exception as pdf_err:
                return {
                    "error": f"Cannot read PDF: {pdf_err}. "
                             "Ensure the file is a valid, non-encrypted PDF."
                }

            # 1. Extract text page-by-page
            pages_text = []
            for page in pdf_reader.pages:
                t = page.extract_text()
                if t and t.strip():
                    pages_text.append(t)

            full_text = "\n".join(pages_text)
            if not full_text.strip():
                return {
                    "error": "No extractable text found in PDF. "
                             "The file may be scanned or image-only."
                }

            # 2. Sentence-aware chunking with overlap
            sentence_splitter = re.compile(r'(?<=[.!?])\s+')
            sentences = [s.strip() for s in sentence_splitter.split(full_text)
                         if len(s.strip()) > 20]

            CHUNK_WORDS   = 200   # target words per chunk
            OVERLAP_WORDS = 40    # words carried into next chunk for continuity
            chunks: list = []
            current_words: list = []

            for sentence in sentences:
                current_words.extend(sentence.split())
                if len(current_words) >= CHUNK_WORDS:
                    chunk_text = " ".join(current_words)
                    if not _is_junk_chunk(chunk_text):
                        chunks.append(chunk_text)
                    current_words = current_words[-OVERLAP_WORDS:]

            if current_words:                          # flush tail
                chunk_text = " ".join(current_words)
                if not _is_junk_chunk(chunk_text):
                    chunks.append(chunk_text)

            if not chunks:
                return {
                    "error": "PDF contained only administrative / boilerplate "
                             "text — no scientific content could be extracted."
                }

            cls._current_chunks    = chunks
            cls._document_name     = filename

            # 3. Embed all scientific chunks
            embed_model = LocalAIService.get_rag_embedding_model()
            cls._current_embeddings = embed_model.encode(
                chunks, convert_to_numpy=True, show_progress_bar=False
            )

            return {
                "status":       "success",
                "filename":     filename,
                "chunks_count": len(chunks),
                "message":      f"Parsed '{filename}': {len(chunks)} scientific chunks indexed."
            }

        except Exception as e:
            import traceback
            print(f"RAG upload error:\n{traceback.format_exc()}")
            return {"error": f"PDF processing failed: {e}"}

    # ──────────────────────────────────────────────────────────
    #  QUERY  →  expand  →  embed  →  top-10 retrieve  →  LLM
    # ──────────────────────────────────────────────────────────
    @classmethod
    def query_pdf(cls, query_text):
        if not cls._current_chunks or cls._current_embeddings is None:
            return {"error": "No document uploaded. Please upload a PDF first."}

        try:
            retrieval_query = _expand_query(query_text)

            embed_model = LocalAIService.get_rag_embedding_model()
            query_emb   = embed_model.encode(
                [retrieval_query], convert_to_numpy=True
            )[0]

            # Cosine similarity (numerically stable denominator)
            norms      = np.linalg.norm(cls._current_embeddings, axis=1, keepdims=True)
            norm_embs  = cls._current_embeddings / np.clip(norms, 1e-8, None)
            norm_q     = query_emb / np.linalg.norm(query_emb)
            sims       = np.dot(norm_embs, norm_q)

            TOP_K     = min(10, len(cls._current_chunks))
            MIN_SCORE = 0.30   # raised to reject weak matches like license text

            top_idx = np.argsort(sims)[::-1][:TOP_K].tolist()
            top_idx = [i for i in top_idx if sims[i] >= MIN_SCORE]

            if not top_idx:    # graceful fallback without threshold
                top_idx = np.argsort(sims)[::-1][:5].tolist()

            retrieved_chunks = [cls._current_chunks[i] for i in top_idx]
            retrieved_scores = [float(sims[i])          for i in top_idx]

            context = "\n\n---\n\n".join(
                f"[Passage {n+1}]\n{chunk}"
                for n, chunk in enumerate(retrieved_chunks)
            )
            prompt = (
                f"You are an expert Paleontological RAG Assistant.\n"
                f"The research paper is: '{cls._document_name}'.\n"
                f"Answer the question using ONLY the passages below.\n"
                f"If the answer is absent, say so explicitly.\n"
                f"Use markdown headers and bullet points.\n\n"
                f"=== RETRIEVED PASSAGES (top {len(retrieved_chunks)}) ===\n"
                f"{context}\n\n"
                f"=== USER QUESTION ===\n{query_text}\n\n"
                f"=== ANSWER ==="
            )

            return cls._call_ollama(prompt, retrieved_chunks, retrieved_scores)

        except Exception as e:
            import traceback
            print(f"RAG query error:\n{traceback.format_exc()}")
            return {"error": f"Query processing failed: {e}"}

    # ──────────────────────────────────────────────────────────
    #  LLM cascade  (Ollama → offline passage display fallback)
    # ──────────────────────────────────────────────────────────
    @classmethod
    def _call_ollama(cls, prompt, retrieved_chunks, retrieved_scores):
        import ollama
        models_to_try = ['qwen2.5:7b', 'deepseek-r1:8b', 'mistral:7b', 'mistral']
        response_text = ""

        for model in models_to_try:
            try:
                res = ollama.generate(model=model, prompt=prompt)
                response_text = res['response']
                break
            except Exception:
                continue

        if not response_text:
            response_text = (
                "**[Offline Mode – Ollama Not Detected]**\n\n"
                "Most relevant passages retrieved from the document:\n\n"
            )
            for n, (chunk, score) in enumerate(
                zip(retrieved_chunks[:4], retrieved_scores[:4]), 1
            ):
                response_text += (
                    f"**Passage {n}** *(relevance {score:.0%})*\n\n"
                    f"> {chunk[:500]}...\n\n"
                )
            response_text += (
                "\n*Run `ollama run mistral` or `ollama run qwen2.5` "
                "to enable full AI synthesis.*"
            )

        return {
            "answer": response_text,
            "sources": [
                {"text": chunk[:300], "score": round(score, 3)}
                for chunk, score in zip(retrieved_chunks, retrieved_scores)
            ]
        }
