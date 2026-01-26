import jwt
from django.conf import settings
from django.http import JsonResponse
from SS_BackendApp.models import UserModel ,refreshTokenStore   # <-- Tumhari custom user table
from SS_BackendApp.utils import generateJWT
import uuid
from datetime import datetime, timedelta
from bson import ObjectId
from SS_BackendApp.utils.getIPAddress import get_client_ip
from jwt.exceptions import (
    ExpiredSignatureError
)


class JWTMiddleware:

    def __init__(self, get_response):
        self.get_response = get_response
        print("JWT Middleware Loaded")



    def __call__(self, request):
        if(request.path not in ["/login/","/signup/","/verify/","/logout/","/orderdetails/","/account/","/cart/","/"]):
             print('1')
             return self.get_response(request)

        elif (request.path in ["/login/", "/signup/","/verify/"] or request.path.startswith("/admin/")):
            return self.get_response(request)
        
        auth_header = request.headers.get("Authorization")
        print(1)
        print(auth_header)

        token = None
        
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
        
        print(token)
        refreshToken = request.COOKIES.get("refresh_token",None)
        print(refreshToken)
        
       
        try:
            print('enter in try')
            payload = jwt.decode(
                token,
                settings.SECRET_KEYS,
                algorithms=["HS256"]
            )

            user_id = ObjectId(payload.get("user_id"))
                    
            # Custom user model se user fetch

            user=UserModel.objects.filter(id=user_id).first()
            if(not user):
                return JsonResponse({'error':'user does not exist'},status=401)
            print(1)
            request.id= user
            request.access_token=token
            request.refresh_token=None
            

        except:
            print(2)
            try:
                payload = jwt.decode(refreshToken,settings.SECRET_KEYS,algorithms=["HS256"])
                print(3)
                ipAddress=get_client_ip(request)
                print(type(ObjectId(payload.get('user_id'))))
                print(payload.get('user_jti'))
                jti=payload.get('user_jti')
                print(ipAddress)
                print(list(refreshTokenStore.objects.values_list("jti", flat=True)))
                user= refreshTokenStore.objects.filter(jti=jti,user_id=payload.get('user_id')).first()
                print(4)
                print(user)
                if(not user):
                    print(5)
                    request.user=None
                elif(refreshToken==user.token):
                    print(6)
                    jti=uuid.uuid4().hex
                    expiry_at=datetime.utcnow() + timedelta(days=6)
                    created_at=datetime.utcnow()
                    print(7)
                    refreshToken1 =generateJWT.generate_RefreshJwt(str(user.user_id),ipAddress,jti,expiry_at,created_at)
                    accessToken1=generateJWT.generate_AccessToken(str(user))
                    
                    user.delete()
                    User=refreshTokenStore.objects.create(user_id=ObjectId(payload.get('user_id')),jti=jti,token=refreshToken1,expires_at=expiry_at,ip_address=ipAddress)
                    print(8)
                    User.save()
                    user=UserModel.objects.filter(id=User.user.id).first()

                    request.id=user
                  
                    request.access_token=accessToken1
                    request.refresh_token=refreshToken1
                else:
                    request.userData=None
            except ExpiredSignatureError:
                payload = jwt.decode(
                    refreshToken,
                    settings.SECRET_KEYS,
                    algorithms=["HS256"],
                    options={"verify_exp": False}
                    )
                refreshTokenStore.objects.filter(user_id=ObjectId(payload.get('user_id')),jti=str(payload.get('jti'))).delete()
                request.userData=None
                
            except:
                request.userData=None
            
            
        
    


        
        response = self.get_response(request)
        return response
