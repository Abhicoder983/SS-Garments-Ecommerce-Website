from bson import ObjectId
from rest_framework import serializers
from SS_BackendApp.models import UserModel,Order,Products,VariantSize, Category, Coupon
from django.db.models import Sum
import json
class SendOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()

class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6, min_length=6)

# admin_app/serializers.py

class CustomerSerializer(serializers.ModelSerializer):
    id = serializers.SerializerMethodField()

    class Meta:
        model = UserModel
        fields = ['id', 'name', 'email', 'total_order', 'is_active', 'address']

    def get_id(self, obj):
        return str(obj.id)


class CustomerStatusUpdateSerializer(serializers.Serializer):
    is_active = serializers.BooleanField()

# admin_app/serializers.py

class CustomerDetailSerializer(serializers.ModelSerializer):
    id = serializers.SerializerMethodField()

    class Meta:
        model = UserModel
        fields = ['id', 'name', 'email', 'profile_image', 'total_order', 'is_active', 'address']

    def get_id(self, obj):
        return str(obj.id)


class OrderSerializer(serializers.ModelSerializer):
    id = serializers.SerializerMethodField()
    total_price = serializers.IntegerField(source='Total_price')
    status = serializers.CharField(source='statusID')

    class Meta:
        model = Order
        fields = ['id', 'order_date', 'total_price', 'status']

    def get_id(self, obj):
        return str(obj.id)


# admin_app/serializers.py

class OrderListSerializer(serializers.ModelSerializer):
    id = serializers.SerializerMethodField()
    customer_name = serializers.CharField(source='customerID.name')
    total_price = serializers.IntegerField(source='Total_price')
    status = serializers.CharField(source='statusID')

    class Meta:
        model = Order
        fields = ['id', 'customer_name', 'order_date', 'total_price', 'status']

    def get_id(self, obj):
        return str(obj.id)

# admin_app/serializers.py

class OrderDetailSerializer(serializers.ModelSerializer):
    id = serializers.SerializerMethodField()
    customer_name = serializers.CharField(source='customerID.name')
    customer_email = serializers.CharField(source='customerID.email')
    total_price = serializers.IntegerField(source='Total_price')
    status = serializers.CharField(source='statusID')
    items = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'id', 'customer_name', 'customer_email', 'order_date',
            'total_price', 'status', 'awb_id', 'items'
        ]

    def get_id(self, obj):
        return str(obj.id)

    def get_items(self, obj):
    

        items = []
        product_entries = obj.productID.get('product_ids', [])

        for entry in product_entries:
            variant_size_id = entry.get('product_id')  # actually VariantSize ka id hai
            qty = entry.get('qty', 0)
            price = entry.get('price', 0)
            product_name = "Unknown Product"
            color = None
            size_display = None
            variant_image = None

            try:
                variant_size = VariantSize.objects.select_related(
                    'variant', 'variant__product'
                ).get(id=ObjectId(variant_size_id))
                variant_image = variant_size.variant.image.url if variant_size.variant.image else None
                product_id = str(variant_size.variant.product.id)
                product_name = variant_size.variant.product.name
                color = variant_size.variant.color
                size_display = variant_size.get_size_display()
            except VariantSize.DoesNotExist:
                pass

            items.append({
                "product_id" : product_id,
                "product_name": product_name,
                "variant_image": variant_image,
                "color": color,
                "size": size_display,
                "qty": qty,
                "price": price,
            })
        return items
class OrderStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=['CONFIRMED', 'SHIPPED', 'DELIVERED'])


# admin_app/serializers.py

class CategorySerializer(serializers.ModelSerializer):
    id = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name']

    def get_id(self, obj):
        return str(obj.id)


# admin_app/serializers.py

class CouponSerializer(serializers.ModelSerializer):
    id = serializers.SerializerMethodField()

    class Meta:
        model = Coupon
        fields = [
            'id', 'code', 'discount_type', 'discount_value',
            'min_order_value', 'max_discount_amount', 'usage_limit',
            'used_count', 'valid_from', 'valid_until', 'is_active'
        ]

    def get_id(self, obj):
        return str(obj.id)


class CouponStatusUpdateSerializer(serializers.Serializer):
    is_active = serializers.BooleanField()


# admin_app/serializers.py

class CouponCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = [
            'code', 'discount_type', 'discount_value',
            'min_order_value', 'max_discount_amount', 'usage_limit',
            'valid_from', 'valid_until'
        ]



# admin_app/serializers.py


class ProductListSerializer(serializers.ModelSerializer):
    id = serializers.SerializerMethodField()
    category_id = serializers.SerializerMethodField()
    category_name = serializers.CharField(source='category.name')
    thumbnail = serializers.SerializerMethodField()
    variant_count = serializers.SerializerMethodField()
    total_stock = serializers.SerializerMethodField()
    variants = serializers.SerializerMethodField()   # <-- ye add karo

    class Meta:
        model = Products
        fields = [
            'id', 'name', 'brand', 'category_id', 'category_name',
            'gender', 'thumbnail', 'variant_count', 'total_stock',
            'is_active', 'variants'                    # <-- yahan bhi add karo
        ]

    def get_id(self, obj):
        return str(obj.id)

    def get_category_id(self, obj):
        return str(obj.category_id)

    def get_thumbnail(self, obj):
        first_variant = obj.variants.first()
        if first_variant and first_variant.image:
            return first_variant.image.url
        return None

    def get_variant_count(self, obj):
        return obj.variants.count()

    def get_total_stock(self, obj):
        total = VariantSize.objects.filter(
            variant__product=obj
        ).aggregate(total=Sum('stock'))['total']
        return total or 0

    def get_variants(self, obj):
        variants_data = []
        for variant in obj.variants.all():
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
        return variants_data
# admin_app/serializers.py

class ProductStatusUpdateSerializer(serializers.Serializer):
    is_active = serializers.BooleanField()
