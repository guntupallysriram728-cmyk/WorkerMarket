import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

class VideoCallConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = 'video_' + self.room_name
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        await self.channel_layer.group_send(
            self.room_group_name,
            {'type': 'signal', 'data': data, 'sender': self.channel_name}
        )

    async def signal(self, event):
        if event['sender'] != self.channel_name:
            await self.send(text_data=json.dumps(event['data']))


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = 'chat_' + self.room_name
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        await self.save_message(data)
        await self.channel_layer.group_send(
            self.room_group_name,
            {'type': 'chat_message', 'message': data}
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event['message']))

    @database_sync_to_async
    def save_message(self, data):
        from .models import Worker, Message
        from django.contrib.auth.models import User
        try:
            worker = Worker.objects.get(id=data['worker_id'])
            customer = User.objects.get(id=data['customer_id'])
            Message.objects.create(
                worker=worker, customer=customer,
                sender=data['sender'], text=data['text']
            )
        except Exception as e:
            print(e)
