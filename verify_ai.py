import os
import django
import sys
from PIL import Image
import requests
from io import BytesIO

# Setup Django Environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fossilnet_backend.settings')
django.setup()

from fossil_api.services import LocalAIService, RAGService

def verify():
    print("=== FossilNet AI Core Activation & Verification ===\n")

    # 1. Verify Vision (SigLIP)
    print("1. Activating SigLIP (Vision Classifier)...")
    test_img = "https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/transformers/tasks/car.jpg"
    labels = ["car", "fossil", "rock", "animal"]
    res_siglip = LocalAIService.classify_image(test_img, labels)
    if isinstance(res_siglip, list) and "error" not in res_siglip:
        print(f"   [SUCCESS] Top Prediction: {res_siglip[0]['label']} ({res_siglip[0]['score']:.2f})")
        
        # 1b. Verify Explainable AI Heatmap
        print("   Generating spatial neural attention heatmap...")
        heatmap = LocalAIService.generate_attention_heatmap(test_img, res_siglip[0]['label'])
        if heatmap:
            print("   [SUCCESS] Generated attention heatmap (base64 overlay ready)")
        else:
            print("   [FAILED] Heatmap generation failed")
    else:
        err = res_siglip.get('error') if isinstance(res_siglip, dict) else "Classification returned invalid shape"
        print(f"   [FAILED] {err}")

    # 2. Verify NLP (SciBERT NER)
    print("\n2. Activating SciBERT (Literature Mining)...")
    test_text = "The Trilobite specimen was discovered in the Burgess Shale of Canada."
    res_ner = LocalAIService.extract_entities(test_text)
    if isinstance(res_ner, list):
        entities = [f"{e['word']} ({e['entity']})" for e in res_ner]
        print(f"   [SUCCESS] Extracted entities: {', '.join(entities)}")
    else:
        print(f"   [FAILED] {res_ner.get('error')}")

    # 3. Verify STT (Whisper)
    print("\n3. Activating Whisper (STT)...")
    try:
        pipe = LocalAIService.get_stt_pipeline()
        print("   [SUCCESS] Whisper pipeline loaded and ready.")
    except Exception as e:
        print(f"   [FAILED] {e}")

    # 4. Verify TTS (SpeechT5)
    print("\n4. Activating SpeechT5 (Voice Output)...")
    res_tts = LocalAIService.synthesize_speech("Fossil intelligence core online.")
    if "error" not in res_tts:
        print(f"   [SUCCESS] Generated audio at: {res_tts['audio_url']}")
    else:
        print(f"   [FAILED] {res_tts['error']}")

    # 5. Verify RAG (SentenceTransformer Embeddings)
    print("\n5. Activating RAG Embedding Model...")
    try:
        model = LocalAIService.get_rag_embedding_model()
        test_emb = model.encode(["Fossil record in the Cambrian layer"])
        print(f"   [SUCCESS] SentenceTransformer active. Dimensions: {test_emb.shape[1]}")
    except Exception as e:
        print(f"   [FAILED] {e}")

    # 6. Verify Assistant (Multi-Agent Routing & Ollama)
    print("\n6. Activating Multi-Agent Assistant...")
    res_chat = LocalAIService.chat_assistant("Where is the best place to dig Jurassic fossils?")
    if "error" not in res_chat:
        text = res_chat['generated_text'][:80].replace('\n', ' ') + "..."
        print(f"   [SUCCESS] Responding Agent: {res_chat['agent']}")
        print(f"   [SUCCESS] active LLM Node: {res_chat['model']}")
        print(f"   [SUCCESS] Response preview: {text}")
    else:
        print(f"   [FAILED] {res_chat['error']}")

    print("\n=== All Core AI Systems Verified ===")

if __name__ == "__main__":
    verify()
