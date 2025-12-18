from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import JsonResponse
import random, uuid, time
from datetime import datetime, timedelta
from django.views.decorators.csrf import csrf_exempt
from .models import UserModel, refreshTokenStore,Product,Order
from .serializer import userSerializer,productSerializer, orderSerializer
from .utils import generateJWT, getIPAddress
from django.contrib.auth.models import AnonymousUser
from django.middleware.csrf import get_token
from bson import ObjectId
# ===============================
# 🚀 SEND OTP
# ===============================
@api_view(["POST"])
def verifyUser(request):
    mobile = request.data.get("mobile")

    if not mobile:
        return Response({"error": "Mobile number is required"}, status=400)

    otp = random.randint(100000, 999999)

    # Save OTP for 2 minutes
    print(otp)
    request.session[str(mobile)] = {
        "otp": otp,
        "expires": time.time() + 120
    }

    return Response({
        "mobile": mobile,
        "otp": otp,        # REMOVE IN PRODUCTION
        "message": "OTP sent successfully"
    }, status=200)



# ===============================
# 🚀 SIGNUP
# ===============================
@api_view(["POST"])
def signup(request):
    
    mobile = request.data.get("mobile")
    otp = request.data.get("otp")

    if not mobile or not otp:
        return Response({"error": "Mobile & OTP required"}, status=400)

    # SESSION OTP CHECK
    sessionData = request.session.get(str(mobile))

    if not sessionData:
        return Response({"error": "OTP expired"}, status=400)

    if time.time() > sessionData["expires"]:
        return Response({"error": "OTP expired"}, status=400)

    if int(otp) != int(sessionData["otp"]):
        return Response({"error": "Invalid OTP"}, status=400)

    # User already exists?
    if UserModel.objects.filter(mobile_no=mobile).exists():
        return Response({"error": "User already exists"}, status=400)
    print(3)
    # Create new user
    user = UserModel.objects.create(mobile_no=mobile,name='abhishek')
    
    user.save()
    print(type(user))
    user_data = userSerializer(user).data
    print(user_data)
    # Generate tokens
    accessToken = generateJWT.generate_AccessToken(user)
    ip = getIPAddress.get_client_ip(request)
    jti = uuid.uuid4().hex
    expiry_at = datetime.utcnow() + timedelta(days=6)
    created_at = datetime.utcnow()

    refreshToken = generateJWT.generate_RefreshJwt(str(user), ip , jti , expiry_at, created_at)
    print(refreshToken)
    # eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4YjNjMDM0OTVjZDc0OWU5OTM1MGIzOWYwOTg3MjQ4YyIsInVzZXJfaWQiOiI2OTQ0MGRmMjY5ZDU1ZjQzYjdlMTJmZGIiLCJpcF9BZGRyZXNzIjoiMTI3LjAuMC4xIiwiZXhwIjoxNzY2NTg2MDk4LCJpYXQiOjE3NjYwNjc2OTh9.6SPHHo9DOUTqs5Zx0zCYrptkZwzCWKvKxiFCLxOKXGE
    # Save refresh token
    refreshtoken=refreshTokenStore.objects.create(
        user=user,
        jti=str(jti),
        token=str(refreshToken),
        expires_at=expiry_at,
        ip_address=ip
    )
    refreshtoken

    response=Response({
        "message": "Signup successful",
        "user": user_data,
        "accessToken": accessToken,
        "refreshToken": refreshToken
    },status=200)
    response.set_cookie(key="refresh_token",        # cookie name
        value=refreshToken,        # value
        httponly=True,              # JS se access nahi
        secure=False,               # localhost → False, prod → True
        samesite="Lax",             # CSRF protection
        max_age=6 * 24 * 60 * 60    # seconds (6 days))
    )
    return response

        # print("Signup Error:", e)
        # return Response({"error": "Something went wrong"}, status=500)



# ===============================
# 🚀 LOGIN
# ===============================
@csrf_exempt
@api_view(["POST"])
def login(request):    
    mobile = request.data.get("mobile")

    if not mobile:
        return Response({"error": "Mobile number required"}, status=400)

    # Check user exists
    user = UserModel.objects.filter(mobile_no=mobile).first()
    if not user:
        return Response({"error": "User does not exist"}, status=404)
    print(type(user),user.id)
    serializer=userSerializer(user)
    # Generate tokens
    accessToken = generateJWT.generate_AccessToken(user.id)
    print(1)
    ip = getIPAddress.get_client_ip(request)
    jti = str(uuid.uuid4().hex)
    expiry_at = datetime.utcnow() + timedelta(days=6)
    created_at = datetime.utcnow()

    refreshToken = generateJWT.generate_RefreshJwt(str(user.id), ip, jti, expiry_at, created_at)
    print(2)
    # Delete old refresh tokens
    refreshTokenStore.objects.filter(user=user.id, ip_address=ip).delete()
    print(3)
    # Save new refresh token
    refreshTokenStore.objects.create(
        user=user,
        jti=jti,
        token=refreshToken,
        expires_at=expiry_at,
        ip_address=ip
    )
    response = Response({
        "message": "Login successful",
        "user":serializer.data,
        "accessToken": accessToken
    },
        status=200)


    response.set_cookie(
        key="refresh_token",        # cookie name
        value=refreshToken,        # value
        httponly=True,              # JS se access nahi
        secure=False,               # localhost → False, prod → True
        samesite="Lax",             # CSRF protection
        max_age=6 * 24 * 60 * 60    # seconds (6 days)
    )
    print(4)
    
    return response


def logout_view(request):
    response = JsonResponse({"message": "Logged out"})
    response.delete_cookie("refresh_token")
    return response

@csrf_exempt
@api_view(["GET"])
def home(request):
    if getattr(request, "id", None):
        data=userSerializer(request.id).data
        userData= data
        refreshToken=request.refresh_token
        accessToken=request.access_token
    
        userJson={
            'userData':userData,
            'access_Token':accessToken
        }
    elif(getattr(request, "userData", None) is None):
        refreshToken=None
        userJson= {'error':'token invalid'}
    try:
        products = Product.objects.order_by('-updated_at')[:2]
        dataProducts=productSerializer(products, many=True).data
        josn_data={
            'userData':userJson,
            'productData':dataProducts
        }
    
        response=Response(josn_data,status=200)
    
        if(refreshToken is not None):
            response.set_cookie(
            key="refresh_token",        # cookie name
            value=refreshToken,        # value
            httponly=True,              # JS se access nahi
            secure=False,               # localhost → False, prod → True
            samesite="Lax",             # CSRF protection
            max_age=6 * 24 * 60 * 60    # seconds (6 days)
            )
            return response
        else:
            return response
        
    except Exception as e:
        json_data={
            'userData':userJson,
            'productData':'product not found'
        }
        response=Response(json_data,status=400)
        if(refreshToken is not None):
            response.set_cookie(
            key="refresh_token",        # cookie name
            value=refreshToken,        # value
            httponly=True,              # JS se access nahi
            secure=False,               # localhost → False, prod → True
            samesite="Lax",             # CSRF protection
            max_age=6 * 24 * 60 * 60    # seconds (6 days)
            )
            return response
        else:
            return response
        
        
@api_view(["GET","POST"])
def orders(request):
    if getattr(request, "id", None):
        data=userSerializer(request.id).data
        print(2)
        userData= data
        refreshToken=request.refresh_token
        accessToken=request.access_token
        userJson={
            'userData':userData,
            'access_Token':accessToken
        }
    else:
        print('user none')
        userJson= {'error':'token invalid'}
        return Response(userJson,status=401)
    

    try:
        userOrder=Order.objects.filter(customerID=request.id)
        print(1)
        userOrderSerializer=orderSerializer(userOrder,many=True)
        userOrderData=userOrderSerializer.data
        print(userOrderData[0]['productID']['product_ids'])
        print(2)
        for order in userOrderData:
            for product_Data in order['productID']['product_ids']:
                productid=product_Data['product_id']
                product_obj = Product.objects.filter(
                id=ObjectId(productid)
            ).first()
                print(type(str(product_obj.id)))
                productDetail=productSerializer(product_obj).data
                product_Data['product_id']=productDetail
                product_Data['product_id']['id']=str(product_obj.id)
            print('product')
        response=Response({'userOrderData':userOrderData, 'userData':userJson},status=200)
        if(refreshToken is not None):
            response.set_cookie(
            key="refresh_token",        # cookie name
            value=refreshToken,        # value
            httponly=True,              # JS se access nahi
            secure=False,               # localhost → False, prod → True
            samesite="Lax",             # CSRF protection
            max_age=6 * 24 * 60 * 60    # seconds (6 days)
            )
            return response
        else:
            return response

    
    except Exception as e:
        json_data={
            'userData':userJson,
            'orderData':f'orders not found {e} '
        }
        response=Response(json_data,status=400)
        if(refreshToken is not None):
            response.set_cookie(
            key="refresh_token",        # cookie name
            value=refreshToken,        # value
            httponly=True,              # JS se access nahi
            secure=False,               # localhost → False, prod → True
            samesite="Lax",             # CSRF protection
            max_age=6 * 24 * 60 * 60    # seconds (6 days)
            )
            return response
        else:
            return response
       
    



