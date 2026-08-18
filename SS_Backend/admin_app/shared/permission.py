from functools import wraps
 
from django.http import JsonResponse
 
 
def admin_required(view_func):
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        user = getattr(request, 'id', None)
 
        if not user:
            return JsonResponse({'error': 'Authentication required'}, status=401)
 
        if user.role != 'admin':
            return JsonResponse({'error': 'Admin access required'}, status=403)
 
        return view_func(request, *args, **kwargs)
 
    return wrapper
 