from django.db import models
from django_mongodb_backend.fields import ObjectIdAutoField

# ============================
#   USER MODEL
# ============================
class UserModel(models.Model):
    id = ObjectIdAutoField(primary_key=True)
    name = models.CharField(max_length=100, null=True,blank=True)
    email = models.EmailField(unique=True, null=True,blank=True)
    mobile_no = models.CharField(null=False,max_length=10,unique=True)
    profile_image=models.ImageField(upload_to='profile_image/', null=True, blank=True)
    address=models.JSONField(blank=True)
    total_order= models.IntegerField(null=True,blank=True)
    is_active = models.BooleanField(default=True)
    def __str__(self):
        return self.mobile_no


# ============================
#   PRODUCT MODEL
# ============================


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
    
class cart(models.Model):
    id=ObjectIdAutoField(primary_key=True)
    customerId=models.OneToOneField(UserModel, verbose_name="customer ID",on_delete=models.CASCADE)
    cartItem=models.JSONField(default=list,null=True)
    def __str__(self):
        return f"Order #{self.id} - {self.customerId.name}-{self.customerId.mobile_no}"
    



class Category(models.Model):
    id=ObjectIdAutoField(primary_key=True)
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class Products(models.Model):
    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
        ('unisex', 'Unisex'),
        ('kids', 'Kids'),
    ]
    id=ObjectIdAutoField(primary_key=True)
    name = models.CharField(max_length=200)
    brand = models.CharField(max_length=100)
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name='products'
    )
    gender = models.CharField(
        max_length=10,
        choices=GENDER_CHOICES
    )
    description = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name




class ProductVariant(models.Model):
    id = ObjectIdAutoField(primary_key=True)

    product = models.ForeignKey(
        Products,
        on_delete=models.CASCADE,
        related_name='variants'
    )

    color = models.CharField(max_length=50)
    image = models.ImageField(upload_to='products/variants/')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('product', 'color')

    def __str__(self):
        return f"{self.product.name} - {self.color}"

class VariantSize(models.Model):
    SIZE_CHOICES = (
    ("MALE_TOP", (
        ("XS_34", "XS (34)"),
        ("S_36", "S (36)"),
        ("M_38", "M (38)"),
        ("L_40", "L (40)"),
        ("XL_42", "XL (42)"),
        ("XXL_44", "XXL (44)"),
        ("3XL_46", "3XL (46)"),
        ("4XL_48", "4XL (48)"),
    )),

    ("MALE_BOTTOM", (
        ("XS_28", "XS (28)"),
        ("S_30", "S (30)"),
        ("M_32", "M (32)"),
        ("L_34", "L (34)"),
        ("XL_36", "XL (36)"),
        ("XXL_38", "XXL (38)"),
        ("3XL_40", "3XL (40)"),
        ("4XL_42", "4XL (42)"),
    )),

    ("FEMALE_TOP", (
        ("XS_32", "XS (32)"),
        ("S_34", "S (34)"),
        ("M_36", "M (36)"),
        ("L_38", "L (38)"),
        ("XL_40", "XL (40)"),
        ("XXL_42", "XXL (42)"),
        ("3XL_44", "3XL (44)"),
        ("4XL_46", "4XL (46)"),
    )),

    ("FEMALE_BOTTOM", (
        ("XS_26", "XS (26)"),
        ("S_28", "S (28)"),
        ("M_30", "M (30)"),
        ("L_32", "L (32)"),
        ("XL_34", "XL (34)"),
        ("XXL_36", "XXL (36)"),
        ("3XL_38", "3XL (38)"),
        ("4XL_40", "4XL (40)"),
    )),
)
    id = ObjectIdAutoField(primary_key=True)

    variant = models.ForeignKey(
        ProductVariant,
        on_delete=models.CASCADE,
        related_name='sizes'
    )

    size = models.CharField(
        max_length=10,
        choices=SIZE_CHOICES
    )

    price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    stock = models.PositiveIntegerField()
    updated_At=models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('variant', 'size')

    def __str__(self):
        return f"{self.variant} - {self.size}-{self.id}"
