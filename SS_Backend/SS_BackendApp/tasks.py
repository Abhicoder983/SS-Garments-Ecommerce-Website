from datetime import timedelta
from django.utils import timezone
from celery import shared_task
from .models import Coupon, Payment, VariantSize
from django.db.models import F

@shared_task
def release_stale_reservations():
    print(1)
    cutoff = timezone.now() - timedelta(minutes=15)
    print(1)
    stale_payments = Payment.objects.filter(
        statusID=Payment.StatusChoices.PENDING,
        created_at__lt=cutoff,
    )
    for payment in stale_payments:
        for item in payment.productID.get("product_ids", []):
            VariantSize.objects.filter(id=item["product_id"]).update(
                stock=F('stock') + item.get("qty", 0)
            )
        payment.statusID = Payment.StatusChoices.FAILED
        coupon_code = payment.couponCode if payment.couponCode else None
        if coupon_code:
            coupon = Coupon.objects.filter(code=coupon_code).first()
            if coupon:
                coupon.used_count = F('used_count') - 1
                coupon.save(update_fields=['used_count'])
        payment.save()
        print(f"released stale reservation for payment {payment.id}")