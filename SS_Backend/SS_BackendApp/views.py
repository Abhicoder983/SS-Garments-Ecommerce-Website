from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import JsonResponse
import random, uuid, time
from datetime import datetime, timedelta
from django.views.decorators.csrf import csrf_exempt
from .models import UserModel, refreshTokenStore,Products,Order,ProductVariant,VariantSize
from . import models
from .serializer import userSerializer,productSerializer, orderSerializer,cartSerializer,variantSizeSerializer
from django.db.models import Q
from .utils import generateJWT, getIPAddress
from django.contrib.auth.models import AnonymousUser
from django.middleware.csrf import get_token
from bson import ObjectId
import json
import jwt
from django.conf import settings

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
    print("VERIFY SESSION KEY:", request.session.session_key)
    print(request.session.get(str(mobile)))

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
    
    print(otp)
    print(mobile)

    if not mobile or not otp:
        return Response({"error": "Mobile & OTP required"}, status=400)

    # SESSION OTP CHECK
    sessionData = request.session.get(str(mobile))
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
    user = UserModel.objects.filter(mobile_no=mobile).first()
    ip = getIPAddress.get_client_ip(request)
    jti = uuid.uuid4().hex
    expiry_at = datetime.utcnow() + timedelta(days=6)
    created_at = datetime.utcnow()
    if(not user):
        user=UserModel.objects.create(mobile_no=mobile)
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

   
    # eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4YjNjMDM0OTVjZDc0OWU5OTM1MGIzOWYwOTg3MjQ4YyIsInVzZXJfaWQiOiI2OTQ0MGRmMjY5ZDU1ZjQzYjdlMTJmZGIiLCJpcF9BZGRyZXNzIjoiMTI3LjAuMC4xIiwiZXhwIjoxNzY2NTg2MDk4LCJpYXQiOjE3NjYwNjc2OTh9.6SPHHo9DOUTqs5Zx0zCYrptkZwzCWKvKxiFCLxOKXGE
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
        "user": user_data,
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


def logout_view(request):
    try:

        userid=request.id 
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
        response = JsonResponse({"message": "Logged out"},status=401)

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
    .filter(stock__gt=0)
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
        userOrder=Order.objects.filter(customerID=request.id)
        print(1)
        userOrderSerializer=orderSerializer(userOrder,many=True)
        userOrderData=userOrderSerializer.data
        print(userOrderData[0]['productID']['product_ids'])
        print(2)
        for order in userOrderData:
            for product_Data in order['productID']['product_ids']:
                productid=product_Data['product_id']
                
                variant =VariantSize.objects.get(id=ObjectId(productid))
            
                product_obj = VariantSize.objects.select_related("variant__product__category").get(id=ObjectId(productid))
                
                productDetail=variantSizeSerializer(product_obj).data
                
                product_Data['product_id']=productDetail
                product_Data['product_id']['id']=str(product_obj.id)
                

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
            'userorderData':[]
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
            
@api_view(['GET','PATCH','DELETE','POST'])
def cart(request):
    cart_datail=[]
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
        data = models.cart.objects.filter(customerId=request.id)
        serializer=cartSerializer(data,many=True)
        try:
            
            cart_item=serializer.data[0]['cartItem']

        except:
            
            cart_item={}
            
    try:
        if (request.method=='POST'):
            product_id=request.data.get('product_id')
            print(product_id)
            if not cart_item:
                print(1)
                print(cart_item)
                cart_item['customerId']=str(request.id)
                cart_item['cartData']=[{
                    'product_id':product_id,
                    'qty':1
                }]
                print(type(request.id))
                data=models.cart.objects.create(customerId=request.id,cartItem=cart_item)
                data.save()
                
            
            else:
                print(cart_item,'productid',product_id)
                item=None
                for product in cart_item['cartData']:
                    
                    if product['product_id']==product_id:

                        print('increse')
                        qty=product['qty']
                        qty=qty+1
                        product['qty']=qty
                        print('qty',qty)
                        item=product                     
                if item is None:
                    cart_item['cartData'].append(
                        {'product_id':product_id,
                        'qty':1}
                    )
                cart = models.cart.objects.filter(customerId=request.id).first()

                if cart:
                    cart.cartItem= cart_item
                    cart.save()
                

        
        elif(request.method=='PATCH'):
            # index=int(request.data.get('index'))
            productID=request.data.get('product_id')
            qty=int(request.data.get('qty'))
            print(qty)
            print(1)
            print(cart_item)
            cart_item["cartData"] = [
    {**item, "qty": qty} if item["product_id"] == productID else item
    for item in  cart_item["cartData"]
]
            # cart_item["cartData"][index]["qty"]=qty
            cart = models.cart.objects.filter(customerId=request.id).first()
            if cart:
                cart.cartItem= cart_item
                cart.save()

 
            
            
        elif(request.method=='GET'):
            
        
            for index, product_item in enumerate(cart_item['cartData']):
                data=VariantSize.objects.get(pk=ObjectId(product_item['product_id']))
                serializer=variantSizeSerializer(data)
                cart_data=serializer.data
                cart_data['qty']=cart_item['cartData'][index]['qty']
                cart_data['product_id']=str(data.id)
                cart_datail.append(cart_data)
                

            
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
                cart.save()

        cart_item["customerId"]=str(request.id) 
        response=Response({ 'cart_item':cart_item,'cart_Detail':cart_datail,**userJson},status=200)
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
        all_variants = product.variants.prefetch_related("sizes")

        result = {
            "product_name": product.name,
            "product_id": str(product.id),
            "brand": product.brand,
            "description": product.description,
            "variants": []   # 👈 list, not dict
        }

        for v in all_variants:
            variant_data = {
                "variant_id": str(v.id),
                "color": v.color,
                "image": v.image.url if v.image else None,
                "sizes": []
            }
            if(not v.sizes.all() ):
               continue
            for size in v.sizes.all():
                if(size.stock==0):
                    continue
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
    

@api_view(["GET"])
def product_list(request):
    """
    Search + Filter + Sort products
    Returns cheapest in-stock variant per product
    """

    # -------------------------
    # BASE QUERYSET
    # -------------------------
    qs = VariantSize.objects.select_related(
        "variant__product__category"
    ).filter(
        stock__gt=0
    )

    # -------------------------
    # SEARCH
    # ?search=tshirt
    # -------------------------
    search = request.GET.get("search").strip()
    print(search)
    if search:
        keywords= search.split()
        print(keywords)
        search_q = Q()

        for word in keywords:
            search_q &= (
                Q(variant__product__name__icontains=word) |
                Q(variant__product__brand__icontains=word) |
                Q(variant__product__category__name__istartswith=word) |
                Q(variant__product__gender__icontains=word) |
                Q(variant__color__icontains=word)|
                Q(size__istartswith=word)

            )

        print(search_q)
        qs = VariantSize.objects.select_related(
    "variant__product__category"
).filter(
    stock__gt=0
).filter(search_q)
        print(qs)
       
            
            
        

   

    
    # -------------------------
    # SIZE FILTER
    # ?size=M_32
    # -------------------------
    size = request.GET.get("size")
    print(size)
    if size:
        qs = qs.filter(size__istartswith=size)

    gender =request.GET.get('gender')
    print(gender)
    if gender:
        qs= qs.filter(variant__product__gender__istartswith=gender)

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
    # GROUP BY PRODUCT
    # (cheapest variant per product)
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

    # -------------------------
    # FINAL RESPONSE
    # -------------------------
    return Response({
        "count": len(products_map),
        "products": list(products_map.values())
    })           




            

            




