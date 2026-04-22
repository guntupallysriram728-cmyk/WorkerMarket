from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WorkerViewSet, ReviewViewSet

router = DefaultRouter()
router.register(r'workers', WorkerViewSet)
router.register(r'reviews', ReviewViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
