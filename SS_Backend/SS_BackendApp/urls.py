from django.contrib import admin
from django.urls import path
from .views import login,verifyUser,signup,logout_view,home,orders,account,cart,productDetail,product_list, googleAuthentication,googleOauth2Authentication,contactUsEmail

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
    path('products/',product_list),
    path('google-login/', googleAuthentication),
    path('google-oauth2-authentication/',googleOauth2Authentication),
    path('contactusEmail/',contactUsEmail)




]