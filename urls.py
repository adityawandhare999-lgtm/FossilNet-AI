from django.urls import path
from .views import (
    FossilIdentifyView, LiteratureMiningView, AssistantChatView, 
    ProspectorAIView, TimeMachineView, VoiceTranscribeView, SpeechSynthesisView,
    RAGUploadView, RAGQueryView
)

urlpatterns = [
    path('identify/', FossilIdentifyView.as_view(), name='identify'),
    path('mining/', LiteratureMiningView.as_view(), name='mining'),
    path('assistant/', AssistantChatView.as_view(), name='assistant'),
    path('prospector/', ProspectorAIView.as_view(), name='prospector'),
    path('timeline/', TimeMachineView.as_view(), name='timeline'),
    path('transcribe/', VoiceTranscribeView.as_view(), name='transcribe'),
    path('synthesize/', SpeechSynthesisView.as_view(), name='synthesize'),
    path('rag/upload/', RAGUploadView.as_view(), name='rag_upload'),
    path('rag/query/', RAGQueryView.as_view(), name='rag_query'),
]

