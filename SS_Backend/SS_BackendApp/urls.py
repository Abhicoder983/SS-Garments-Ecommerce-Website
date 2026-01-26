from django.contrib import admin
from django.urls import path,include
from SS_BackendApp import urls
from .views import login,verifyUser,signup,logout_view,home,orders,account,cart,productDetail,product_list

urlpatterns = [
    path("login/", login),
    path("verify/", verifyUser),
    path("signup/", signup),
    path('logout/',logout_view),
    path('',home),
    path('orderdetails/',orders),
    path('account/',account),
    path('cart/',cart),
    path('productDetail/<str:id>/', productDetail),
    path('products/',product_list)




]