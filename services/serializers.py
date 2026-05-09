from rest_framework import serializers
from .models import Worker, Review, Availability, Booking

class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = '__all__'

class AvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Availability
        fields = '__all__'

class WorkerSerializer(serializers.ModelSerializer):
    reviews = ReviewSerializer(many=True, read_only=True)
    availability = AvailabilitySerializer(many=True, read_only=True)
    average_rating = serializers.SerializerMethodField()

    def get_average_rating(self, obj):
        reviews = obj.reviews.all()
        if reviews:
            return round(sum(r.rating for r in reviews) / len(reviews), 1)
        return None

    class Meta:
        model = Worker
        fields = '__all__'


class BookingSerializer(serializers.ModelSerializer):
    worker_name = serializers.SerializerMethodField()
    customer_name = serializers.SerializerMethodField()

    def get_worker_name(self, obj):
        return obj.worker.name

    def get_customer_name(self, obj):
        return obj.customer.first_name + " " + obj.customer.last_name if obj.customer.first_name else obj.customer.username

    class Meta:
        model = Booking
        fields = '__all__'
