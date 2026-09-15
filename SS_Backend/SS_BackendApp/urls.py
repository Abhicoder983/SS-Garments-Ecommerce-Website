from django.contrib import admin
from django.urls import path
from .views import *

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
    path('contactusEmail/',contactUsEmail),
    path('create-payment/',create_order),
    path('webhook-order/',razorpay_webhook),
    path('verify-order/<str:razorpay_order_id>/',verify_order),
    path('apply-coupon/', apply_coupon, name='apply-coupon'),
    path('remove-coupon/', remove_coupon, name='remove-coupon'),
    path('cancel-order/<str:order_id>/', cancel_order, name='cancel-order'),
    path('payment-cancel/<str:razorpay_order_id>/', cancel_payment_attempt)
]