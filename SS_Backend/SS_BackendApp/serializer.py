from rest_framework import serializers

from .models import UserModel, Order,refreshTokenStore,cart,Category,ProductVariant,Products,VariantSize


class userSerializer(serializers.ModelSerializer):
    profile_image_url = serializers.SerializerMethodField()
    class Meta:
        model = UserModel
        exclude = ['is_active','id']
    def get_profile_image_url(self, obj):
        if obj.profile_image:
            return obj.profile_image.url
        return None


  
    
class orderSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Order
        exclude=['id','customerID']

class cartSerializer(serializers.ModelSerializer):
    class Meta:
        model = cart
        exclude=['id','customerId']
        
class variantSizeSerializer(serializers.ModelSerializer):
    color = serializers.CharField(source="variant.color")
    image = serializers.ImageField(source="variant.image")
    product_name = serializers.CharField(source="variant.product.name")
    category = serializers.CharField(source="variant.product.category.name")
    image_url = serializers.SerializerMethodField()
    brand = serializers.CharField(source="variant.product.brand")
    description = serializers.CharField(source="variant.product.description")
    class Meta:
        model = VariantSize
        fields = [
            "size",
            "price", 
            "stock",
            "color",
            "image",
            "product_name",
            "category",
            "image_url",
            "brand",
            "description"
        ]
    def get_image_url(self, obj):
       if getattr(obj, "image", None):
            return obj.image.url
       return None
    

class ProductVariantSerializer(serializers.ModelSerializer):
    id = serializers.SerializerMethodField()
    sizes = variantSizeSerializer(many=True, read_only=True)

    class Meta:
        model = ProductVariant
        fields = ["id", "color", "image", "sizes"]

    def get_id(self, obj):
        return str(obj.id)




class productSerializer(serializers.ModelSerializer):
    id = serializers.SerializerMethodField()
    category = serializers.CharField(source="category.name")
    variants = ProductVariantSerializer(many=True, read_only=True)

    class Meta:
        model = Products
        fields = [
            "id",
            "name",
            "brand",
            "category",
            "gender",
            "description",
            "variants",
        ]

    def get_id(self, obj):
        return str(obj.id)

 