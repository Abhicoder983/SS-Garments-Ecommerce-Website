from rest_framework import serializers
from .models import UserModel,Product, Order,refreshTokenStore


class userSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = UserModel
        fields = ['name','mobile_no','email','address']
class productSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    class Meta:
        model = Product
        exclude=['id','updated_at']

    def get_image_url(self, obj):
        if obj.image:
            return obj.image.url
        return None
    
    
class orderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        exclude=['id','customerID']
