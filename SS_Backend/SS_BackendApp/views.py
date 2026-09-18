from django.db.models import F
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import JsonResponse
import random, uuid, time
from django.views.decorators.http import require_POST
from datetime import datetime, timedelta
from django.core.mail import EmailMessage
from django.views.decorators.csrf import csrf_exempt
from .models import UserModel, refreshTokenStore,Products,Order,ProductVariant,VariantSize
from .models import *
from . import models
from decimal import Decimal
import requests
from .serializer import userSerializer,productSerializer, orderSerializer,cartSerializer,variantSizeSerializer
from django.db.models import Q
from .utils import generateJWT, getIPAddress
from django.contrib.auth.models import AnonymousUser
from django.middleware.csrf import get_token
from bson import ObjectId
import json
import jwt
import re
from django.conf import settings
from django.core.files.base import ContentFile
from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests as google_requests
from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives
import math
import razorpay
import hmac
import hashlib
from django.conf import settings



client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))


# ===============================
# 🚀 SEND OTP
# ===============================
@csrf_exempt
@api_view(["POST"])
def verifyUser(request):


    recp_email = request.data.get("email", "").strip()




    


    email_regex = r"^[^\s@]+@[^\s@]+\.[^\s@]+$"
    if not re.match(email_regex, recp_email):
        return Response(
            {"success": False, "error": "Invalid email address."},
            status=400,
        )
    



    if not recp_email:
        return Response({"error": "Email is required"}, status=400)

    otp = random.randint(100000, 999999)
    html = render_to_string(
    "emails/otpEmailTemp.html",
    {
        "email": recp_email,
        "otp": otp,
        "year": 2026,
    },
)

    # Save OTP for 2 minutes
    print(otp)
    print(recp_email)


    request.session[str(recp_email)] = {
        "otp": otp,
        "expires": time.time() + 120
    }
    print("VERIFY SESSION KEY:", request.session.session_key)
    print(request.session.get(str(recp_email)))
    try:
        msg = EmailMultiAlternatives(
    subject="Your OTP Verification Code",
    body="Your OTP is {}".format(otp),
    from_email="kumarabhishekasdf1234@gmail.com",
    to=[recp_email],
)
        msg.attach_alternative(html, "text/html")
        msg.send()
    except Exception as e:
        print(e)
        return Response({"error":"email can't be send"}, status=500)



    return Response({
        "email": recp_email,
        "otp": otp,        # REMOVE IN PRODUCTION
        "message": "OTP sent successfully"
    }, status=200)



# ===============================
# 🚀 SIGNUP
# ===============================
@csrf_exempt
@api_view(["POST"])
def signup(request):
    
    email = request.data.get("email")
    otp = request.data.get("otp")

    print(otp)
    print(email)

    if not email or not otp:
        return Response({"error": "Mobile & OTP required"}, status=400)

    # SESSION OTP CHECK
    sessionData = request.session.get(str(email))
    print(sessionData)
    if not sessionData:
        print(1)
        return Response({"error": "OTP expired"}, status=400)

    if time.time() > sessionData["expires"]:
        print(2)
        return Response({"error": "OTP expired"}, status=400)

    if int(otp) != int(sessionData["otp"]):
        print(3)
        return Response({"error": "Invalid OTP"}, status=400)

    # User already exists?
    print(3)
    # Create new user
    genRefreshToken=None
    user = UserModel.objects.filter(email=email).first()
    ip = getIPAddress.get_client_ip(request)
    jti = uuid.uuid4().hex
    expiry_at = datetime.utcnow() + timedelta(days=6)
    created_at = datetime.utcnow()
    if(not user):
        user=UserModel.objects.create(email=email)
        user_data = userSerializer(user).data
        genRefreshToken=generateJWT.generate_RefreshJwt(str(user.id), ip , jti , expiry_at, created_at)
        message='account is created'

    user_data = userSerializer(user).data
    if(not genRefreshToken):
        print(1)
        message='login is successful'
        print('signin' , jti)
        print(str(jti))
        genRefreshToken = generateJWT.generate_RefreshJwt(str(user.id), ip, jti, expiry_at, created_at)
       
        
    print(type(user))
    print(user_data)
    # Generate tokens
    accessToken = generateJWT.generate_AccessToken(user)

   
  # Save refresh token
    refreshTokenStore.objects.create(
        user=user,
        jti=str(jti),
        token=str(genRefreshToken),
        expires_at=expiry_at,
        ip_address=ip
    )
    request.session.pop(str(email), None)

    response=Response({
        "message": message,
        "userData": user_data,
        "accessToken": accessToken
    },status=200)
    print(genRefreshToken)
    response.set_cookie(key="refresh_token",        # cookie name
        value=genRefreshToken,        # value
        httponly=True,              # JS se access nahi
        secure=True,               # localhost → False, prod → True
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


@csrf_exempt
def logout_view(request):
    try:

        userid=request.id 
        print("abhi123")
        print(request.refresh_token)
        if(request.refresh_token==None):
            print('cookies')
            refreshToken = request.COOKIES.get("refresh_token",None)
        else:
            print('refresh')
            refreshToken=request.refresh_token
        print(refreshToken)
        payload = jwt.decode(
        refreshToken,
        settings.SECRET_KEYS,
        algorithms=["HS256"],
        options={"verify_exp": False}
    )
        delRefreshToken=refreshTokenStore.objects.filter(user=request.id, jti=payload.get('user_jti')).first()
        delRefreshToken.delete()


        response = JsonResponse({"message": "Logged out"})

        response.delete_cookie("refresh_token")
        return response
    except Exception as e:
        response = JsonResponse({"message": "error in Logged out"},status=401)

        response.delete_cookie("refresh_token")
        return response

@csrf_exempt
@api_view(["GET",'PATCH'])
def account(request):
    if getattr(request, "id", None):
        if(request.method=='PATCH'):

            serializer=userSerializer(request.id, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                userData=serializer.data
            else:
                userJson= {'error':'Invalid data found'}
            userData=serializer.data

        else:
            data=userSerializer(request.id)
            userData= data.data
        refreshToken=request.refresh_token
        accessToken=request.access_token
    
        userJson={
            'userData':userData,
            'access_Token':accessToken
        }
    elif(getattr(request, "userData", None) is None):
        userJson= {'error':'token invalid'}
        response=Response(userJson, status = 400)
        response.set_cookie( key="refresh_token",        # cookie name
            value=None,        # value
            httponly=True,              # JS se access nahi
            secure=False,               # localhost → False, prod → True
            samesite="Lax",             # CSRF protection
              # seconds (6 days)
            )
        return response
    response=Response(userJson,status=200)
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
    return response
    
    
@csrf_exempt
@api_view(["GET"])
def home(request):
    NoneRefreshToken=False
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
        NoneRefreshToken=True
        userJson= {'error':'token invalid'}
    try:
        qs = (
    VariantSize.objects
    .select_related("variant__product__category")
    .filter(
        stock__gt=0,
        variant__is_active=True,
        variant__product__is_active=True,
    )
    .order_by("-updated_At", "price")
)

        result = {}

        for vs in qs:
            product = vs.variant.product
            category_name = product.category.name
            category_id=str(product.category.id)
            product_id = str(product.id)

            if category_name not in result:
                result[category_name] = {}

            # har product ka sirf ek (cheapest) variant
            if product_id not in result[category_name]:
                result[category_name][product_id] = {
                    "variant_id": str(vs.variant.id),
                    "product_id": product_id,
                    "product_name": product.name,
                    "brand": product.brand,
                    "color": vs.variant.color,
                    "description": product.description,
                    "price": vs.price,
                    "image": vs.variant.image.url if vs.variant.image else None,
                    "updated_at": vs.updated_At
                    
                    # "category_id":product_id.category
                }

            # har category me sirf 10 products
            if len(result[category_name]) == 10:
                continue

        final_response = {}

        for category, products in result.items():
            final_response[category] = list(products.values())


        json_data={
            **userJson,
            'productData':final_response     
        }
    
        response=Response(json_data,status=200)
        if(NoneRefreshToken):
            response=Response(json_data,status=400)
            response.set_cookie( key="refresh_token",        # cookie name
            value=None,                                      # value
            httponly=True,                                   # JS se access nahi
            secure=False,                                    # localhost → False, prod → True
            samesite="Lax",                                  # CSRF protection
            )
            return response
        
        elif(refreshToken is not None):

            response.set_cookie(
            key="refresh_token",        # cookie name
            value=refreshToken,         # value
            httponly=True,              # JS se access nahi
            secure=False,               # localhost → False, prod → True
            samesite="Lax",             # CSRF protection
            max_age=6 * 24 * 60 * 60    # seconds (6 days)
            )

            return response
        
        else:
            return response
        
        
    except Exception as e:
        print(e)
        json_data={
          **userJson,
            'productData':'product not found'
        }
        response=Response(json_data,status=200)
        if(NoneRefreshToken):
            response=Response(json_data,status=400)

            response.set_cookie( key="refresh_token",        # cookie name
            value=None,        # value
            httponly=True,              # JS se access nahi
            secure=False,               # localhost → False, prod → True
            samesite="Lax",             # CSRF protection
    
            )
            return response
    
        elif(refreshToken is not None):
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



@csrf_exempt       
@api_view(["GET","POST"])
def orders(request):
    if getattr(request, "id", None):
        data=userSerializer(request.id).data
        print(2)
        userData= data
        print(userData)
        refreshToken=request.refresh_token
        accessToken=request.access_token
        userJson={
            'userData':userData,
            'access_Token':accessToken
        }
    else:
        print('user none')
        userJson= {'error':'token invalid'}
        response= Response(userJson,status=401)
        response.set_cookie( key="refresh_token",        # cookie name
                            
                            
            value=None,        # value
            httponly=True,              # JS se access nahi
            secure=False,               # localhost → False, prod → True
            samesite="Lax",             # CSRF protection
            
            )
        return response
    

    try:
        if request.method=='GET':
            userOrder=Order.objects.filter(customerID=request.id)
            print(1)
            userOrderSerializer=orderSerializer(userOrder,many=True)
            userOrderData=userOrderSerializer.data
        
                    

            response=Response({'userOrderData':userOrderData, **userJson},status=200)
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
        print('error',e)
        json_data={
            **userJson,
            'userorderData':[],
            'error' : str(e)
        }
        response=Response(json_data,status=200)
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
@csrf_exempt           
@api_view(['GET','PATCH','DELETE','POST'])
def cart(request):
    cart_detail=[]
    error = None
    removed_count = None
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
        response= Response(userJson,status=401)
        response.set_cookie( 
            key="refresh_token",        # cookie name
            value=None,        # value
            httponly=True,              # JS se access nahi
            secure=False,               # localhost → False, prod → True
            samesite="Lax",             # CSRF protection
            
            )
        return response
    try:
        
        cart_item=request.get_signed_cookie("cart", salt="cart_salt")

        
        cart_item=json.loads(cart_item)
        if(ObjectId(cart_item['customerId'])!=request.id.id):
        
            raise Exception("User not authenticated")
        print(2)
    except:
        try:
            data = models.cart.objects.get(customerId=request.id)
            

        except:
            data=models.cart.objects.create(customerId=request.id)
            data.cartItem={
                'cartData':[],
                'customerId':str(request.id)
            }
            data.save()
        serializer=cartSerializer(data)
        cart_item=serializer.data['cartItem']
    

            
    try:
        if (request.method=='POST'):
            qty = request.data.get('qty')
            product_id=request.data.get('product_id')
            stock = VariantSize.objects.filter(id=ObjectId(product_id)).first().stock
            if(int(qty)<int(stock)):
                # error={'error':"out of stock to add the product"}

            
                    
                 
                
                print(cart_item,'productid',product_id)
                item=None
                for product in cart_item['cartData']:
                    
                    if product['product_id']==product_id:

                        error="product already exist into the cart"
                        item=product   
                        break                  
                if item is None:
                    cart_item['cartData'].append(
                        {'product_id':product_id,
                        'qty':qty}
                    )
                    cart = models.cart.objects.filter(customerId=request.id).first()

                    if cart:
                        cart.cartItem= cart_item
                        cart.save()
                        cart_item = cart.cartItem

            else:
                error='Product is out of stock.!Please the decrease the quantity of product'
                    

        
        elif(request.method=='PATCH'):
            # index=int(request.data.get('index'))
            productID=request.data.get('product_id')
            qty=int(request.data.get('qty'))
            action = request.data.get('action')
            stock = VariantSize.objects.filter(id=ObjectId(productID)).first().stock
            
            if(int(stock)>int(qty)):

                cart_item["cartData"] = [
        {**item, "qty": qty} if item["product_id"] == productID else item
        for item in  cart_item["cartData"]
    ]
                # cart_item["cartData"][index]["qty"]=qty
                cart = models.cart.objects.filter(customerId=request.id).first()
                if cart:
                    cart.cartItem= cart_item 
                    cart.save()

                cart_item = cart.cartItem

            else:
                error='Product is out of stock.!Please the decrease the quantity of product'
        

            
        elif request.method == 'GET':
            cart_detail = []
            valid_cart_data = []
            removed_any = False
            
          
        

            

            for product_item in cart_item['cartData']:
                try:
                    product_pk = ObjectId(product_item['product_id'])
                except Exception:
                    removed_any = True
                    
                    continue
               
                data = VariantSize.objects.filter(
                    pk=product_pk,
                    variant__is_active=True,
                    variant__product__is_active=True,
                    stock__gt=product_item['qty'],
                ).select_related("variant__product__category").first()
               
                if data is None:
                    removed_any = True
                    
                    removed_count = removed_count if removed_count is not None else 1
                    
                    continue

                serializer = variantSizeSerializer(data)
                
                cart_data = serializer.data
                

                

                
                cart_data['qty'] = product_item['qty']
                
                cart_data['product_id'] = str(data.id)
               
                cart_detail.append(cart_data) 
                
                valid_cart_data.append(product_item)
               

            if removed_any:
               
                updated_cart_item = dict(cart_item)
                
                updated_cart_item['cartData'] = valid_cart_data
                


                try:
                    updated_count = models.cart.objects.filter(
                        customerId=cart_item['customerId']
                    ).update(cartItem=updated_cart_item)
                    
                except Exception as e:
                    updated_count = 0
                    
                    # log e somewhere, e.g. logger.exception("cart sync failed")

                if updated_count == 0:
                    # DB sync fail — return raw cart_detail anyway,
                    # but flag it so frontend/logs know cart wasn't persisted
                    # (log this — silent stale cart is a real bug source)
                    cart_item = models.cart.objects.filter(customerId=cart_item['customerId']).first().cartItem
                    
                else:
                    
                    cart_item = updated_cart_item 
  



        elif(request.method=='DELETE'):
            print('delete')
            productID=request.data.get('product_id')
            print(productID)
            print(cart_item)
            cart_item["cartData"]=list(
                filter(
                    lambda item:item['product_id']!=productID,cart_item["cartData"]
                    )
                    )
            cart = models.cart.objects.filter(customerId=request.id).first()
            if cart:
                cart.cartItem= cart_item
                try:
                    cart.save()
                    cart_item = cart.cartItem
                except:
                    cart_item = cart.cartItem
                    


        

        response=Response({'cart_item':cart_item,'cart_Detail':cart_detail,'error':error,'removed_count':removed_count if removed_count else None, **userJson},status=200)
        response.set_signed_cookie(
    key="cart",
    value=json.dumps(cart_item),          # list / dict
    salt="cart_salt",
    max_age=7 * 24 * 60 * 60, # 7 days
    httponly=True,
    samesite="Lax",
    )
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
    except Exception as e :
        print(e)
        json_data={
            **userJson,
            
            'cart_item':[],
            'cart_Detail':[],
        }
        response=Response(json_data,status=200)
        response.set_signed_cookie(
    key="cart",
    value=None,          # list / dict
    salt="cart_salt_v1",
    max_age=7 * 24 * 60 * 60, # 7 days
    httponly=True,
    samesite="Lax",
)
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

@csrf_exempt
@api_view(['GET'])
def productDetail(request, id):
    NoneRefreshToken=False
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
        NoneRefreshToken=True
        userJson= {'error':'token invalid'}
    try:
        variant = ProductVariant.objects.select_related(
    "product"
).prefetch_related(
    "sizes"
).get(id=id)

        product = variant.product
        if(product.is_active==False):
            raise Exception("Product is not active or delete")
    
        all_variants = (
                product.variants
                .filter(is_active=True, sizes__isnull=False)
                .distinct()
                .prefetch_related("sizes")
            )
        print(all_variants)
        if(not all_variants):
            raise Exception('product of its variant or size are not active or delete')
        result = {
            "product_name": product.name,
            "product_id": str(product.id),
            "brand": product.brand,
            "description": product.description,
            "variants": []   # list, not dict
        }
        

        for v in all_variants:
            sizes = v.sizes.all()
            if(not sizes):
               continue
            variant_data = {
                "variant_id": str(v.id),
                "color": v.color,
                "image": v.image.url if v.image else None,
                "sizes": []
            }
            for size in sizes:
                variant_data["sizes"].append({
                    "size_id":str(size.id),
                    "size": size.size,
                    "price": size.price,
                    "stock": size.stock
                })

            result["variants"].append(variant_data)



        json_data={
            **userJson,
            'productData':result     
            
        }
    
        response=Response(json_data,status=200)
    
        if(NoneRefreshToken):
            response=Response(json_data,status=400)
            response.set_cookie( key="refresh_token",        # cookie name
            value=None,                                      # value
            httponly=True,                                   # JS se access nahi
            secure=False,                                    # localhost → False, prod → True
            samesite="Lax",                                  # CSRF protection
            )
            return response
        
        elif(refreshToken is not None):

            response.set_cookie(
            key="refresh_token",        # cookie name
            value=refreshToken,         # value
            httponly=True,              # JS se access nahi
            secure=False,               # localhost → False, prod → True
            samesite="Lax",             # CSRF protection
            max_age=6 * 24 * 60 * 60    # seconds (6 days)
            )

            return response
        
        else:
            return response
        
        
    except Exception as e:
        print("hello",e)
        json_data={
          **userJson,
        'productData': None,
        "message":str(e)
        }
        response=Response(json_data,status=200)
        if(NoneRefreshToken):
            response=Response(json_data,status=400)

            response.set_cookie( key="refresh_token",        # cookie name
            value=None,        # value
            httponly=True,              # JS se access nahi
            secure=False,               # localhost → False, prod → True
            samesite="Lax",             # CSRF protection
    
            )
            return response
    
        elif(refreshToken is not None):
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

@csrf_exempt  
@api_view(["GET"])
def product_list(request):
    """
    Search + Filter + Sort products, paginated.
    Returns cheapest/first in-stock variant per product for the requested page.
    """
 
    # -------------------------
    # BASE QUERYSET
    # -------------------------
    qs = VariantSize.objects.select_related(
        "variant__product__category"
    ).filter(
        stock__gt=0, 
        variant__is_active=True,
        variant__product__is_active=True,

    )
 
    # -------------------------
    # SEARCH
    # ?search=tshirt
    # -------------------------
    search = (request.GET.get("search") or "").strip()
    if search:
        keywords = search.split()
        search_q = Q()
 
        for word in keywords:
            search_q &= (
                Q(variant__product__name__icontains=word) |
                Q(variant__product__brand__icontains=word) |
                Q(variant__product__category__name__istartswith=word) |
                Q(variant__product__gender__icontains=word) |
                Q(variant__color__icontains=word) |
                Q(size__istartswith=word)
            )
 
        qs = qs.filter(search_q)
 
    # -------------------------
    # SIZE FILTER
    # ?size=M_32
    # -------------------------
    size = request.GET.get("size")
    if size:
        qs = qs.filter(size__istartswith=size)
 
    # -------------------------
    # GENDER FILTER
    # ?gender=male
    # -------------------------
    gender = request.GET.get("gender")
    if gender:
        qs = qs.filter(variant__product__gender__istartswith=gender)
 
    # -------------------------
    # PRICE FILTER
    # ?min_price=500&max_price=1500
    # -------------------------
    min_price = request.GET.get("min_price")
    max_price = request.GET.get("max_price")
 
    if min_price:
        qs = qs.filter(price__gte=min_price)
 
    if max_price:
        qs = qs.filter(price__lte=max_price)
 
    # -------------------------
    # SORTING
    # ?order=latest | price_low | price_high
    # -------------------------
    order = request.GET.get("order")
 
    if order == "price_low":
        qs = qs.order_by("price")
    elif order == "price_high":
        qs = qs.order_by("-price")
    else:
        # default: latest updated variant size
        qs = qs.order_by("-updated_At", "price")
 
    # -------------------------
    # GROUP BY PRODUCT VARIANT
    # (cheapest/first in-stock size per variant, in the sorted order above)
    # -------------------------
    products_map = {}
 
    for vs in qs:
        variant = vs.variant
        variant_id = str(variant.id)
 
        if variant_id not in products_map:
            products_map[variant_id] = {
                "product_id": str(variant.product.id),
                "product_name": variant.product.name,
                "brand": variant.product.brand,
                "category": variant.product.category.name,
                "description": variant.product.description,
                "price": vs.price,
                "image": vs.variant.image.url if vs.variant.image else None,
                "variant_id": str(vs.variant.id),
                "color": vs.variant.color,
            }
 
    all_products = list(products_map.values())
    total_count = len(all_products)
 
    # -------------------------
    # PAGINATION
    # ?page=1&page_size=5
    # (grouping happens in Python above, so pagination is applied
    #  after grouping — not as a DB-level LIMIT/OFFSET)
    # -------------------------
    try:
        page = int(request.GET.get("page", 1))
    except (TypeError, ValueError):
        page = 1
    if page < 1:
        page = 1
 
    try:
        page_size = int(request.GET.get("page_size", 15))
    except (TypeError, ValueError):
        page_size = 15
    if page_size < 1:
        page_size = 15
 
    total_pages = math.ceil(total_count / page_size) if total_count else 1
    # clamp page so an out-of-range page number doesn't return an empty slice silently
    if page > total_pages:
        page = total_pages
 
    start = (page - 1) * page_size
    end = start + page_size
    page_products = all_products[start:end]
 
    # -------------------------
    # FINAL RESPONSE
    # -------------------------
    return Response({
        "count": total_count,
        "total_count": total_count,
        "total_pages": total_pages,
        "page": page,
        "page_size": page_size,
        "products": page_products,
    })
 
@csrf_exempt
def download_google_profile_image(picture_url, email):
    """
    Downloads the profile picture from Google's URL and returns a
    ContentFile ready to be assigned to an ImageField. Because your
    ImageField's storage backend is already configured for S3, saving
    the model will automatically upload this file to your S3 bucket
    under 'profile_image/' (as defined in upload_to).
    """
    if not picture_url:
        return None
 
    response = requests.get(picture_url, timeout=5)
    if response.status_code != 200:
        return None
 
    # filename doesn't need to be fancy, Django will handle uniqueness on S3
    file_name = f"{email.split('@')[0]}_google.jpg"
    return ContentFile(response.content, name=file_name)
 
@csrf_exempt
@api_view(["POST"])
def googleAuthentication(request):
    print('1234')
    ID_Token = request.data.get("id_token")
    print(ID_Token)
 
    if not ID_Token:
        return Response({"error": "id_token is required."}, status=400)
 
    try:
        idinfo = google_id_token.verify_oauth2_token(
            ID_Token, google_requests.Request(), settings.GOOGLE_OAUTH_CLIENT_ID
        )
    except ValueError:
        return Response({"error": "Invalid Google token."}, status=400)
 
    email = idinfo.get("email")
    name = idinfo.get("name", "")
    picture_url = idinfo.get("picture", "")
 
    if not email:
        return Response({"error": "Google account has no email."}, status=status.HTTP_400_BAD_REQUEST)

    genRefreshToken=None
    ip = getIPAddress.get_client_ip(request)
    jti = uuid.uuid4().hex
    expiry_at = datetime.utcnow() + timedelta(days=6)
    created_at = datetime.utcnow()
 
    try:
        # user already exists -> just log them in, don't touch image/mobile again
        user = UserModel.objects.get(email=email)
    
        message='login is successful'
        
        genRefreshToken = generateJWT.generate_RefreshJwt(str(user.id), ip, jti, expiry_at, created_at)

    except UserModel.DoesNotExist:
        # new user -> create with placeholder mobile_no, then attach the image
        user = UserModel(
            email=email,
            name=name,
            is_active=True,
        )
 
        image_file = download_google_profile_image(picture_url, email)
        if image_file:
            # assigning via .save() on the field uploads it to S3 automatically
            user.profile_image.save(image_file.name, image_file, save=False)
 
        user.save()
        
    user_data = userSerializer(user).data
    if(not genRefreshToken):
        message='Account created successfully'
        
        genRefreshToken = generateJWT.generate_RefreshJwt(str(user.id), ip, jti, expiry_at, created_at)

    print(user_data)
    # Generate tokens
    accessToken = generateJWT.generate_AccessToken(user)

   
  # Save refresh token
    refreshTokenStore.objects.create(
        user=user,
        jti=str(jti),
        token=str(genRefreshToken),
        expires_at=expiry_at,
        ip_address=ip
    )

    response=Response({
        "message": message,
        "userData": user_data,
        "accessToken": accessToken
    },status=200)
    print("generaterefresh",genRefreshToken)
    print(1)
    response.set_cookie(key="refresh_token",        # cookie name
        value=genRefreshToken,        # value
        httponly=True,              # JS se access nahi
        secure=False,               # localhost → False, prod → True
        samesite="Lax",             # CSRF protection
        max_age=6 * 24 * 60 * 60    # seconds (6 days))
    )
    return response



 
@csrf_exempt
@api_view(["POST"])
def googleOauth2Authentication(request):
    print('1234')
    code = request.data.get("code")
    print(code)

    if not code:
        return Response({"error": "code is required."}, status=400)

    # ---------------------------------------------------------
    # Code ko Google ke token endpoint pe exchange karo
    # ---------------------------------------------------------
    token_res = requests.post(
        "https://oauth2.googleapis.com/token",
        data={
            "code": code,
            "client_id": settings.GOOGLE_OAUTH_CLIENT_ID,
            "client_secret": settings.GOOGLE_OAUTH_CLIENT_SECRET,
            "redirect_uri": settings.GOOGLE_OAUTH_REDIRECT_URI,  # frontend se EXACT match
            "grant_type": "authorization_code",
        },
    )

    if token_res.status_code != 200:
        print("TOKEN EXCHANGE FAILED:", token_res.json())
        return Response(
            {"error": "Failed to exchange code with Google.", "details": token_res.json()},
            status=400,
        )

    access_token = token_res.json().get("access_token")

    # ---------------------------------------------------------
    # access_token se Google se user info maango
    # ---------------------------------------------------------
    userinfo_res = requests.get(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        headers={"Authorization": f"Bearer {access_token}"},
    )

    if userinfo_res.status_code != 200:
        return Response({"error": "Failed to fetch user info from Google."}, status=400)

    idinfo = userinfo_res.json()

    email = idinfo.get("email")
    name = idinfo.get("name", "")
    picture_url = idinfo.get("picture", "")

    if not email:
        return Response({"error": "Google account has no email."}, status=status.HTTP_400_BAD_REQUEST)

    genRefreshToken=None
    ip = getIPAddress.get_client_ip(request)
    jti = uuid.uuid4().hex
    expiry_at = datetime.utcnow() + timedelta(days=6)
    created_at = datetime.utcnow()

    try:
        # user already exists -> just log them in, don't touch image/mobile again
        user = UserModel.objects.get(email=email)
    
        message='login is successful'
        
        genRefreshToken = generateJWT.generate_RefreshJwt(str(user.id), ip, jti, expiry_at, created_at)

    except UserModel.DoesNotExist:
        # new user -> create with placeholder mobile_no, then attach the image
        user = UserModel(
            email=email,
            name=name,
            is_active=True,
        )

        image_file = download_google_profile_image(picture_url, email)
        if image_file:
            # assigning via .save() on the field uploads it to S3 automatically
            user.profile_image.save(image_file.name, image_file, save=False)

        user.save()
        
    user_data = userSerializer(user).data
    if(not genRefreshToken):
        message='Account created successfully'
        
        genRefreshToken = generateJWT.generate_RefreshJwt(str(user.id), ip, jti, expiry_at, created_at)

    print(user_data)
    # Generate tokens
    accessToken = generateJWT.generate_AccessToken(user)

  # Save refresh token
    refreshTokenStore.objects.create(
        user=user,
        jti=str(jti),
        token=str(genRefreshToken),
        expires_at=expiry_at,
        ip_address=ip
    )

    response=Response({
        "message": message,
        "userData": user_data,
        "accessToken": accessToken
    },status=200)
    print("generaterefresh",genRefreshToken)
    print(1)
    response.set_cookie(key="refresh_token",        # cookie name
        value=genRefreshToken,        # value
        httponly=True,              # JS se access nahi
        secure=False,               # localhost → False, prod → True
        samesite="Lax",             # CSRF protection
        max_age=6 * 24 * 60 * 60    # seconds (6 days))
    )
    return response


@csrf_exempt
@api_view(["POST"])
def contactUsEmail(request):
    NoneRefreshToken=False
    if getattr(request, "id", None):
        data=userSerializer(request.id).data
        userData= data
        refreshToken=request.refresh_token
        accessToken=request.access_token
       
    elif(getattr(request, "userData", None) is None):
        NoneRefreshToken=True
        
    try:
        name = request.data.get("name")
        email = request.data.get("email", "").strip()
        phone = request.data.get("phone", "").strip()
        subject = request.data.get("subject")
        message = request.data.get("message")

        email_regex = r"^[^\s@]+@[^\s@]+\.[^\s@]+$"
        phone_regex = r"^[6-9]\d{9}$"

        # Validation
        if not all([name, email, phone, subject, message]):
            print(10)
            response = Response(
                {
                    "success": False,
                    "message": "All fields are required."
                },
                status=400
            )
        if not re.match(email_regex, email):
            print(11)
            response = Response(
                {"success": False, "message": "Invalid email address."},
                status=400,
            )

        if not re.match(phone_regex, phone):
            print(12)
            response = Response(
                {"success": False, "message": "Invalid mobile number."},
                status=400,
            )

    
        else:
            html = render_to_string(
                "emails/contact_email.html",
                {
                    "name": name,
                    "email": email,
                    "phone": phone,
                    "subject": subject,
                    "message": message,
                },
            )

            email_message = EmailMultiAlternatives(
                subject=f"New Contact Request - {subject}",
                body=message,
                from_email=settings.EMAIL_HOST_USER,
                to=[settings.EMAIL_HOST_USER],   # Your email
                reply_to=[email],                # Reply goes to customer
            )

            email_message.attach_alternative(html, "text/html")
            email_message.send()

            response=Response(
                {
                    "success": True,
                    "message": "Your message has been sent successfully."
                },
                status= 200
            )

    
        
    
        if(NoneRefreshToken):
            response=Response({
                    "success": True,
                    "message": "Your message has been sent successfully."
                },status=400)
            response.set_cookie( key="refresh_token",        # cookie name
            value=None,                                      # value
            httponly=True,                                   # JS se access nahi
            secure=False,                                    # localhost → False, prod → True
            samesite="Lax",                                  # CSRF protection
            )
            return response
        
        elif(refreshToken is not None):

            response.set_cookie(
            key="refresh_token",        # cookie name
            value=refreshToken,         # value
            httponly=True,              # JS se access nahi
            secure=False,               # localhost → False, prod → True
            samesite="Lax",             # CSRF protection
            max_age=6 * 24 * 60 * 60    # seconds (6 days)
            )

            return response
        
        else:
            return response
        
        
    except Exception as e:
        print(e)
       
        response=Response({
                    "success": True,
                    "message": "Your message can't be send. Try again later"
                },status=200)
        if(NoneRefreshToken):
            response=Response({
                    "success": True,
                    "message": "Your message can't be send. Try again later"
                },status=400)

            response.set_cookie( key="refresh_token",        # cookie name
            value=None,        # value
            httponly=True,              # JS se access nahi
            secure=False,               # localhost → False, prod → True
            samesite="Lax",             # CSRF protection
    
            )
            return response
    
        elif(refreshToken is not None):
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


@api_view(['POST'])
def apply_coupon(request):
    if getattr(request, "id", None):
        data = userSerializer(request.id).data
        userData = data
        refreshToken = request.refresh_token
        accessToken = request.access_token
        userJson = {
            'userData': userData,
            'access_Token': accessToken
        }
    else:
        userJson = {'error': 'token invalid'}
        response = Response(userJson, status=401)
        response.set_cookie(
            key="refresh_token",
            value=None,
            httponly=True,
            secure=False,
            samesite="Lax",
        )
        return response

    try:
        code = request.data.get("code")
        subtotal = request.data.get("subtotal")

        if not code:
            raise Exception("Enter a coupon code")
        if subtotal is None:
            raise Exception("Invalid cart")

        subtotal = Decimal(str(subtotal))

        coupon = Coupon.objects.filter(code__iexact=code.strip(), is_active=True).first()
        if not coupon:
            raise Exception("Invalid coupon code")

        if not coupon.is_valid():
            raise Exception("This coupon is expired or no longer active")

        if subtotal < coupon.min_order_value:
            raise Exception(f"Minimum order value for this coupon is ₹{coupon.min_order_value}")

        if coupon.max_order_value > 0 and subtotal > coupon.max_order_value:
            raise Exception(f"Maximum order value for this coupon is ₹{coupon.max_order_value}")

        if coupon.discount_type == Coupon.DiscountType.FLAT:
            discount_amount = coupon.discount_value
        else:
            discount_amount = subtotal * (coupon.discount_value / Decimal('100'))
            if coupon.max_discount_amount is not None:
                discount_amount = min(discount_amount, Decimal(coupon.max_discount_amount))

        discount_amount = round(discount_amount)

        # 🔹 create_order() isi session key se match karta hai (Actual_coupon)
        request.session['couponId'] = coupon.code

        response = Response({
            **userJson,
            'valid': True,
            'code': coupon.code,
            'discount_type': coupon.discount_type,
            'discount_value': str(coupon.discount_value),
            'discount_amount': discount_amount,
        }, status=200)

    except Exception as e:
        response = Response({**userJson, 'error': str(e)}, status=200)

    if refreshToken is not None:
        response.set_cookie(
            key="refresh_token",
            value=refreshToken,
            httponly=True,
            secure=False,
            samesite="Lax",
            max_age=6 * 24 * 60 * 60,
        )

    return response


@api_view(['POST'])
def remove_coupon(request):
    if getattr(request, "id", None):
        data = userSerializer(request.id).data
        userData = data
        refreshToken = request.refresh_token
        accessToken = request.access_token
        userJson = {
            'userData': userData,
            'access_Token': accessToken
        }
    else:
        userJson = {'error': 'token invalid'}
        response = Response(userJson, status=401)
        response.set_cookie(
            key="refresh_token",
            value=None,
            httponly=True,
            secure=False,
            samesite="Lax",
        )
        return response

    try:
        request.session.pop('couponId', None)
        response = Response({**userJson, 'removed': True}, status=200)
    except Exception as e:
        response = Response({**userJson, 'error': str(e)}, status=200)

    if refreshToken is not None:
        response.set_cookie(
            key="refresh_token",
            value=refreshToken,
            httponly=True,
            secure=False,
            samesite="Lax",
            max_age=6 * 24 * 60 * 60,
        )

    return response
    
    
def calculate_total(cartData):
    total_price = 0
    variant_ids = [item['product_id'] for item in cartData]
    try:
        variant_object_ids = [ObjectId(vid) for vid in variant_ids]
    except Exception as e:
        variant_object_ids = variant_ids

    qty_map = {str(item['product_id']): item['qty'] for item in cartData}

    # ye ab bhi sirf pricing/metadata ke liye hai - read only, thik hai
    bookingProduct = VariantSize.objects.filter(
        id__in=variant_object_ids, variant__is_active=True
    ).select_related('variant', 'variant__product')

    product_map = {
        str(vs.id): {
            'price': vs.price,
            'size': vs.size,
            'product_image': vs.variant.image.url if vs.variant.image else None,
            'qty': qty_map.get(str(vs.id), 0),
            'product_name': vs.variant.product.name,
            'color': vs.variant.color,
        }
        for vs in bookingProduct
    }

    for product in cartData:
        if str(product['product_id']) not in product_map:
            raise Exception(f"Product {product['product_id']} unavailable")
        total_price += product_map[str(product['product_id'])]['price'] * product['qty']

    return total_price, product_map


def reserve_stock(product_map):
    """Atomically reserve stock for every item. Raises on failure and
    rolls back whatever it already reserved in this call."""
    reserved = []
    for pid, data in product_map.items():
        qty = data['qty']
        updated = VariantSize.objects.filter(
            id=ObjectId(pid), stock__gte=qty
        ).update(stock=F('stock') - qty)

        if updated == 0:
            print(f"Not enough stock for {data['product_name']} ({data['size']})")
            for r_pid, r_qty in reserved:
                VariantSize.objects.filter(id=ObjectId(r_pid)).update(stock=F('stock') + r_qty)
            raise Exception(f"{data['product_name']} ({data['size']}) is out of stock")

        reserved.append((pid, qty))
    return reserved
@csrf_exempt
@api_view(["POST"])
def create_order(request):


    if getattr(request, "id", None):
        data = userSerializer(request.id).data
        userData = data
        refreshToken = request.refresh_token
        accessToken = request.access_token
        userJson = {
            'userData': userData,
            'access_Token': accessToken
        }
    else:
        userJson = {'error': 'token invalid'}
        response = Response(userJson, status=401)
        response.set_cookie(
            key="refresh_token",
            value=None,
            httponly=True,
            secure=False,
            samesite="Lax",
        )
        return response

    try:
        user = request.id

        if not user.mobile_no:
            raise Exception('Add a mobile number to continue')

        address_index = int(request.data.get("address_index"))
        print(address_index)
        if address_index is None or not user.address or address_index >= len(user.address):
            raise Exception('Select a delivery address to continue')
        selected_address = user.address[address_index]
        print(selected_address)

        # buynow (frontend items bhejega) vs cart (signed cookie)
        buynow_items = request.data.get("items")
        payment_method = request.data.get("payment_method", "ONLINE")
        if buynow_items:
            print(1)
            cart_items = buynow_items
            print(buynow_items)
           
            total,product_map = calculate_total(cart_items)
        else:
            print(2)
            raw_cart = request.get_signed_cookie("cart", salt="cart_salt", default=None)
            print(3, raw_cart)
            if not raw_cart:
                raise Exception('Cart is empty')  
            cart_items = json.loads(raw_cart)
            print(12)
            print(cart_items['cartData'])
            print(type(cart_items['cartData'][0]['product_id']))
            total, product_map = calculate_total(cart_items['cartData'])
            print(13)
        reserve_stock(product_map)
        print(reserve_stock ,"reserve_stock")
        Actual_coupon = request.session.get('couponId',None)
        print(Actual_coupon)
        coupon = None
        coupon_discount = None
        print(request.data.get("couponId", None))
        if request.data.get("couponId", None):
            print(10)
            coupon_code = request.data.get("couponId", None)
            if Actual_coupon != coupon_code:
                raise Exception('Something went wrong')
            print(11)
            coupon_qs = Coupon.objects.filter(code=coupon_code)
            if coupon_qs.exists():
                coupon = coupon_qs.first()
                if coupon.is_active:
                    if coupon.discount_type == 'FLAT':
                        coupon_discount = coupon.discount_value
                    else:
                        coupon_discount = total * (coupon.discount_value / 100)
                else:
                    raise Exception('Coupon is not active')
                coupon_discount = min(coupon_discount, Decimal(coupon.max_discount_amount))

                coupon.used_count = F('used_count') + 1
                coupon.save(update_fields=['used_count'])
            else:
                raise Exception('Coupon not found')

      
        print(coupon_discount)
        print(total)
        flat_discount = total * Decimal('0.1')
        print(4, flat_discount)

        coupon_discount_dec = Decimal(str(coupon_discount)) if coupon_discount else Decimal('0')
        
        print(coupon_discount)
        total_price = round(total - flat_discount -  coupon_discount_dec)
        print(5)
        print(total_price)
        # if total_price < 100:
        #     raise Exception('Order amount too low')
        # print(6)
        print(settings.RAZORPAY_KEY_ID)
        print(settings.RAZORPAY_KEY_SECRET)
        razorpay_order = client.order.create({
            "amount": total_price * 100 if payment_method == 'ONLINE' else 99 * 100,
            "currency": "INR",
            "receipt": f"rcpt_{user.id}",
        })
        print(7)
        print(product_map)
        
        Payment.objects.create(
            customerID=user,
            razorpay_order_id=razorpay_order['id'],
            productID = {
    "product_ids": [
        {
            "product_id": pid,
            "qty": data['qty'],
            "price": float(data['price']),
            "size": data['size'],
            "product_image": data['product_image'],
            "product_name": data['product_name'],
            "color": data['color']
        }
        for pid, data in product_map.items()
    ]
},
            amount=total,
            total_price = total_price,
            payment_mode = payment_method,
            discount=round(flat_discount + (coupon_discount if coupon_discount else 0)),
            couponCode=coupon.code if coupon else None,
            couponDiscount = coupon_discount if coupon_discount != None else None,

            address=selected_address,
            mobile_no=user.mobile_no,
            statusID=Payment.StatusChoices.PENDING
            
        )
        request.session.pop('couponId', None)  # Clear the coupon from session after order creation    


        
        print(8)
        print(razorpay_order['amount'],razorpay_order['id'])
        response = Response({
            "order_id": razorpay_order["id"],
            "amount": razorpay_order["amount"],
            **userJson
        }, status=200)

    except Exception as e:
        print('error', e)
        response = Response({**userJson, 'error': str(e)}, status=200)

    if refreshToken is not None:
        response.set_cookie(
            key="refresh_token",
            value=refreshToken,
            httponly=True,
            secure=False,
            samesite="Lax",
            max_age=6 * 24 * 60 * 60
        )
        return response
    else:
        return response




def send_order_success_email(payment, order):
    try:
        html_customer = render_to_string("emails/order_success.html", {
            "payment_id": str(payment.id),
            "razorpay_order_id": payment.razorpay_order_id,
            "order_id": str(order.id),
            "razorpay_payment_id":str(payment.razorpay_payment_id),
            "amount": payment.total_price,
        })
        html_admin = render_to_string("emails/order_success_admin.html", {
            "payment_id": str(payment.id),
            "razorpay_order_id": payment.razorpay_order_id,
            "order_id": str(order.id),
            "razorpay_payment_id":str(payment.razorpay_payment_id),
            "amount": payment.total_price,
        })
        msg_admin = EmailMultiAlternatives(
            subject="New Order Received",
            body="A new order has been placed.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[settings.DEFAULT_ADMIN_EMAIL],
        )
        msg_customer = EmailMultiAlternatives(
            subject="Your SS Garments order is confirmed!",
            body="Your order has been confirmed.",  # plain-text fallback
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[payment.customerID.email],
        )
        msg_admin.attach_alternative(html_admin, "text/html")
        msg_admin.send()
        msg_customer.attach_alternative(html_customer, "text/html")
        msg_customer.send()
    except Exception as e:
        # 🔹 email fail hone se webhook fail nahi hona chahiye — sirf log karo
        print("order success email failed:", e)


def send_payment_failed_email(payment, e=None):
    try:
        html = render_to_string("emails/order_failed.html", {
            "payment_id": str(payment.id),
            "razorpay_order_id": payment.razorpay_order_id,
            'error' : e
        })
        msg = EmailMultiAlternatives(
            subject="Payment failed — SS Garments",
            body="Your payment could not be completed.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[payment.customerID.email],
        )
        msg.attach_alternative(html, "text/html")
        msg.send()
    except Exception as e:
        print("payment failed email failed:", e)


@csrf_exempt
@require_POST
def razorpay_webhook(request):
    webhook_secret = settings.RAZORPAY_WEBHOOK_SECRET
    payload = request.body
    signature = request.headers.get('X-Razorpay-Signature')

    try:
        client.utility.verify_webhook_signature(
            payload.decode('utf-8'), signature, webhook_secret
        )
    except razorpay.errors.SignatureVerificationError:
        return JsonResponse({'error': 'Invalid signature'}, status=400)

    event = json.loads(payload)
    event_type = event.get('event')

    if event_type == 'payment.captured':
        try:
            order_id = event['payload']['payment']['entity']['order_id']
            payment_id = event['payload']['payment']['entity']['id']

            payment = Payment.objects.filter(razorpay_order_id=order_id).first()

            if not payment:
                raise(f"webhook: no payment found for order_id {order_id}")
            elif payment.statusID == Payment.StatusChoices.SUCCESS:
                raise(f"webhook: payment {order_id} already processed, skipping (duplicate webhook)")
            else:
                payment.statusID = Payment.StatusChoices.SUCCESS
                payment.razorpay_payment_id = payment_id
                payment.save()

                coupon_code = payment.couponCode if payment.couponCode else None

                order = Order.objects.create(
                    paymentID=payment,
                    customerID=payment.customerID,
                    productID=payment.productID,
                    couponCode=coupon_code,
                    couponDiscount=payment.couponDiscount,
                    address=payment.address,
                    mobile_no=payment.mobile_no,
                    discount=payment.discount,
                    payment_mode=payment.payment_mode,
                    total_price=payment.total_price,
                    amount = payment.amount,
                    statusID=Order.StatusChoices.PENDING,
                )

                send_order_success_email(payment, order)

        except Exception as e:
            print("webhook payment.captured error:", e)
            send_payment_failed_email(payment,str(e))

    elif event_type == 'payment.failed':
        order_id = event['payload']['payment']['entity']['order_id']
        payment = Payment.objects.filter(razorpay_order_id=order_id).first()
        if payment and payment.statusID != Payment.StatusChoices.FAILED:
            payment.statusID = Payment.StatusChoices.FAILED
            payment.save()
            for item in payment.productID.get("product_ids", []):
                VariantSize.objects.filter(id=item["product_id"]).update(
                    stock=F('stock') + item.get("qty", 0)
                )
            coupon_code = payment.couponCode if payment.couponCode else None
            if(coupon_code):
                coupon = Coupon.objects.filter(code=coupon_code).first()
                if coupon:
                    coupon.used_count = F('used_count') - 1
                    coupon.save(update_fields=['used_count'])
            
            send_payment_failed_email(payment)

    return JsonResponse({'status': 'ok'}, status=200)
@api_view(['GET'])
def verify_order(request, razorpay_order_id):
    refreshToken = None

    if getattr(request, "id", None):
        data = userSerializer(request.id).data
        userData = data
        refreshToken = request.refresh_token
        accessToken = request.access_token
        userJson = {
            'userData': userData,
            'access_Token': accessToken
        }
    else:
        userJson = {'error': 'token invalid'}
        response = Response(userJson, status=401)
        response.set_cookie(
            key="refresh_token",
            value=None,
            httponly=True,
            secure=False,
            samesite="Lax",
        )
        return response

    try:
        payment = Payment.objects.filter(
            razorpay_order_id=razorpay_order_id
        ).select_related("order").first()
        print(2)

        if not payment:
            print(1)
            return Response({'status': 'not_found'}, status=404)

        if payment.statusID == Payment.StatusChoices.SUCCESS:
            print(4)
            # 🔹 hasattr check sabse pehle — payment.order ko directly access
            # karne se pehle, warna RelatedObjectDoesNotExist crash karta hai
            if hasattr(payment, 'order') and payment.order:
                print(payment.order)
                print(payment.order.id)
                response = Response({
                    **userJson,
                    'status': 'success',
                    'order_id': str(payment.order.id),
                })
                print('success')
            else:
                print('pending1')
                # statusID SUCCESS hai lekin order abhi tak bana nahi (race condition)
                response = Response({**userJson, 'status': 'pending'},status=200)
        elif payment.statusID == Payment.StatusChoices.FAILED:
            print('failed')
            response = Response({**userJson, 'status': 'failed'},status=200)
        else:
            print('pending')
            response = Response({**userJson, 'status': 'pending'},status= 200)

    except Exception as e:
        print('error', e)
        response = Response({**userJson, 'status': 'delayed'}, status=200)

    if refreshToken is not None:
        response.set_cookie(
            key="refresh_token",
            value=refreshToken,
            httponly=True,
            samesite="Lax",
            max_age=6 * 24 * 60 * 60,
        )

    return response


@api_view(['POST'])
def cancel_order(request, order_id):
    refreshToken = None

    if not getattr(request, "id", None):
        response = Response({'error': 'token invalid'}, status=401)
        response.set_cookie(
            key="refresh_token", value=None,
            httponly=True, secure=False, samesite="Lax",
        )
        return response

    userData = userSerializer(request.id).data
    refreshToken = request.refresh_token
    accessToken = request.access_token
    userJson = {'userData': userData, 'access_Token': accessToken}

    try:
        order = Order.objects.select_related('paymentID').get(id=order_id, customerID=request.id)
    except Order.DoesNotExist:
        response = Response({"error": "Order not found", **userJson}, status=400)
        if refreshToken is not None:
            response.set_cookie(key="refresh_token", value=refreshToken, httponly=True,
                                 samesite="Lax", max_age=6 * 24 * 60 * 60)
        return response

    # Cancellation sirf SHIPPED hone se pehle allowed
    if order.statusID in ['SHIPPED', 'DELIVERED', 'CANCELLED']:
        response = Response(
            {"error": f"Order cannot be cancelled, it is already {order.statusID}", **userJson},
            status=400
        )
    else:
        product_total = None
        payment_id = None
        try:
            # productID snapshot se sirf product amount nikalo (delivery_charge, discount exclude)
            product_total = order.total_price

            # payment record se razorpay_payment_id nikalo, safely
            if order.paymentID:
                payment_id = order.paymentID.razorpay_payment_id

            # coupon use_count wapas decrement karo (agar coupon use hua tha)
            coupon_code = getattr(order, 'couponCode', None)
            if coupon_code:
                coupon_obj = Coupon.objects.filter(code=coupon_code).first()
                if coupon_obj:
                    Coupon.objects.filter(id=coupon_obj.id).update(used_count=F('used_count') - 1)

        except (KeyError, TypeError, AttributeError) as e:
            response = Response({"error": "Invalid order item data", **userJson}, status=400)
            product_total = None

        if order.payment_mode == "COD":
            # COD orders ke liye refund nahi hai, bas order cancel karo
            for item in order.productID.get('product_ids', []):
                try:
                    variant_size = VariantSize.objects.get(id=item['product_id'])
                    variant_size.stock = F('stock') + item['qty']
                    variant_size.save(update_fields=['stock'])
                except VariantSize.DoesNotExist:
                    continue

            order.statusID = 'CANCELLED'
            order.save()

            response = Response({
                "message": "Order cancelled successfully",
                **userJson
            }, status=200)
        

        elif product_total is not None:
            refund_response = None
            refund_failed = False

            if payment_id:
                try:
                    print(1)
                    refund_response = client.payment.refund(
                        payment_id,
                        {
                            "amount": int(product_total * 100),  # paise me
                            "speed": "normal",
                            "notes": {
                                "reason": "Order cancelled by customer",
                                "order_id": str(order.id)
                            }
                        }
                    )
                    print(2)
                except razorpay.errors.BadRequestError as e:
                    response = Response({"error": f"Refund failed: {str(e)}", **userJson}, status=400)
                    refund_failed = True
                except Exception as e:
                    response = Response({"error": f"Refund could not be processed: {str(e)}", **userJson}, status=500)
                    refund_failed = True
            else:
                response = Response({"error": "Payment record not found for this order", **userJson}, status=400)
                refund_failed = True

            if not refund_failed:
                # order items ka stock wapas add karo
                for item in order.productID.get('product_ids', []):
                    try:
                        variant_size = VariantSize.objects.get(id=item['product_id'])
                        variant_size.stock = F('stock') + item['qty']
                        variant_size.save(update_fields=['stock'])
                    except VariantSize.DoesNotExist:
                        continue

                order.statusID = 'CANCELLED'
                order.save()

                response = Response({
                    "message": "Order cancelled successfully",
                    "refund_amount": product_total,
                    "refund_id": refund_response.get('id') if refund_response else None,
                    **userJson
                }, status=200)

    if refreshToken is not None:
        response.set_cookie(
            key="refresh_token", value=refreshToken,
            httponly=True, samesite="Lax", max_age=6 * 24 * 60 * 60,
        )

    return response


@api_view(['POST'])
def cancel_payment_attempt(request, razorpay_order_id):
    refreshToken = None

    if getattr(request, "id", None):
        data = userSerializer(request.id).data
        userData = data
        refreshToken = request.refresh_token
        accessToken = request.access_token
        userJson = {
            'userData': userData,
            'access_Token': accessToken
        }
    else:
        userJson = {'error': 'token invalid'}
        response = Response(userJson, status=401)
        response.set_cookie(
            key="refresh_token",
            value=None,
            httponly=True,
            secure=False,
            samesite="Lax",
        )
        return response

    try:
        payment = Payment.objects.filter(razorpay_order_id=razorpay_order_id).first()

        if not payment:
            response = Response({**userJson, 'status': 'not_found'}, status=404)
        elif payment.statusID != Payment.StatusChoices.PENDING:
            # already success/failed/cancelled - dobara touch mat karo
            response = Response({**userJson, 'status': 'no_action_needed'}, status=200)
        else:
            coupon = payment.couponCode
            if coupon:
                print(coupon)
                coupon = Coupon.objects.filter(code=coupon).first()
                print(coupon)
                coupon.used_count = F('used_count') - 1
                coupon.save(update_fields=['used_count'])
            for item in payment.productID.get('product_ids', []):
                try:
                    variant_size = VariantSize.objects.get(id=item['product_id'])
                    variant_size.stock = max(0, variant_size.stock + item['qty'])
                    variant_size.save()
                except VariantSize.DoesNotExist:
                    continue

            payment.statusID = Payment.StatusChoices.FAILED
            payment.save()

            response = Response({**userJson, 'status': 'cancelled'}, status=200)

    except Exception as e:
        print('error', e)
        response = Response({**userJson, 'status': 'delayed'}, status=200)

    if refreshToken is not None:
        response.set_cookie(
            key="refresh_token",
            value=refreshToken,
            httponly=True,
            samesite="Lax",
            max_age=6 * 24 * 60 * 60,
        )

    return response