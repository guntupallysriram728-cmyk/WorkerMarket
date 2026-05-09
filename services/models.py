from django.db import models
from django.contrib.auth.models import User

class Worker(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    service_type = models.CharField(max_length=100)
    location = models.CharField(max_length=200)
    hourly_rate = models.DecimalField(max_digits=6, decimal_places=2)
    phone = models.CharField(max_length=20)
    bio = models.TextField(blank=True)
    offers_guarantee = models.BooleanField(default=False)
    guarantee_percentage = models.IntegerField(default=50)

    def __str__(self):
        return self.name

class Review(models.Model):
    worker = models.ForeignKey(Worker, on_delete=models.CASCADE, related_name='reviews')
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.reviewer} -> {self.worker} ({self.rating}/5)"


class Availability(models.Model):
    DAYS = [
        ('monday', 'Monday'), ('tuesday', 'Tuesday'),
        ('wednesday', 'Wednesday'), ('thursday', 'Thursday'),
        ('friday', 'Friday'), ('saturday', 'Saturday'),
        ('sunday', 'Sunday')
    ]
    worker = models.ForeignKey(Worker, on_delete=models.CASCADE, related_name='availability')
    day = models.CharField(max_length=10, choices=DAYS)
    start_time = models.TimeField()
    end_time = models.TimeField()

    def __str__(self):
        return self.worker.name + " - " + self.day


class Booking(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    worker = models.ForeignKey(Worker, on_delete=models.CASCADE, related_name='bookings')
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    date = models.DateField()
    hours = models.FloatField()
    price_per_hour = models.DecimalField(max_digits=6, decimal_places=2)
    total = models.DecimalField(max_digits=8, decimal_places=2)
    description = models.TextField(blank=True)
    recurring = models.CharField(max_length=20, default='once')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.customer.username + " -> " + self.worker.name
