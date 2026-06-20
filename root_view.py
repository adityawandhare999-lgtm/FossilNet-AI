from django.http import JsonResponse

def root_view(request):
    return JsonResponse({
        "name": "FossilNet AI Intelligence Core",
        "status": "Operational",
        "endpoints": {
            "api": "/api/",
            "admin": "/admin/"
        }
    })
