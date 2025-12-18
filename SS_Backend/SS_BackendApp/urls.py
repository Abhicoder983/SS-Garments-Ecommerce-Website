from django.contrib import admin
from django.urls import path,include
from SS_BackendApp import urls
from .views import login,verifyUser,signup,logout_view,home,orders

urlpatterns = [
    path("login/", login),
    path("verify/", verifyUser),
    path("signup/", signup),
    path('logout/',logout_view),
    path('',home),
    path('orderdetails/',orders)


]