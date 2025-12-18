from django.contrib import admin
from .models import Product,UserModel,Order,refreshTokenStore

# Register your models here.

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    def get_list_display(self, request):
        return [field.name for field in self.model._meta.fields]
    


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    def get_list_display(self, request):
        return [field.name for field in self.model._meta.fields]

@admin.register(UserModel)
class UserAdmin(admin.ModelAdmin):
    def get_list_display(self, request):
        return [field.name for field in self.model._meta.fields]


@admin.register(refreshTokenStore)
class refreshTokenAdmin(admin.ModelAdmin):
    def get_list_display(self, request):
        return [field.name for field in self.model._meta.fields]
    


