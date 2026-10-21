from rest_framework.permissions import SAFE_METHODS, BasePermission

class StaffWritePermission(BasePermission):
    def has_permission(self, request, view):
        return request.method in SAFE_METHODS or bool(request.user and request.user.is_authenticated and request.user.is_staff)

class StaffOnlyPermission(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_staff)
