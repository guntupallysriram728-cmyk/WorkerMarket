from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WorkerViewSet, ReviewViewSet, register_worker, register_customer, login_user, ai_match, set_availability, get_availability

router = DefaultRouter()
router.register(r'workers', WorkerViewSet)
router.register(r'reviews', ReviewViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('register-worker/', register_worker),
    path('register-customer/', register_customer),
    path('login/', login_user),
    path('ai-match/', ai_match),
    path('set-availability/', set_availability),
    path('get-availability/<int:worker_id>/', get_availability),
]
