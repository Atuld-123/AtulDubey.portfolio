from django.contrib.auth import authenticate, login, logout
from django.middleware.csrf import get_token
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect, ensure_csrf_cookie
from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework.views import APIView
from .models import Profile, Skill, Project, Experience, Education, Certification, Resume, ContactMessage, WebsiteSettings
from .permissions import StaffOnlyPermission, StaffWritePermission
from .serializers import ProfileSerializer, SkillSerializer, ProjectSerializer, ExperienceSerializer, EducationSerializer, CertificationSerializer, ResumeSerializer, ContactMessageSerializer, WebsiteSettingsSerializer

class ContactThrottle(AnonRateThrottle):
    scope = 'contact'

class LoginThrottle(AnonRateThrottle):
    scope = 'login'

@ensure_csrf_cookie
@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def csrf_cookie(request):
    return Response({'csrfToken': get_token(request)})

@api_view(['GET', 'POST'])
@permission_classes([permissions.AllowAny])
@throttle_classes([LoginThrottle])
@csrf_protect
def session_login(request):
    if request.method == 'GET':
        return Response({'authenticated': bool(request.user.is_authenticated and request.user.is_staff)})
    username = request.data.get('username', '')
    password = request.data.get('password', '')
    user = authenticate(request, username=username, password=password)
    if not user or not user.is_active or not user.is_staff:
        return Response({'detail': 'Invalid staff credentials.'}, status=status.HTTP_400_BAD_REQUEST)
    login(request, user)
    return Response({'authenticated': True})

@api_view(['POST'])
def session_logout(request):
    if not request.user.is_authenticated or not request.user.is_staff:
        raise PermissionDenied()
    logout(request)
    return Response({'authenticated': False})

class StaffViewSet(viewsets.ModelViewSet):
    permission_classes = [StaffWritePermission]

class ProfileView(APIView):
    permission_classes = [StaffWritePermission]
    def get_object(self):
        return Profile.objects.first() or Profile.objects.create()
    def get(self, request): return Response(ProfileSerializer(self.get_object(), context={'request': request}).data)
    def put(self, request): return self.save(request)
    def patch(self, request): return self.save(request, partial=True)
    def save(self, request, partial=False):
        serializer = ProfileSerializer(self.get_object(), data=request.data, partial=partial, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

class SkillViewSet(StaffViewSet): queryset = Skill.objects.all(); serializer_class = SkillSerializer
class ProjectViewSet(StaffViewSet):
    serializer_class = ProjectSerializer
    def get_queryset(self):
        qs = Project.objects.all()
        if not self.request.user.is_authenticated or not self.request.user.is_staff: qs = qs.filter(is_published=True)
        return qs
class ExperienceViewSet(StaffViewSet): queryset = Experience.objects.all(); serializer_class = ExperienceSerializer
class EducationViewSet(StaffViewSet): queryset = Education.objects.all(); serializer_class = EducationSerializer
class CertificationViewSet(StaffViewSet): queryset = Certification.objects.all(); serializer_class = CertificationSerializer

class ResumeView(APIView):
    permission_classes = [StaffWritePermission]
    def get(self, request):
        item = Resume.objects.order_by('-uploaded_at').first()
        return Response(ResumeSerializer(item, context={'request': request}).data if item else {})
    def post(self, request):
        serializer = ResumeSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        item = serializer.save(original_name=request.FILES.get('file').name)
        return Response(ResumeSerializer(item, context={'request': request}).data, status=status.HTTP_201_CREATED)
    def delete(self, request):
        for item in Resume.objects.all():
            item.file.delete(save=False)
            item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class ContactCreateView(generics.CreateAPIView):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ContactThrottle]
    def create(self, request, *args, **kwargs):
        settings = WebsiteSettings.objects.first()
        if settings and not settings.allow_contact_form:
            return Response({'detail': 'The contact form is currently disabled.'}, status=status.HTTP_403_FORBIDDEN)
        return super().create(request, *args, **kwargs)

class ContactAdminViewSet(StaffViewSet):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = [StaffOnlyPermission]

class WebsiteSettingsView(APIView):
    permission_classes = [StaffWritePermission]
    def get_object(self): return WebsiteSettings.objects.first() or WebsiteSettings.objects.create()
    def get(self, request): return Response(WebsiteSettingsSerializer(self.get_object()).data)
    def patch(self, request):
        serializer = WebsiteSettingsSerializer(self.get_object(), data=request.data, partial=True)
        serializer.is_valid(raise_exception=True); serializer.save(); return Response(serializer.data)

class WhoAmI(APIView):
    def get(self, request):
        if not request.user.is_authenticated or not request.user.is_staff: return Response({'authenticated': False}, status=401)
        return Response({'authenticated': True, 'username': request.user.get_username()})
