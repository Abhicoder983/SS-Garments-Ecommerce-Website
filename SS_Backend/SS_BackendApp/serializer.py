from rest_framework import serializers
from .models import UserModel,Product, Order,refreshTokenStore


class userSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = UserModel
        fields = ['name','mobile_no','email','address']
class productSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        exclude=['id','updated_at']

class orderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        exclude=['id','customerID']
