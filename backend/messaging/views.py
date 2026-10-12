from django.db.models import Max, Q
from rest_framework import mixins, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Message
from .serializers import MessageSerializer


class MessageViewSet(mixins.CreateModelMixin, mixins.ListModelMixin, viewsets.GenericViewSet):
    """
    GET  /api/messaging/                          all my messages (sent + received)
    POST /api/messaging/                           send a message {"receiver": id, "listing": id, "message_text": "..."}
    GET  /api/messaging/threads/                   one row per conversation partner, latest message first
    GET  /api/messaging/?with=<user_id>             full thread with one specific user
    POST /api/messaging/<id>/mark_read/            mark a received message as read
    """

    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Message.objects.filter(Q(sender=user) | Q(receiver=user)).select_related(
            "sender", "receiver", "listing"
        )
        other_user_id = self.request.query_params.get("with")
        if other_user_id:
            qs = qs.filter(Q(sender_id=other_user_id) | Q(receiver_id=other_user_id)).order_by("date_sent")
        return qs

    @action(detail=False, methods=["get"])
    def threads(self, request):
        user = request.user
        partner_ids = set(
            Message.objects.filter(sender=user).values_list("receiver_id", flat=True)
        ) | set(
            Message.objects.filter(receiver=user).values_list("sender_id", flat=True)
        )
        threads = []
        for partner_id in partner_ids:
            latest = (
                Message.objects.filter(
                    Q(sender=user, receiver_id=partner_id) | Q(sender_id=partner_id, receiver=user)
                )
                .order_by("-date_sent")
                .first()
            )
            if latest:
                threads.append(latest)
        threads.sort(key=lambda m: m.date_sent, reverse=True)
        return Response(MessageSerializer(threads, many=True, context={"request": request}).data)

    @action(detail=True, methods=["post"])
    def mark_read(self, request, pk=None):
        message = self.get_object()
        if message.receiver_id != request.user.user_id:
            return Response({"detail": "Not your message to mark read."}, status=403)
        message.is_read = True
        message.save(update_fields=["is_read"])
        return Response(MessageSerializer(message).data)
