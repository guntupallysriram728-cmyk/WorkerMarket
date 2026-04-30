from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import Worker, Review
from .serializers import WorkerSerializer, ReviewSerializer

class WorkerViewSet(viewsets.ModelViewSet):
    queryset = Worker.objects.all()
    serializer_class = WorkerSerializer

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer

@api_view(['POST'])
def register_worker(request):
    username = request.data.get('username')
    password = request.data.get('password')
    name = request.data.get('name')
    service_type = request.data.get('service_type')
    location = request.data.get('location')
    hourly_rate = request.data.get('hourly_rate')
    phone = request.data.get('phone')
    bio = request.data.get('bio', '')
    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists'}, status=400)
    user = User.objects.create_user(username=username, password=password)
    worker = Worker.objects.create(
        user=user, name=name, service_type=service_type,
        location=location, hourly_rate=hourly_rate, phone=phone, bio=bio
    )
    return Response(WorkerSerializer(worker).data, status=201)

@api_view(['POST'])
def register_customer(request):
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email', '')
    first_name = request.data.get('first_name', '')
    last_name = request.data.get('last_name', '')
    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists'}, status=400)
    user = User.objects.create_user(
        username=username, password=password,
        email=email, first_name=first_name, last_name=last_name
    )
    return Response({'success': True, 'username': user.username, 'name': first_name + ' ' + last_name}, status=201)

@api_view(['POST'])
def login_user(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    if user:
        try:
            worker = Worker.objects.get(user=user)
            return Response({'success': True, 'role': 'worker', 'worker_id': worker.id, 'name': worker.name})
        except Worker.DoesNotExist:
            return Response({'success': True, 'role': 'customer', 'name': user.first_name or user.username})
    return Response({'error': 'Invalid username or password'}, status=401)
