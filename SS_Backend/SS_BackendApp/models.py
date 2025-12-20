from django.db import models
from django_mongodb_backend.fields import ObjectIdAutoField

# ============================
#   USER MODEL
# ============================
class UserModel(models.Model):
    id = ObjectIdAutoField(primary_key=True)
    name = models.CharField(max_length=100, null=True)
    email = models.EmailField(unique=True, null=True)
    mobile_no = models.CharField(null=False,max_length=10,unique=True)
    address=models.CharField(max_length=300, null=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return str(self.id)


# ============================
#   PRODUCT MODEL
# ============================
class Product(models.Model):

    # Gender options
    class GenderChoices(models.TextChoices):
        MALE = "Male", "Male"
        FEMALE = "Female", "Female"
        UNISEX = "Unisex", "Unisex"
    id = ObjectIdAutoField(primary_key=True)
    product_name = models.CharField(max_length=150)
    company_name = models.CharField(max_length=150)
    size = models.CharField(max_length=20)
    color = models.CharField(max_length=50)
    price = models.PositiveIntegerField()
    category = models.CharField(max_length=100)
    type_of_product = models.CharField(max_length=100)
    gender = models.CharField(max_length=6, choices=GenderChoices.choices, default=GenderChoices.UNISEX)
    image = models.ImageField(upload_to="products/", null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.product_name


# ============================
#   ORDER MODEL
# ============================
class Order(models.Model):

    # Order statuses
    class StatusChoices(models.TextChoices):
        PENDING = "PENDING", "Pending"
        SHIPPED = "SHIPPED", "Shipped"
        DELIVERED = "DELIVERED", "Delivered"
        CANCELLED = "CANCELLED", "Cancelled"
    id = ObjectIdAutoField(primary_key=True)
    customerID = models.ForeignKey(UserModel, on_delete=models.CASCADE, related_name="orders")
    productID = models.JSONField()   
    statusID = models.CharField(max_length=20, choices=StatusChoices.choices, default=StatusChoices.PENDING)
    order_date = models.DateTimeField(auto_now_add=True)
    Total_price=models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"Order #{self.id} - {self.customerID.name}-{self.customerID.mobile_no}"
    
# {
#   "product_ids": [
#     {"product_id": "66c1...", "qty": 2,"price":1200},
#     {"product_id": "66c2...", "qty": 1,"price":900}
#   ]
# }
class refreshTokenStore(models.Model):
    id = ObjectIdAutoField(primary_key=True)
    user = models.ForeignKey(UserModel, on_delete=models.CASCADE)

    # Unique Token ID stored inside JWT (jti claim)
    jti = models.CharField(max_length=255, unique=True)

    # Actual refresh token (optional – store or don't store raw token)
    token = models.TextField(null=True, blank=True)

    # Device info (helps for multi-device)
    ip_address = models.GenericIPAddressField(null=True, blank=True)

    # Token expiration
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    # For revoke/rotation system
    revoked = models.BooleanField(default=False)

    def is_expired(self):
        return timezone.now() > self.expires_at
    def __str__(self):
        return str(self.user_id)


