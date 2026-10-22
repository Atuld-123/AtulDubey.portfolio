from django.conf import settings
from django.contrib import admin
from django.urls import include, path
from django.views.static import serve
from django.urls import re_path

urlpatterns = [path('django-admin/', admin.site.urls), path('api/', include('portfolio.urls'))]
urlpatterns += [re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT})]
