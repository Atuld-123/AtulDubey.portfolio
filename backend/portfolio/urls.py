from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import csrf_cookie, session_login, session_logout, WhoAmI, ProfileView, SkillViewSet, ProjectViewSet, ExperienceViewSet, EducationViewSet, CertificationViewSet, ResumeView, ContactCreateView, ContactAdminViewSet, WebsiteSettingsView

router = DefaultRouter()
router.register('skills', SkillViewSet)
router.register('projects', ProjectViewSet, basename='project')
router.register('experience', ExperienceViewSet)
router.register('education', EducationViewSet)
router.register('certifications', CertificationViewSet)
router.register('messages', ContactAdminViewSet)
urlpatterns = [
    path('auth/csrf/', csrf_cookie), path('auth/login/', session_login), path('auth/logout/', session_logout), path('auth/me/', WhoAmI.as_view()),
    path('profile/', ProfileView.as_view()), path('resume/', ResumeView.as_view()), path('contact/', ContactCreateView.as_view()), path('settings/', WebsiteSettingsView.as_view()),
    path('', include(router.urls)),
]
