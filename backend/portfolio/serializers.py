import json
from rest_framework import serializers
from .models import Profile, Skill, Project, Experience, Education, Certification, Resume, ContactMessage, WebsiteSettings

class PublicModelSerializer(serializers.ModelSerializer):
    pass

class FlexibleJSONField(serializers.JSONField):
    def to_internal_value(self, data):
        if isinstance(data, str):
            try:
                data = json.loads(data)
            except json.JSONDecodeError:
                self.fail('invalid')
        return super().to_internal_value(data)

class ProfileSerializer(PublicModelSerializer):
    other_links = FlexibleJSONField(required=False)
    clear_profile_picture = serializers.BooleanField(write_only=True, required=False)
    class Meta:
        model = Profile
        fields = '__all__'
        read_only_fields = ['id', 'updated_at']

    def create(self, validated_data):
        validated_data.pop('clear_profile_picture', None)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if validated_data.pop('clear_profile_picture', False) and instance.profile_picture:
            instance.profile_picture.delete(save=False)
            instance.profile_picture = ''
        return super().update(instance, validated_data)

class SkillSerializer(PublicModelSerializer):
    proficiency = serializers.IntegerField(required=False, min_value=0, max_value=100)

    class Meta:
        model = Skill
        fields = '__all__'
        read_only_fields = ['id']

    def create(self, validated_data):
        validated_data.setdefault('proficiency', 0)
        return super().create(validated_data)

class ProjectSerializer(PublicModelSerializer):
    technologies = FlexibleJSONField(required=False)
    clear_image = serializers.BooleanField(write_only=True, required=False)
    class Meta:
        model = Project
        fields = '__all__'
        read_only_fields = ['id', 'created_at']

    def create(self, validated_data):
        validated_data.pop('clear_image', None)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if validated_data.pop('clear_image', False) and instance.image:
            instance.image.delete(save=False)
            instance.image = ''
        return super().update(instance, validated_data)

class ExperienceSerializer(PublicModelSerializer):
    class Meta:
        model = Experience
        fields = '__all__'
        read_only_fields = ['id']

class EducationSerializer(PublicModelSerializer):
    class Meta:
        model = Education
        fields = '__all__'
        read_only_fields = ['id']

class CertificationSerializer(PublicModelSerializer):
    class Meta:
        model = Certification
        fields = '__all__'
        read_only_fields = ['id']

class ResumeSerializer(PublicModelSerializer):
    class Meta:
        model = Resume
        fields = ['id', 'file', 'original_name', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']
    def create(self, validated_data):
        for existing in Resume.objects.all():
            existing.file.delete(save=False)
            existing.delete()
        return super().create(validated_data)

class ContactMessageSerializer(serializers.ModelSerializer):
    website = serializers.CharField(write_only=True, required=False, allow_blank=True)
    class Meta:
        model = ContactMessage
        fields = ['id', 'name', 'email', 'subject', 'message', 'created_at', 'is_read', 'website']
        read_only_fields = ['id', 'created_at', 'is_read']
    def validate_website(self, value):
        if value: raise serializers.ValidationError('Spam detected.')
        return value
    def create(self, validated_data):
        validated_data.pop('website', None)
        return super().create(validated_data)

class WebsiteSettingsSerializer(PublicModelSerializer):
    class Meta:
        model = WebsiteSettings
        fields = '__all__'
        read_only_fields = ['id', 'updated_at']
