import jwt
from django.conf import settings
from datetime import datetime, timedelta

def generate_RefreshJwt(user,ipAddress,jti,expiry_at,created_at):
    payload = {
        'user_jti':jti ,
        "user_id": user,
        "ip_Address":ipAddress,
        "exp": expiry_at,
        "iat": created_at, 
        
    }

    token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")
    return token

def generate_AccessToken(user):
    try:
        user=user.id
    except:
        user=user
    payload={
        "user_id":str(user),
        "exp":datetime.utcnow() + timedelta(days=2),
        "iat":datetime.utcnow()
    }

    token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")
    return token
