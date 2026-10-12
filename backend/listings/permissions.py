from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    """Only the student who posted a listing (or an admin) can edit/delete it."""

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.user_id == request.user.user_id or request.user.is_staff
