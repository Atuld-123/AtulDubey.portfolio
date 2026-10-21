from io import BytesIO
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from rest_framework.test import APIClient
from PIL import Image
from .models import ContactMessage, Profile, Project, Resume, Skill

class PortfolioApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.staff = get_user_model().objects.create_user(username='editor', password='StrongPassword123!', is_staff=True)

    def test_public_profile_read_and_staff_write(self):
        profile = Profile.objects.create(full_name='Portfolio Owner')
        self.assertEqual(self.client.get('/api/profile/').status_code, 200)
        denied = self.client.patch('/api/profile/', {'full_name': 'Changed'}, format='json')
        self.assertIn(denied.status_code, (401, 403))
        self.client.force_authenticate(self.staff)
        saved = self.client.patch('/api/profile/', {'full_name': 'Updated Owner'}, format='json')
        self.assertEqual(saved.status_code, 200)
        profile.refresh_from_db()
        self.assertEqual(profile.full_name, 'Updated Owner')

    def test_contact_messages_are_private_and_honeypot_rejects_spam(self):
        self.assertIn(self.client.get('/api/messages/').status_code, (401, 403))
        bad = self.client.post('/api/contact/', {'name': 'Bot', 'email': 'bot@example.com', 'subject': 'Spam', 'message': 'Hi', 'website': 'filled'}, format='json')
        self.assertEqual(bad.status_code, 400)
        good = self.client.post('/api/contact/', {'name': 'Visitor', 'email': 'visitor@example.com', 'subject': 'Hello', 'message': 'A real message', 'website': ''}, format='json')
        self.assertEqual(good.status_code, 201)
        self.assertEqual(ContactMessage.objects.count(), 1)
        self.client.force_authenticate(self.staff)
        self.assertEqual(self.client.get('/api/messages/').status_code, 200)

    def test_staff_can_create_and_delete_skills(self):
        self.assertIn(self.client.post('/api/skills/', {'name': 'SQL'}, format='json').status_code, (401, 403))
        self.client.force_authenticate(self.staff)
        created = self.client.post('/api/skills/', {'name': 'SQL', 'category': 'Databases'}, format='json')
        self.assertEqual(created.status_code, 201)
        self.assertEqual(self.client.delete(f"/api/skills/{created.data['id']}/").status_code, 204)
        self.assertEqual(Skill.objects.count(), 0)

    def test_staff_can_manage_projects_and_publish(self):
        self.client.force_authenticate(self.staff)
        created = self.client.post('/api/projects/', {'title': 'CMS Project', 'description': 'Editable project', 'is_published': False}, format='json')
        self.assertEqual(created.status_code, 201)
        self.client.force_authenticate(user=None)
        self.assertEqual(self.client.get('/api/projects/').data['count'], 0)
        self.client.force_authenticate(self.staff)
        self.assertEqual(self.client.get('/api/projects/').data['count'], 1)
        project_id = created.data['id']
        updated = self.client.patch(f'/api/projects/{project_id}/', {'is_published': True}, format='json')
        self.assertEqual(updated.status_code, 200)
        self.assertEqual(self.client.get('/api/projects/').data['count'], 1)
        self.assertEqual(self.client.delete(f'/api/projects/{project_id}/').status_code, 204)

    def test_staff_can_upload_valid_image_and_resume(self):
        self.client.force_authenticate(self.staff)
        buffer = BytesIO()
        Image.new('RGB', (1, 1), color='teal').save(buffer, format='PNG')
        picture = SimpleUploadedFile('profile.png', buffer.getvalue(), content_type='image/png')
        profile = self.client.patch('/api/profile/', {'profile_picture': picture}, format='multipart')
        self.assertEqual(profile.status_code, 200, profile.data)
        cleared = self.client.patch('/api/profile/', {'clear_profile_picture': True}, format='json')
        self.assertEqual(cleared.status_code, 200)
        self.assertFalse(cleared.data['profile_picture'])
        pdf = SimpleUploadedFile('resume.pdf', b'%PDF-1.4\nportfolio test\n%%EOF', content_type='application/pdf')
        uploaded = self.client.post('/api/resume/', {'file': pdf}, format='multipart')
        self.assertEqual(uploaded.status_code, 201)
        self.assertEqual(self.client.get('/api/resume/').status_code, 200)
        self.assertEqual(Resume.objects.count(), 1)

    def test_multipart_json_fields_are_decoded(self):
        self.client.force_authenticate(self.staff)
        profile = self.client.patch('/api/profile/', {'other_links': '[{"label":"Website","url":"https://example.com"}]'}, format='multipart')
        self.assertEqual(profile.status_code, 200)
        self.assertEqual(profile.data['other_links'][0]['url'], 'https://example.com')
        project = self.client.post('/api/projects/', {'title': 'JSON test', 'description': 'Stack', 'technologies': '["Python","SQL"]'}, format='multipart')
        self.assertEqual(project.status_code, 201)
        self.assertEqual(project.data['technologies'], ['Python', 'SQL'])

    def test_session_login_and_csrf_protection(self):
        client = APIClient(enforce_csrf_checks=True)
        csrf = client.get('/api/auth/csrf/')
        token = csrf.data['csrfToken']
        logged_in = client.post('/api/auth/login/', {'username': 'editor', 'password': 'StrongPassword123!'}, format='json', HTTP_X_CSRFTOKEN=token)
        self.assertEqual(logged_in.status_code, 200)
        self.assertTrue(client.get('/api/auth/me/').data['authenticated'])
        rotated_token = client.get('/api/auth/csrf/').data['csrfToken']
        logged_out = client.post('/api/auth/logout/', {}, format='json', HTTP_X_CSRFTOKEN=rotated_token)
        self.assertEqual(logged_out.status_code, 200)

    def test_pdf_signature_validator_rejects_non_pdf(self):
        self.client.force_authenticate(self.staff)
        upload = SimpleUploadedFile('resume.pdf', b'not a pdf', content_type='application/pdf')
        response = self.client.post('/api/resume/', {'file': upload}, format='multipart')
        self.assertEqual(response.status_code, 400)
