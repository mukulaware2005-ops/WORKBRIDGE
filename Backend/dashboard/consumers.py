import json
from channels.generic.websocket import AsyncWebsocketConsumer


class AdminDashboardConsumer(AsyncWebsocketConsumer):

    async def connect(self):

        user = self.scope["user"]

        if not user.is_authenticated or not user.is_staff:
            await self.close(code=4403)
            return

        await self.channel_layer.group_add(
            "admin_dashboard",
            self.channel_name,
        )

        await self.accept()

        await self.send(text_data=json.dumps({
            "type": "connection",
            "message": "Admin dashboard connected",
        }))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            "admin_dashboard",
            self.channel_name,
        )

    async def dashboard_update(self, event):
        await self.send(text_data=json.dumps({
            "type": "dashboard_update",
            "data": event["data"],
        }))