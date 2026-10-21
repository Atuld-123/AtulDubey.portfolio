from django.contrib import admin
from .models import Profile, Skill, Project, Experience, Education, Certification, Resume, ContactMessage, WebsiteSettings

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin): list_display = ['full_name', 'professional_title', 'updated_at']
@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin): list_display = ['title', 'category', 'status', 'featured', 'is_published']; list_filter = ['category', 'status', 'featured', 'is_published']; search_fields = ['title', 'description']
@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin): list_display = ['name', 'email', 'subject', 'created_at', 'is_read']; list_filter = ['is_read']; readonly_fields = ['name', 'email', 'subject', 'message', 'created_at']
admin.site.register([Skill, Experience, Education, Certification, Resume, WebsiteSettings])
