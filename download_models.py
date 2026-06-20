from transformers import pipeline
import torch

def download():
    print("--- Starting AI Model Downloads (Transformers) ---")
    
    models = [
        ("SigLIP (Vision)", "zero-shot-image-classification", "google/siglip-base-patch16-224"),
        ("SciBERT (NER)", "ner", "dslim/bert-base-NER"),
        ("Whisper (STT)", "automatic-speech-recognition", "openai/whisper-base"),
        ("SpeechT5 (TTS)", "text-to-speech", "microsoft/speecht5_tts")
    ]
    
    for name, task, model_id in models:
        print(f"\nDownloading {name}...")
        try:
            pipeline(task, model=model_id)
            print(f"Successfully cached {name}")
        except Exception as e:
            print(f"Failed to download {name}: {e}")

    print("\nDownloading SentenceTransformer (RAG Embeddings)...")
    try:
        from sentence_transformers import SentenceTransformer
        SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
        print("Successfully cached SentenceTransformer")
    except Exception as e:
        print(f"Failed to download SentenceTransformer: {e}")

    print("\n--- All Transformer downloads complete! ---")
    print("--- (Assistant uses local Ollama) ---")

if __name__ == "__main__":
    download()

