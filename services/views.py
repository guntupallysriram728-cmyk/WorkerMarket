from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import Worker, Review, Availability, Booking, Availability
from .serializers import WorkerSerializer, ReviewSerializer, AvailabilitySerializer, BookingSerializer

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


@api_view(['POST'])
def ai_match(request):
    import urllib.request, json, re
    problem = request.data.get('problem', '')
    workers_data = request.data.get('workers', [])
    worker_list = ", ".join([
        "ID:" + str(w['id']) + " Name:" + w['name'] + " Service:" + w['service_type'] + " Rate:$" + str(w['hourly_rate']) + "/hr"
        for w in workers_data
    ])
    prompt = "Customer problem: " + problem + ". Workers: " + worker_list + ". Pick BEST worker, respond JSON only no extra text: {worker_id:number,worker_name:string,reason:string,estimated_hours:number,tip:string}"
    payload = json.dumps({
        "model": "nvidia/nemotron-3-super-120b-a12b:free",
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 300
    }).encode()
    req = urllib.request.Request(
        "https://openrouter.ai/api/v1/chat/completions",
        data=payload,
        headers={
            "Content-Type": "application/json",
            "Authorization": "Bearer YOUR_OPENROUTER_KEY"
        }
    )
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read())
            text = data['choices'][0]['message']['content']
            match = re.search(r'{[\s\S]*}', text)
            return Response(json.loads(match.group()))
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
def set_availability(request):
    worker_id = request.data.get('worker_id')
    slots = request.data.get('slots', [])
    try:
        worker = Worker.objects.get(id=worker_id)
        Availability.objects.filter(worker=worker).delete()
        for slot in slots:
            Availability.objects.create(
                worker=worker,
                day=slot['day'],
                start_time=slot['start_time'],
                end_time=slot['end_time']
            )
        return Response({'success': True, 'message': 'Availability updated!'})
    except Worker.DoesNotExist:
        return Response({'error': 'Worker not found'}, status=404)

@api_view(['GET'])
def get_availability(request, worker_id):
    try:
        worker = Worker.objects.get(id=worker_id)
        availability = Availability.objects.filter(worker=worker)
        return Response(AvailabilitySerializer(availability, many=True).data)
    except Worker.DoesNotExist:
        return Response({'error': 'Worker not found'}, status=404)


@api_view(['POST'])
def set_availability(request):
    worker_id = request.data.get('worker_id')
    slots = request.data.get('slots', [])
    try:
        worker = Worker.objects.get(id=worker_id)
        Availability.objects.filter(worker=worker).delete()
        for slot in slots:
            Availability.objects.create(
                worker=worker,
                day=slot['day'],
                start_time=slot['start_time'],
                end_time=slot['end_time']
            )
        return Response({'success': True, 'message': 'Availability updated!'})
    except Worker.DoesNotExist:
        return Response({'error': 'Worker not found'}, status=404)

@api_view(['GET'])
def get_availability(request, worker_id):
    try:
        worker = Worker.objects.get(id=worker_id)
        availability = Availability.objects.filter(worker=worker)
        return Response(AvailabilitySerializer(availability, many=True).data)
    except Worker.DoesNotExist:
        return Response({'error': 'Worker not found'}, status=404)


@api_view(['POST'])
def toggle_guarantee(request):
    worker_id = request.data.get('worker_id')
    offers = request.data.get('offers_guarantee', False)
    percentage = request.data.get('guarantee_percentage', 50)
    try:
        worker = Worker.objects.get(id=worker_id)
        worker.offers_guarantee = offers
        worker.guarantee_percentage = percentage
        worker.save()
        return Response({'success': True, 'offers_guarantee': worker.offers_guarantee})
    except Worker.DoesNotExist:
        return Response({'error': 'Worker not found'}, status=404)


@api_view(['POST'])
def create_booking(request):
    worker_id = request.data.get('worker_id')
    customer_id = request.data.get('customer_id', 1)
    try:
        worker = Worker.objects.get(id=worker_id)
        customer = User.objects.get(id=customer_id)
        booking = Booking.objects.create(
            worker=worker,
            customer=customer,
            date=request.data.get('date'),
            hours=request.data.get('hours'),
            price_per_hour=request.data.get('price_per_hour'),
            total=request.data.get('total'),
            description=request.data.get('description', ''),
            recurring=request.data.get('recurring', 'once'),
            status='pending'
        )
        return Response(BookingSerializer(booking).data, status=201)
    except Exception as e:
        return Response({'error': str(e)}, status=400)

@api_view(['GET'])
def get_bookings(request):
    user_id = request.GET.get('user_id')
    role = request.GET.get('role', 'customer')
    try:
        if role == 'worker':
            worker = Worker.objects.get(user_id=user_id)
            bookings = Booking.objects.filter(worker=worker).order_by('-created_at')
        else:
            bookings = Booking.objects.filter(customer_id=user_id).order_by('-created_at')
        return Response(BookingSerializer(bookings, many=True).data)
    except Exception as e:
        return Response({'error': str(e)}, status=400)

@api_view(['POST'])
def update_booking_status(request):
    booking_id = request.data.get('booking_id')
    status = request.data.get('status')
    try:
        booking = Booking.objects.get(id=booking_id)
        booking.status = status
        booking.save()
        return Response(BookingSerializer(booking).data)
    except Exception as e:
        return Response({'error': str(e)}, status=400)
