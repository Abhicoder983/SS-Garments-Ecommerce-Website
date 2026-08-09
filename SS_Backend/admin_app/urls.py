from django.urls import path
from .views import category_update_delete, low_stock_view,product_edit,product_variant_create_without_size, product_detail, send_admin_otp,admin_otp_verify,admin_dashboard,customer_list,customer_update_status,customer_detail,order_list, order_detail_or_update, category_list_create,coupon_list_create, coupon_update_delete,product_list,product_create, product_variant_create, variant_size_update, variant_sizes_add


urlpatterns = [
    path("dashboard/",admin_dashboard),
    path("send-otp/", send_admin_otp),
    path("verify-otp/", admin_otp_verify),
    path('customers/', customer_list),
    path('customers-update/<str:customer_id>/', customer_update_status),
    path('customers/<str:customer_id>/', customer_detail),  
    path('orders/', order_list),
    path('orders-updateDetail/<str:order_id>/', order_detail_or_update),
    
    path('categories/', category_list_create),
    path('categories/<str:category_id>/', category_update_delete),
    path('coupons/', coupon_list_create),
    path('coupons/<str:coupon_id>/', coupon_update_delete),

    path('products/variants/create/', product_variant_create_without_size),
    path('products/variants/<str:variant_id>/sizes/add/', variant_sizes_add),
    
    path('inventory/low-stock/', low_stock_view),
    path('products/', product_list),
    path('products/<str:product_id>/', product_list),
    path('productscreate/', product_create),
    path('productsvariants/<str:variant_id>/', product_variant_create),
    path('productsdetail/<str:product_id>/', product_detail),
    path('products-edit/<str:product_id>/', product_edit),
    path('products-sizes/<str:size_id>/', variant_size_update),

]
