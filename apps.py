from django.apps import AppConfig
import sys

class FossilApiConfig(AppConfig):
    name = 'fossil_api'

    def ready(self):
        # Only run when serving, not during migrate/makemigrations/etc.
        if 'runserver' in sys.argv:
            import os
            # Ensure it only runs in the main thread (Django starts a child thread for auto-reload)
            if os.environ.get('RUN_MAIN') == 'true':
                import threading
                def preload():
                    try:
                        from .services import LocalAIService
                        print("--- Preloading AI models on startup in background ---")
                        # Preload cached embeddings
                        LocalAIService.get_speaker_embeddings()
                        # Preload pipelines
                        LocalAIService.get_tts_pipeline()
                        LocalAIService.get_stt_pipeline()
                        print("--- AI models preloaded and ready ---")
                    except Exception as e:
                        print(f"Failed to preload AI models: {e}")
                
                threading.Thread(target=preload, daemon=True).start()
