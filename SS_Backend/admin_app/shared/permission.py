from functools import wraps
 
from django.http import JsonResponse
 
 
def admin_required(view_func):
    """
    Usage:
 
        @api_view(['GET'])
        @admin_required
        def customer_list(request):
            ...
 
    Order: @api_view on top (outermost), @admin_required right above
    the function (innermost, checked first).
    """
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        user = getattr(request, 'id', None)
 
        if not user:
            return JsonResponse({'error': 'Authentication required'}, status=401)
 
        if user.role != 'admin':
            return JsonResponse({'error': 'Admin access required'}, status=403)
 
        return view_func(request, *args, **kwargs)
 
    return wrapper
 