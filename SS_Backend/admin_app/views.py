# admin_app/views.py
import random
from datetime import timedelta,datetime
import re
from django.db.models import Q
from django.utils import timezone
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from rest_framework.decorators import api_view
from django.views.decorators.csrf import csrf_exempt
from rest_framework.response import Response
from rest_framework import status
from .templates.email import otp_send
import random, uuid
from .serializers import CouponStatusUpdateSerializer, ProductListSerializer, SendOTPSerializer, VerifyOTPSerializer, CustomerSerializer, CustomerStatusUpdateSerializer,CustomerDetailSerializer,OrderSerializer,OrderListSerializer,OrderDetailSerializer,OrderStatusUpdateSerializer, CategorySerializer, CouponSerializer, CouponCreateSerializer, ProductStatusUpdateSerializer
from SS_BackendApp.utils import generateJWT, getIPAddress
from django.db.models import Sum
from bson import ObjectId
from SS_BackendApp.models import Coupon, Order, Products, UserModel, VariantSize, Category, ProductVariant
import json 
@api_view(['POST'])
def send_admin_otp(request):
    serializer = SendOTPSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    email = serializer.validated_data['email']

    # Step 1: check user exists aur admin hai
    try:
        user = UserModel.objects.get(email=email, role='admin')
    except UserModel.DoesNotExist:
        return Response(
            {"error": "No admin account found with this email"},
            status=status.HTTP_404_NOT_FOUND
        )

    if not user.is_active:
        return Response(
            {"error": "This account is inactive"},
            status=status.HTTP_403_FORBIDDEN
        )

    # Step 2: naya OTP generate karo
    otp_code = str(random.randint(100000, 999999))
    expires_at = (timezone.now() + timedelta(minutes=2)).timestamp()

    # Step 3: session me store karo
    request.session['admin_otp'] = otp_code
    request.session['admin_otp_email'] = email
    request.session['admin_otp_expires'] = expires_at
    request.session['admin_otp_attempts'] = 0
    request.session.set_expiry(120)  # session bhi 5 min me expire ho

    # Step 4: email bhejo
    subject = "Your SS Garments Admin Login OTP"
    plain_text = f"Your OTP is {otp_code}. It is valid for 2 minutes."
    html_content = otp_send.get_otp_email_template(otp_code, minutes_valid=2)
    msg = EmailMultiAlternatives(
        subject=subject,
        body=plain_text,          # fallback agar HTML render na ho
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[email],
    )
    msg.attach_alternative(html_content, "text/html")
    msg.send()

    return Response({"message": "OTP sent successfully"}, status=status.HTTP_200_OK)


@api_view(['POST'])
def admin_otp_verify(request):
    print(5)
    print(request.data)
    serializer = VerifyOTPSerializer(data=request.data)
    
    serializer.is_valid(raise_exception=True)
    email = serializer.validated_data['email']
    otp_code = serializer.validated_data['otp']

    print(email)
    print(otp_code)

    session_otp = request.session.get('admin_otp')
    session_email = request.session.get('admin_otp_email')
    session_expires = request.session.get('admin_otp_expires')
    attempts = request.session.get('admin_otp_attempts', 0)
 
    # Step 1: session me OTP hai hi nahi ya email match nahi karta
    print(session_otp)
    print(session_email)
    if not session_otp or session_email != email:
        return Response({"error": "No OTP found, please request a new one"}, status=400)

    # Step 2: expire check
    if timezone.now().timestamp() > session_expires:
        _clear_otp_session(request)
        return Response({"error": "OTP expired, please request a new one"}, status=400)

    # Step 3: attempts limit check
    if attempts >= 5:
        _clear_otp_session(request)
        return Response({"error": "Too many failed attempts, please request a new OTP"}, status=400)

    # Step 4: OTP match check
    if session_otp != otp_code:
        request.session['admin_otp_attempts'] = attempts + 1
        return Response({"error": "Invalid OTP"}, status=400)

    # Step 5: sahi hai — session clear karo
   

    # Step 6: JWT generate karo
    try:
        user = UserModel.objects.get(email=email, role='admin')
        ip = getIPAddress.get_client_ip(request)
        jti = uuid.uuid4().hex
        expiry_at = datetime.utcnow() + timedelta(days=6)
        created_at = datetime.utcnow()

        refresh_token = generateJWT.generate_RefreshJwt(str(user.id), ip, jti, expiry_at, created_at)
        access_token = generateJWT.generate_AccessToken(user)
        print(access_token)
        print(refresh_token)
        _clear_otp_session(request)
        response = Response({
            "access": str(access_token),
            "refresh": str(refresh_token),
            "user": {
                "id": str(user.id),
                "name": user.name,
                "email": user.email,
            }
        }, status=status.HTTP_200_OK)
        response.set_cookie(key="refresh_token",        # cookie name
                value=refresh_token,        # value
                httponly=True,              # JS se access nahi
                secure=True,               # localhost → False, prod → True
                samesite="Lax",             # CSRF protection
                max_age=6 * 24 * 60 * 60    # seconds (6 days))
            ) 
        return response
    except Exception as e:
        print(e)
        return Response(
                    {"error": "No admin account found with this email"},
                    status=status.HTTP_404_NOT_FOUND
                )

def _clear_otp_session(request):
    for key in ['admin_otp', 'admin_otp_email', 'admin_otp_expires', 'admin_otp_attempts']:
        request.session.pop(key, None)








LOW_STOCK_THRESHOLD = 15


@api_view(['GET'])
def admin_dashboard(request):
    # 1. Total orders
    total_orders = Order.objects.count()

    # 2. Pending shipment - jo order confirm ho gaya but abhi shipped nahi hua
    pending_shipment = Order.objects.filter(statusID='CONFIRMED').count()

    # 3. Total revenue - sab orders ka total (chunki humne decide kiya tha
    #    sirf paid orders ka record banta hai, to sab orders revenue me count honge)
    total_revenue = Order.objects.aggregate(total=Sum('Total_price'))['total'] or 0

    # 4. Total customers - sirf role='customer' wale
    total_customers = UserModel.objects.filter(role='customer').count()

    # 5. Low stock alerts - jin variant sizes ka stock threshold se kam hai
    low_stock_qs = VariantSize.objects.filter(
        stock__lte=LOW_STOCK_THRESHOLD
    ).select_related('variant', 'variant__product').order_by('stock')[:10]

    low_stock_products = [
        {
            "id": str(item.id),
            "name": item.variant.product.name,
            "color": item.variant.color,
            "size": item.get_size_display(),
            "stock": item.stock,
        }
        for item in low_stock_qs
    ]

    # 6. Recent orders - latest 5 orders
    recent_orders_qs = Order.objects.select_related('customerID').order_by('-order_date')[:5]

    recent_orders = [
        {
            "id": str(order.id),
            "customer_name": order.customerID.name,
            "status": order.statusID,
            "total_price": order.Total_price,
            "order_date": order.order_date,
        }
        for order in recent_orders_qs
    ]

    return Response({
        "total_orders": total_orders,
        "pending_shipment": pending_shipment,
        "total_revenue": total_revenue,
        "total_customers": total_customers,
        "low_stock_products": low_stock_products,
        "recent_orders": recent_orders,
    }, status=status.HTTP_200_OK)



@api_view(['GET'])
def customer_list(request):
    customers = UserModel.objects.filter(role='customer').order_by('-id')
    serializer = CustomerSerializer(customers, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['PATCH'])
def customer_update_status(request, customer_id):
    try:
        customer = UserModel.objects.get(id=customer_id, role='customer')
    except UserModel.DoesNotExist:
        return Response({"error": "Customer not found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = CustomerStatusUpdateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    customer.is_active = serializer.validated_data['is_active']
    customer.save()

    return Response({
        "message": "Customer status updated",
        "id": str(customer.id),
        "is_active": customer.is_active,
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
def customer_detail(request, customer_id):
    try:
        customer = UserModel.objects.get(id=customer_id, role='customer')
    except UserModel.DoesNotExist:
        return Response({"error": "Customer not found"}, status=status.HTTP_404_NOT_FOUND)

    orders = Order.objects.filter(customerID=customer).order_by('-order_date')

    customer_data = CustomerDetailSerializer(customer).data
    orders_data = OrderSerializer(orders, many=True).data

    return Response({
        "customer": customer_data,
        "orders": orders_data,
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
def order_list(request):
    orders = Order.objects.select_related('customerID').order_by('-order_date')
    serializer = OrderListSerializer(orders, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET', 'PATCH'])
def order_detail_or_update(request, order_id):
    try:
        order = Order.objects.select_related('customerID').get(id=order_id)
    except Order.DoesNotExist:
        return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = OrderDetailSerializer(order)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'PATCH':
        serializer = OrderStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        order.statusID = serializer.validated_data['status']
        order.save()

        return Response({
            "message": "Order status updated",
            "id": str(order.id),
            "status": order.statusID,
        }, status=status.HTTP_200_OK)


@api_view(['GET', 'POST'])
def category_list_create(request):
    if request.method == 'GET':
        categories = Category.objects.all().order_by('name')
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'POST':
        name = request.data.get('name', '').strip()

        if not name:
            return Response({"error": "Category name is required"}, status=status.HTTP_400_BAD_REQUEST)

        if Category.objects.filter(name__iexact=name).exists():
            return Response({"error": "Category with this name already exists"}, status=status.HTTP_400_BAD_REQUEST)

        category = Category.objects.create(name=name)
        serializer = CategorySerializer(category)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['PATCH', 'DELETE'])
def category_update_delete(request, category_id):
    try:
        category = Category.objects.get(id=ObjectId(category_id))
    except Category.DoesNotExist:
        return Response({"error": "Category not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'PATCH':
        name = request.data.get('name', '').strip()

        if not name:
            return Response({"error": "Category name is required"}, status=status.HTTP_400_BAD_REQUEST)

        if Category.objects.filter(name__iexact=name).exclude(id=category.id).exists():
            return Response({"error": "Category with this name already exists"}, status=status.HTTP_400_BAD_REQUEST)

        category.name = name
        category.save()
        serializer = CategorySerializer(category)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'DELETE':
        # check karo koi products is category se linked to nahi hain
        if category.products.exists():
            return Response(
                {"error": "Cannot delete category with existing products. Move or delete those products first."},
                status=status.HTTP_400_BAD_REQUEST
            )
        category.delete()
        return Response({"message": "Category deleted"}, status=status.HTTP_200_OK)
    



@api_view(['GET', 'POST'])
def coupon_list_create(request):
    if request.method == 'GET':
        coupons = Coupon.objects.all().order_by('-created_at')
        serializer = CouponSerializer(coupons, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'POST':
        data = request.data

        code = str(data.get('code', '')).strip().upper()
        discount_type = data.get('discount_type')
        discount_value = data.get('discount_value')
        valid_from = data.get('valid_from')
        valid_until = data.get('valid_until')

        # Step 1: required fields
        if not code:
            return Response({"error": "Coupon code is required"}, status=status.HTTP_400_BAD_REQUEST)

        if discount_type not in ['PERCENTAGE', 'FLAT']:
            return Response({"error": "Invalid discount type"}, status=status.HTTP_400_BAD_REQUEST)

        if discount_value is None or float(discount_value) <= 0:
            return Response({"error": "Discount value must be greater than 0"}, status=status.HTTP_400_BAD_REQUEST)

        if discount_type == 'PERCENTAGE' and float(discount_value) > 100:
            return Response({"error": "Percentage discount cannot exceed 100"}, status=status.HTTP_400_BAD_REQUEST)

        if not valid_from or not valid_until:
            return Response({"error": "Both valid from and valid until dates are required"}, status=status.HTTP_400_BAD_REQUEST)

        if valid_until <= valid_from:
            return Response({"error": "Valid until date must be after valid from date"}, status=status.HTTP_400_BAD_REQUEST)

        # Step 2: duplicate check
        if Coupon.objects.filter(code=code).exists():
            return Response({"error": "A coupon with this code already exists"}, status=status.HTTP_400_BAD_REQUEST)

        # Step 3: create
        payload = {**data, "code": code}
        serializer = CouponCreateSerializer(data=payload)

        if not serializer.is_valid():
            # kisi bhi generic/unexpected serializer error ko bhi single key me convert kar do
            first_error = next(iter(serializer.errors.values()))[0]
            return Response({"error": str(first_error)}, status=status.HTTP_400_BAD_REQUEST)

        coupon = serializer.save()
        response_serializer = CouponSerializer(coupon)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

@api_view(['PATCH', 'DELETE'])
def coupon_update_delete(request, coupon_id):
    try:
        coupon = Coupon.objects.get(id=ObjectId(coupon_id))
    except Coupon.DoesNotExist:
        return Response({"error": "Coupon not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'PATCH':
        serializer = CouponStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        coupon.is_active = serializer.validated_data['is_active']
        coupon.save()

        return Response({
            "message": "Coupon status updated",
            "id": str(coupon.id),
            "is_active": coupon.is_active,
        }, status=status.HTTP_200_OK)

    elif request.method == 'DELETE':
        coupon.delete()
        return Response({"message": "Coupon deleted"}, status=status.HTTP_200_OK)


@api_view(['GET', 'PATCH'])
def product_list(request, product_id=None):
    if request.method == 'GET':
        if product_id:
            try:
                product = Products.objects.select_related('category').prefetch_related(
                    'variants', 'variants__sizes'
                ).get(id=ObjectId(product_id))
            except Products.DoesNotExist:
                return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)

            serializer = ProductListSerializer(product)
            return Response(serializer.data, status=status.HTTP_200_OK)

        else:
            # Query params
            page = int(request.GET.get('page', 1))
            search = request.GET.get('search', '').strip()
            category_id = request.GET.get('category', '')
            color = request.GET.get('color', '').strip()
            max_stock = request.GET.get('max_stock', '')
            page_size = 20 

            queryset = Products.objects.select_related('category').prefetch_related(
                'variants', 'variants__sizes'
            )

            # Search - name ya brand
            if search:
                queryset = queryset.filter(
                    Q(name__icontains=search) | Q(brand__icontains=search)
                )

            # Category filter
            if category_id and category_id != 'ALL':
                try:
                    queryset = queryset.filter(category_id=ObjectId(category_id))
                except Exception:
                    pass

            # Color filter - variants ke through
            if color and color != 'ALL':
                queryset = queryset.filter(variants__color__iexact=color)

            # Stock filter - kisi bhi size ka stock <= max_stock
            if max_stock:
                try:
                    queryset = queryset.filter(variants__sizes__stock__lte=int(max_stock))
                except ValueError:
                    pass

            # color/stock filter se duplicate rows aa sakti hain (JOIN ki wajah se), distinct laga do
            queryset = queryset.distinct().order_by('-created_at')

            total_count = queryset.count()
            total_pages = (total_count + page_size - 1) // page_size

            start = (page - 1) * page_size
            end = start + page_size
            products_page = queryset[start:end]

            serializer = ProductListSerializer(products_page, many=True)

            return Response({
                "results": serializer.data,
                "page": page,
                "page_size": page_size,
                "total_count": total_count,
                "total_pages": total_pages,
            }, status=status.HTTP_200_OK)

    elif request.method == "PATCH":
        try:
            product = Products.objects.get(id=ObjectId(product_id))
        except Products.DoesNotExist:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = ProductStatusUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"error": "Invalid data provided"}, status=status.HTTP_400_BAD_REQUEST)

        product.is_active = serializer.validated_data['is_active']
        product.save()

        return Response({
            "message": "Product status updated",
            "id": str(product.id),
            "is_active": product.is_active,
        }, status=status.HTTP_200_OK)

@api_view(['POST'])
def product_create(request):
    name = request.data.get('name', '').strip()
    brand = request.data.get('brand', '').strip()
    category_id = request.data.get('category')
    print(category_id)
    gender = request.data.get('gender')
    description = request.data.get('description', '').strip()

    if not name or not brand or not category_id:
        return Response({"error": "Name, brand and category are required"}, status=status.HTTP_400_BAD_REQUEST)

    if gender not in ['male', 'female', 'unisex', 'kids']:
        return Response({"error": "Invalid gender value"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        category = Category.objects.get(id=ObjectId(category_id))
    except Category.DoesNotExist:
        return Response({"error": "Category not found"}, status=status.HTTP_400_BAD_REQUEST)

    product = Products.objects.create(
        name=name,
        brand=brand,
        category=category,
        gender=gender,
        description=description,
    )

    return Response({
        "id": str(product.id),
        "message": "Product created successfully"
    }, status=status.HTTP_201_CREATED)


@api_view(['POST','PATCH'])
def product_variant_create(request, variant_id = None):
    if request.method=="POST":

        product_id = request.data.get('product')
        color = request.data.get('color', '').strip()
        image = request.FILES.get('image')
        sizes_raw = request.data.get('sizes')

        if not product_id or not color or not image or not sizes_raw:
            return Response({"error": "Product, color, image and sizes are all required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            product = Products.objects.get(id=ObjectId(product_id))
        except Products.DoesNotExist:
            return Response({"error": "Product not found"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            sizes_list = json.loads(sizes_raw)
        except (json.JSONDecodeError, TypeError):
            return Response({"error": "Invalid sizes data"}, status=status.HTTP_400_BAD_REQUEST)

        if not isinstance(sizes_list, list) or len(sizes_list) == 0:
            return Response({"error": "At least one size must be provided"}, status=status.HTTP_400_BAD_REQUEST)

        valid_size_keys = [choice[0] for group in VariantSize.SIZE_CHOICES for choice in group[1]]

        for item in sizes_list:
            if item.get('size') not in valid_size_keys:
                return Response({"error": f"Invalid size: {item.get('size')}"}, status=status.HTTP_400_BAD_REQUEST)
            if not item.get('price') or float(item.get('price')) <= 0:
                return Response({"error": "All sizes must have a valid price"}, status=status.HTTP_400_BAD_REQUEST)
            if item.get('stock') is None or int(item.get('stock')) < 0:
                return Response({"error": "All sizes must have valid stock"}, status=status.HTTP_400_BAD_REQUEST)

        if ProductVariant.objects.filter(product=product, color__iexact=color).exists():
            return Response({"error": f"Variant with color '{color}' already exists for this product"}, status=status.HTTP_400_BAD_REQUEST)

        variant = ProductVariant.objects.create(product=product, color=color, image=image)

        for item in sizes_list:
            VariantSize.objects.create(
                variant=variant,
                size=item['size'],
                price=item['price'],
                stock=item['stock'],
            )

        return Response({
            "id": str(variant.id),
            "message": "Variant created successfully"
        }, status=status.HTTP_201_CREATED)
    if request.method == "PATCH":
        try:
            variant = ProductVariant.objects.get(id=ObjectId(variant_id))
        except ProductVariant.DoesNotExist:
            return Response({"error": "Variant not found"}, status=status.HTTP_404_NOT_FOUND)

        is_active = request.data.get('is_active')

        if not isinstance(is_active, bool):
            return Response({"error": "is_active must be true or false"}, status=status.HTTP_400_BAD_REQUEST)

        variant.is_active = is_active
        variant.save()

        return Response({
            "message": "Variant status updated",
            "id": str(variant.id),
            "is_active": variant.is_active,
        }, status=status.HTTP_200_OK)




        

@api_view(['GET'])
def product_detail(request, product_id):
    try:
        product = Products.objects.select_related('category').get(id=ObjectId(product_id))
    except Products.DoesNotExist:
        return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)

    variants_qs = ProductVariant.objects.filter(product=product).prefetch_related('sizes')

    variants_data = []
    for variant in variants_qs:
        sizes_data = [
            {
                "id": str(size.id),
                "size": size.size,
                "price": float(size.price),
                "stock": size.stock,
            }
            for size in variant.sizes.all()
        ]
        variants_data.append({
            "id": str(variant.id),
            "color": variant.color,
            "image": variant.image.url if variant.image else None,
            "is_active": variant.is_active,
            "sizes": sizes_data,
        })

    product_data = {
        "id": str(product.id),
        "name": product.name,
        "brand": product.brand,
        "category_id": str(product.category_id),
        "gender": product.gender,
        "description": product.description,
        "is_active": product.is_active,
    }

    return Response({
        "product": product_data,
        "variants": variants_data,
    }, status=status.HTTP_200_OK)


@api_view(['PATCH'])
def product_edit(request, product_id):
    try:
        product = Products.objects.get(id=ObjectId(product_id))
    except Products.DoesNotExist:
        return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)

    name = request.data.get('name', '').strip()
    brand = request.data.get('brand', '').strip()
    category_id = request.data.get('category')
    gender = request.data.get('gender')
    description = request.data.get('description', '').strip()

    if not name or not brand or not category_id:
        return Response({"error": "Name, brand and category are required"}, status=status.HTTP_400_BAD_REQUEST)

    if gender not in ['male', 'female', 'unisex', 'kids']:
        return Response({"error": "Invalid gender value"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        category = Category.objects.get(id=ObjectId(category_id))
    except Category.DoesNotExist:
        return Response({"error": "Category not found"}, status=status.HTTP_400_BAD_REQUEST)

    product.name = name
    product.brand = brand
    product.category = category
    product.gender = gender
    product.description = description
    product.save()

    return Response({"message": "Product updated successfully"}, status=status.HTTP_200_OK)




@api_view(['PATCH'])
def variant_size_update(request, size_id):
    try:
        size = VariantSize.objects.get(id=ObjectId(size_id))
    except VariantSize.DoesNotExist:
        return Response({"error": "Size not found"}, status=status.HTTP_404_NOT_FOUND)

    price = request.data.get('price')
    stock = request.data.get('stock')

    if price is None or float(price) <= 0:
        return Response({"error": "Price must be greater than 0"}, status=status.HTTP_400_BAD_REQUEST)

    if stock is None or int(stock) < 0:
        return Response({"error": "Stock cannot be negative"}, status=status.HTTP_400_BAD_REQUEST)

    size.price = price
    size.stock = stock
    size.save()

    return Response({
        "message": "Size updated successfully",
        "id": str(size.id),
        "price": float(size.price),
        "stock": size.stock,
    }, status=status.HTTP_200_OK)



@api_view(['POST'])
def product_variant_create_without_size(request):
    product_id = request.data.get('product')
    color = request.data.get('color', '').strip()
    image = request.FILES.get('image')

    # Step 1: required fields check
    if not product_id or not color or not image:
        return Response(
            {"error": "Product, color and image are all required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Step 2: product exist karta hai check karo
    try:
        product = Products.objects.get(id=ObjectId(product_id))
    except Products.DoesNotExist:
        return Response({"error": "Product not found"}, status=status.HTTP_400_BAD_REQUEST)

    # Step 3: duplicate color check
    if ProductVariant.objects.filter(product=product, color__iexact=color).exists():
        return Response(
            {"error": f"Variant with color '{color}' already exists for this product"},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Step 4: variant create (bina sizes ke)
    variant = ProductVariant.objects.create(
        product=product,
        color=color,
        image=image,
    )

    variant_data = {
        "id": str(variant.id),
        "color": variant.color,
        "image": variant.image.url if variant.image else None,
        "is_active": variant.is_active,
        "sizes": [],
    }

    return Response({
        "message": "Variant created successfully",
        "variant": variant_data,
    }, status=status.HTTP_201_CREATED)




@api_view(['POST'])
def variant_sizes_add(request, variant_id):
    try:
        variant = ProductVariant.objects.get(id=ObjectId(variant_id))
    except ProductVariant.DoesNotExist:
        return Response({"error": "Variant not found"}, status=status.HTTP_404_NOT_FOUND)

    sizes_list = request.data.get('sizes')

    if not isinstance(sizes_list, list) or len(sizes_list) == 0:
        return Response({"error": "At least one size must be provided"}, status=status.HTTP_400_BAD_REQUEST)

    valid_size_keys = [choice[0] for group in VariantSize.SIZE_CHOICES for choice in group[1]]

    for item in sizes_list:
        if item.get('size') not in valid_size_keys:
            return Response({"error": f"Invalid size: {item.get('size')}"}, status=status.HTTP_400_BAD_REQUEST)
        if not item.get('price') or float(item.get('price')) <= 0:
            return Response({"error": "All sizes must have a valid price"}, status=status.HTTP_400_BAD_REQUEST)
        if item.get('stock') is None or int(item.get('stock')) < 0:
            return Response({"error": "All sizes must have valid stock"}, status=status.HTTP_400_BAD_REQUEST)
        if VariantSize.objects.filter(variant=variant, size=item.get('size')).exists():
            return Response({"error": f"Size {item.get('size')} already exists for this variant"}, status=status.HTTP_400_BAD_REQUEST)

    created_sizes = []
    for item in sizes_list:
        size_obj = VariantSize.objects.create(
            variant=variant,
            size=item['size'],
            price=item['price'],
            stock=item['stock'],
        )
        created_sizes.append({
            "id": str(size_obj.id),
            "size": size_obj.size,
            "price": float(size_obj.price),
            "stock": size_obj.stock,
        })

    return Response({
        "message": "Sizes added successfully",
        "sizes": created_sizes,
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def low_stock_view(request):
    threshold = int(request.GET.get('threshold', 15))
    search = request.GET.get('search', '').strip()
    category_id = request.GET.get('category', '')
    size_filter = request.GET.get('size', '')
    sort_by = request.GET.get('sort', 'stock_asc')
    page = int(request.GET.get('page', 1))
    page_size = 20

    base_queryset = VariantSize.objects.filter(stock__lt=threshold).select_related(
        'variant', 'variant__product', 'variant__product__category'
    )

    if search:
        base_queryset = base_queryset.filter(
            Q(variant__product__name__icontains=search) | Q(variant__color__icontains=search)
        )

    if category_id and category_id != 'ALL':
        try:
            base_queryset = base_queryset.filter(variant__product__category_id=ObjectId(category_id))
        except Exception:
            pass

    if size_filter and size_filter != 'ALL':
        base_queryset = base_queryset.filter(size__startswith=size_filter + '_')

    # IMPORTANT: counts yahin nikaalo, pagination slice se PEHLE
    total_count = base_queryset.count()
    out_of_stock_count = base_queryset.filter(stock=0).count()
    critical_count = base_queryset.filter(stock__gt=0, stock__lte=5).count()

    if sort_by == 'stock_asc':
        ordered_queryset = base_queryset.order_by('stock')
    elif sort_by == 'stock_desc':
        ordered_queryset = base_queryset.order_by('-stock')
    elif sort_by == 'recent':
        ordered_queryset = base_queryset.order_by('-updated_At')
    else:
        ordered_queryset = base_queryset.order_by('stock')

    total_pages = (total_count + page_size - 1) // page_size
    start = (page - 1) * page_size
    end = start + page_size
    page_items = ordered_queryset[start:end]

    results = [
        {
            "size_id": str(size.id),
            "product_id": str(size.variant.product.id),
            "product_name": size.variant.product.name,
            "category_id": str(size.variant.product.category_id),
            "color": size.variant.color,
            "variant_image": size.variant.image.url if size.variant.image else None,
            "size": size.size,
            "stock": size.stock,
            "price": float(size.price),
            "updated_at": size.updated_At,
        }
        for size in page_items
    ]

    return Response({
        "results": results,
        "page": page,
        "page_size": page_size,
        "total_count": total_count,
        "total_pages": total_pages,
        "out_of_stock_count": out_of_stock_count,
        "critical_count": critical_count,
    }, status=status.HTTP_200_OK)