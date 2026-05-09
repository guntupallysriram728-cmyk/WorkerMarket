from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WorkerViewSet, ReviewViewSet, register_worker, register_customer, login_user, ai_match, set_availability, get_availability, toggle_guarantee, create_booking, get_bookings, update_booking_status

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
    path('toggle-guarantee/', toggle_guarantee),
    path('create-booking/', create_booking),
    path('get-bookings/', get_bookings),
    path('update-booking-status/', update_booking_status),
]
