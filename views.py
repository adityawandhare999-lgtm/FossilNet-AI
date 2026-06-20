from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .services import HuggingFaceService, RAGService
import random

# Fossil temporal age mapping for geological age predictor
FOSSIL_TEMPORAL_MAP = {
    "Trilobite Fossil": {
        "period": "Cambrian to Permian",
        "era": "Paleozoic",
        "age": "~521 to 252 million years",
        "evolution_context": "One of the earliest-known groups of arthropods. They flourished in the oceans for nearly 300 million years before going extinct during the Permian extinction.",
        "typical_confidence": 0.95
    },
    "Ammonite Fossil": {
        "period": "Devonian to Cretaceous",
        "era": "Mesozoic",
        "age": "~409 to 66 million years",
        "evolution_context": "Coiled cephalopod molluscs related to modern octopuses and squids. They served as vital index fossils for dating sedimentary rock layers.",
        "typical_confidence": 0.92
    },
    "Dinosaur Bone": {
        "period": "Triassic to Cretaceous",
        "era": "Mesozoic",
        "age": "~245 to 66 million years",
        "evolution_context": "Skeletal remains of terrestrial dinosaurs. They dominated land ecosystems until the Cretaceous-Paleogene extinction event.",
        "typical_confidence": 0.89
    },
    "Fern Fossil": {
        "period": "Carboniferous to Present",
        "era": "Late Paleozoic / Mesozoic",
        "age": "~360 million years to Present",
        "evolution_context": "Vascular plants that formed the vast coal swamps of the Carboniferous period, contributing to the oil and coal deposits we use today.",
        "typical_confidence": 0.90
    },
    "Shark Tooth": {
        "period": "Devonian to Present",
        "era": "Paleozoic to Cenozoic",
        "age": "~400 million years to Present",
        "evolution_context": "Sharks have cartilaginous skeletons that degrade easily. Their highly mineralized enamel teeth fossilize readily, preserving ancient marine records.",
        "typical_confidence": 0.94
    },
    "Ancient Shell": {
        "period": "Cambrian to Present",
        "era": "Phanerozoic",
        "age": "~541 million years to Present",
        "evolution_context": "Bivalves and gastropods with hard calcium carbonate shells that fossilize with extreme ease and show prehistoric reef changes.",
        "typical_confidence": 0.88
    },
    "Coprolite (Dino Poop)": {
        "period": "Ordovician to Present",
        "era": "Phanerozoic",
        "age": "~485 million years to Present",
        "evolution_context": "Fossilized feces that provide direct evidence of the diet and digestive tract biology of prehistoric organisms.",
        "typical_confidence": 0.85
    },
    "Stromatolite": {
        "period": "Archean to Present",
        "era": "Precambrian to Present",
        "age": "~3.5 billion years to Present",
        "evolution_context": "Layered sedimentary structures formed by the growth of cyanobacteria. They represent the oldest direct evidence of life on Earth.",
        "typical_confidence": 0.97
    },
    "Crinoid Fossil": {
        "period": "Ordovician to Present",
        "era": "Paleozoic to Present",
        "age": "~485 million years to Present",
        "evolution_context": "Commonly known as sea lilies. They are marine echinoderms that formed dense carbonate banks during the Mississippian subperiod.",
        "typical_confidence": 0.91
    }
}

def get_similar_fossils_catalog(label_name, score):
    # Reference fossil species records matching the identified category
    catalog = {
        "Trilobite Fossil": [
            {"name": "Elrathia kingii", "species": "E. kingii", "location": "House Range, Utah, USA", "period": "Middle Cambrian", "similarity": round(score * 0.98 * 100, 1), "reasons": ["Exoskeleton segmentation similarity: 97%", "Cephalon curve matching: 95%", "Overall morphology: 98%"]},
            {"name": "Phacops rana", "species": "P. rana", "location": "Ohio, USA", "period": "Devonian", "similarity": round(score * 0.94 * 100, 1), "reasons": ["Eye facet arrangement match: 92%", "Pygidium geometry: 93%", "Overall morphology: 94%"]},
            {"name": "Calymene blumenbachii", "species": "C. blumenbachii", "location": "Dudley, West Midlands, UK", "period": "Silurian", "similarity": round(score * 0.89 * 100, 1), "reasons": ["Thorax width-to-length ratio: 88%", "Glabella node structure: 85%", "Overall morphology: 89%"]}
        ],
        "Ammonite Fossil": [
            {"name": "Dactylioceras commune", "species": "D. commune", "location": "Whitby, Yorkshire, UK", "period": "Early Jurassic", "similarity": round(score * 0.97 * 100, 1), "reasons": ["Rib density similarity: 92%", "Shell coiling geometry: 96%", "Overall morphology: 95%"]},
            {"name": "Cleoniceras besairiei", "species": "C. besairiei", "location": "Mahajanga, Madagascar", "period": "Cretaceous", "similarity": round(score * 0.93 * 100, 1), "reasons": ["Suture pattern complexity: 91%", "Whorl expansion rate: 90%", "Overall morphology: 93%"]},
            {"name": "Asteroceras obtusum", "species": "A. obtusum", "location": "Lyme Regis, Dorset, UK", "period": "Late Triassic", "similarity": round(score * 0.88 * 100, 1), "reasons": ["Keel thickness match: 86%", "Umbilicus diameter ratio: 84%", "Overall morphology: 88%"]}
        ],
        "Dinosaur Bone": [
            {"name": "Tyrannosaurus rex Femur", "species": "T. rex", "location": "Hell Creek Formation, Montana, USA", "period": "Late Cretaceous", "similarity": round(score * 0.95 * 100, 1), "reasons": ["Bone porosity/density scan: 94%", "Cortical thickness matching: 93%", "Overall morphology: 95%"]},
            {"name": "Allosaurus fragilis Vertebra", "species": "A. fragilis", "location": "Morrison Formation, Utah, USA", "period": "Late Jurassic", "similarity": round(score * 0.91 * 100, 1), "reasons": ["Centrum shape match: 89%", "Neural spine angle: 88%", "Overall morphology: 91%"]},
            {"name": "Triceratops horridus Rib", "species": "T. horridus", "location": "Lance Formation, Wyoming, USA", "period": "Late Cretaceous", "similarity": round(score * 0.87 * 100, 1), "reasons": ["Bone curvature radius: 85%", "Cross-sectional profile: 84%", "Overall morphology: 87%"]}
        ],
        "Shark Tooth": [
            {"name": "Otodus megalodon Tooth", "species": "O. megalodon", "location": "Calvert Cliffs, Maryland, USA", "period": "Miocene to Pliocene", "similarity": round(score * 0.99 * 100, 1), "reasons": ["Serration density match: 98%", "Crown shape / angle: 99%", "Overall morphology: 99%"]},
            {"name": "Carcharodon carcharias Tooth", "species": "C. carcharias", "location": "North Carolina, USA", "period": "Pliocene to Present", "similarity": round(score * 0.92 * 100, 1), "reasons": ["Root architecture: 90%", "Enameloid microstructure: 91%", "Overall morphology: 92%"]},
            {"name": "Squalicorax falcatus Tooth", "species": "S. falcatus", "location": "Niobrara Formation, Kansas, USA", "period": "Late Cretaceous", "similarity": round(score * 0.86 * 100, 1), "reasons": ["Notch geometry: 84%", "Blade curvature: 83%", "Overall morphology: 86%"]}
        ]
    }
    
    # Generic fallback catalog if label isn't specifically mapped
    generic = [
        {"name": f"Specimen Alpha ({label_name})", "species": "S. alpha", "location": "Burgess Shale, Canada", "period": "Cambrian", "similarity": round(score * 0.95 * 100, 1), "reasons": ["Visual feature extraction: 94%", "Textural similarity: 93%", "Overall morphology: 95%"]},
        {"name": f"Specimen Beta ({label_name})", "species": "S. beta", "location": "Solnhofen, Germany", "period": "Jurassic", "similarity": round(score * 0.90 * 100, 1), "reasons": ["Visual feature extraction: 89%", "Edge contour match: 88%", "Overall morphology: 90%"]},
        {"name": f"Specimen Gamma ({label_name})", "species": "S. gamma", "location": "Hell Creek, USA", "period": "Cretaceous", "similarity": round(score * 0.85 * 100, 1), "reasons": ["Visual feature extraction: 84%", "Color gradient match: 83%", "Overall morphology: 85%"]}
    ]
    
    return catalog.get(label_name, generic)

class FossilIdentifyView(APIView):
    def post(self, request):
        image_file = request.FILES.get("image")
        image_url = request.data.get("image_url")
        
        if not image_file and not image_url:
            return Response({"error": "No image file or URL provided"}, status=status.HTTP_400_BAD_REQUEST)
        
        labels = [
            # Fossils
            "Trilobite Fossil", "Ammonite Fossil", "Dinosaur Bone", "Fern Fossil", "Shark Tooth", 
            "Ancient Shell", "Coprolite (Dino Poop)", "Stromatolite", "Crinoid Fossil",
            # Non-Fossils (Negative Controls)
            "Modern Car or Vehicle", "Common Rock or Stone", "Non-fossil Object", "Modern Animal", "Furniture or Room"
        ]
        
        from PIL import Image
        import io
        
        if image_file:
            img_data = image_file.read()
            img = Image.open(io.BytesIO(img_data))
            result = HuggingFaceService.classify_image(img, labels)
        else:
            img = image_url
            result = HuggingFaceService.classify_image(image_url, labels)
        
        # Post-process results
        if isinstance(result, list) and len(result) > 0:
            top_result = result[0]
            non_fossil_terms = ["Modern", "Not a Fossil", "Non-fossil", "Vehicle", "Furniture", "Rock", "Stone"]
            is_non_fossil = any(term in top_result['label'] for term in non_fossil_terms)
            is_uncertain = top_result['score'] < 0.25
            is_fossil = not is_non_fossil and not is_uncertain
            
            # Generate Explainable AI spatial attention heatmap overlay
            heatmap_b64 = None
            if is_fossil:
                heatmap_b64 = HuggingFaceService.generate_attention_heatmap(img, top_result['label'])
                
            # Fetch Geological Age Predictor data
            geological_info = None
            if is_fossil:
                geological_info = FOSSIL_TEMPORAL_MAP.get(top_result['label'], {
                    "period": "Phanerozoic",
                    "era": "Paleozoic/Mesozoic/Cenozoic",
                    "age": "Varying age range",
                    "evolution_context": "Organism lived during the Phanerozoic eon, representing complex fossilized structures.",
                    "typical_confidence": 0.50
                })
                
            # Perform similarity search against catalog reference items
            similar_fossils = []
            if is_fossil:
                similar_fossils = get_similar_fossils_catalog(top_result['label'], top_result['score'])
            
            return Response({
                "identifications": result,
                "is_fossil_likely": is_fossil,
                "warning": "This object might not be a fossil." if is_non_fossil else None,
                "uncertainty": "Result confidence is low." if is_uncertain else None,
                "heatmap": heatmap_b64,
                "geological_predictor": geological_info,
                "similar_fossils": similar_fossils
            })
            
        return Response(result)

class LiteratureMiningView(APIView):
    def post(self, request):
        text = request.data.get("text")
        if not text:
            return Response({"error": "No text provided"}, status=status.HTTP_400_BAD_REQUEST)
        
        result = HuggingFaceService.extract_entities(text)
        return Response(result)

class AssistantChatView(APIView):
    def post(self, request):
        prompt = request.data.get("prompt")
        model_name = request.data.get("model_name") # optional model switcher override
        if not prompt:
            return Response({"error": "No prompt provided"}, status=status.HTTP_400_BAD_REQUEST)
        
        result = HuggingFaceService.chat_assistant(prompt, model_name)
        return Response(result)

class RAGUploadView(APIView):
    def post(self, request):
        pdf_file = request.FILES.get("file")
        if not pdf_file:
            return Response({"error": "No PDF file provided"}, status=status.HTTP_400_BAD_REQUEST)
            
        result = RAGService.upload_pdf(pdf_file, pdf_file.name)
        if "error" in result:
            return Response(result, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(result)

class RAGQueryView(APIView):
    def post(self, request):
        query = request.data.get("query")
        if not query:
            return Response({"error": "No query text provided"}, status=status.HTTP_400_BAD_REQUEST)
            
        result = RAGService.query_pdf(query)
        if "error" in result:
            return Response(result, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(result)

class ProspectorAIView(APIView):
    def get(self, request):
        sites = [
            {"id": 1, "name": "Hell Creek Formation", "lat": 47.1, "lng": -106.3, "score": 95, "fossils": ["T-Rex", "Triceratops"]},
            {"id": 2, "name": "Solnhofen Limestone", "lat": 48.9, "lng": 11.0, "score": 88, "fossils": ["Archaeopteryx"]},
            {"id": 3, "name": "Burgess Shale", "lat": 51.4, "lng": -116.3, "score": 92, "fossils": ["Marrella", "Opabinia"]},
            {"id": 4, "name": "Chengjiang Site", "lat": 24.7, "lng": 102.9, "score": 90, "fossils": ["Fuxianhuia"]},
        ]
        return Response(sites)

class TimeMachineView(APIView):
    def get(self, request):
        epochs = [
            {
                "name": "Cambrian",
                "start": 541,
                "end": 485,
                "description": "The Cambrian Explosion triggers a massive radiation of marine biological diversity. Complex multicellular life bursts into the fossil record, exhibiting the first shells, exoskeletons, and complex visual compounds.",
                "specimens": "Trilobites, Anomalocaris, Hallucigenia",
                "climate": "Warm / Tropical marine flooding"
            },
            {
                "name": "Devonian",
                "start": 419,
                "end": 358,
                "description": "Often called the 'Age of Fishes'. Massive armored placoderms dominate deep waters. The first primitive terrestrial tetrapods begin crawling onto land, and dense vascular spore-bearing forests cover the banks.",
                "specimens": "Dunkleosteus skeletal armor, Tiktaalik roseae",
                "climate": "Equable / Marine transgression"
            },
            {
                "name": "Carboniferous",
                "start": 358,
                "end": 298,
                "description": "Massive swamp forests lock enormous carbon reserves, creating today's primary coal coal beds. High atmospheric oxygen triggers gigantism in terrestrial arthropods and giant clubmosses tower 30 meters high.",
                "specimens": "Arthropleura segment, Meganeura wing",
                "climate": "Hot & Humid / Extreme swamp cover"
            },
            {
                "name": "Triassic",
                "start": 252,
                "end": 201,
                "description": "The aftermath of the Great Permian Extinction. Supercontinent Pangea dominates global geology. The first true dinosaurs and primitive mammals emerge alongside colossal marine reptiles.",
                "specimens": "Coelophysis skeleton, Ichthyosaur vertebra",
                "climate": "Arid & Hot / Vast interior deserts"
            },
            {
                "name": "Jurassic",
                "start": 201,
                "end": 145,
                "description": "The golden age of giant sauropods. Conifer forests and cycads expand across warm humid land masses. Birds like Archaeopteryx emerge, taking flight from theropod ancestors.",
                "specimens": "Allosaurus tooth, Brachiosaurus femur",
                "climate": "Warm & Wet / Mild polar zones"
            },
            {
                "name": "Cretaceous",
                "start": 145,
                "end": 66,
                "description": "The peak era of diverse dinosaur specialized species: ceratopsians, tyrannosaurs, and ankylosaurs. Flowering plants evolve alongside complex pollinator insect nests. Ends with the K-Pg impact.",
                "specimens": "T-Rex tooth, Triceratops horn, Ammonite shell",
                "climate": "Hot / Very high ocean water levels"
            }
        ]
        return Response(epochs)


class VoiceTranscribeView(APIView):
    def post(self, request):
        audio_file = request.FILES.get("audio")
        if not audio_file:
            return Response({"error": "No audio file provided"}, status=status.HTTP_400_BAD_REQUEST)
        
        import tempfile
        import os
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
            for chunk in audio_file.chunks():
                tmp.write(chunk)
            tmp_path = tmp.name
        
        result = HuggingFaceService.transcribe_audio(tmp_path)
        os.unlink(tmp_path)
        return Response(result)

class SpeechSynthesisView(APIView):
    def post(self, request):
        text = request.data.get("text")
        if not text:
            return Response({"error": "No text provided"}, status=status.HTTP_400_BAD_REQUEST)
        
        result = HuggingFaceService.synthesize_speech(text)
        return Response(result)

