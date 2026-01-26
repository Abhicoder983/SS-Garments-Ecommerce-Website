from django.contrib import admin
from .models import UserModel,Order,refreshTokenStore,cart,Category,Products,ProductVariant,VariantSize

# Register your models here.


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    actions = None
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


@admin.register(cart)
class cartAdmin(admin.ModelAdmin):
    def get_list_display(self, request):
        return [field.name for field in self.model._meta.fields]
    
@admin.register(Products)
class ProductAdmin(admin.ModelAdmin):
    def get_list_display(self, request):
        return [field.name for field in self.model._meta.fields]
    
@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):
    def get_list_display(self, request):
        return [field.name for field in self.model._meta.fields]
    
@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    def get_list_display(self, request):
        return [field.name for field in self.model._meta.fields]

@admin.register(VariantSize)
class CategoryAdmin(admin.ModelAdmin):
    def get_list_display(self, request):
        return [field.name for field in self.model._meta.fields]
    


