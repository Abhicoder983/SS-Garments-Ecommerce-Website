import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'SS_Backend.settings')
app = Celery('SS_Backend')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()   # 👈 ye khud dhoondh lega har app ke tasks.py ko