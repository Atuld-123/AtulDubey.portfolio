from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from .validators import validate_image, validate_pdf

class Profile(models.Model):
    full_name = models.CharField(max_length=160, default='Atul Kumar Dubey')
    professional_title = models.CharField(max_length=180, blank=True)
    short_intro = models.TextField(blank=True)
    about_heading = models.CharField(max_length=180, blank=True, default='From raw records to clear decisions.')
    about_me = models.TextField(blank=True)
    contact_intro = models.TextField(blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=40, blank=True)
    location = models.CharField(max_length=120, blank=True)
    linkedin_url = models.URLField(blank=True)
    github_url = models.URLField(blank=True)
    other_links = models.JSONField(default=list, blank=True)
    availability_status = models.CharField(max_length=120, blank=True, default='Open to opportunities')
    profile_picture = models.ImageField(upload_to='profile/', blank=True, validators=[validate_image])
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self): return self.full_name

class OrderedModel(models.Model):
    order = models.PositiveIntegerField(default=0)
    class Meta: abstract = True

class Skill(OrderedModel):
    CATEGORIES = [(x, x) for x in ['Programming', 'Backend Development', 'Databases', 'Cybersecurity', 'Networking', 'Linux', 'Cloud', 'DevOps', 'Tools', 'Analytics & BI', 'Other']]
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=60, choices=CATEGORIES, default='Other')
    description = models.CharField(max_length=300, blank=True)
    proficiency = models.PositiveSmallIntegerField(null=True, blank=True, default=None, validators=[MinValueValidator(0), MaxValueValidator(100)])
    icon = models.CharField(max_length=80, blank=True)
    class Meta: ordering = ['order', 'name']
    def __str__(self): return self.name

class Project(OrderedModel):
    STATUS = [('Completed', 'Completed'), ('In Progress', 'In Progress'), ('Planned', 'Planned')]
    title = models.CharField(max_length=180)
    description = models.TextField()
    technologies = models.JSONField(default=list, blank=True)
    image = models.ImageField(upload_to='projects/', blank=True, validators=[validate_image])
    github_url = models.URLField(blank=True)
    live_url = models.URLField(blank=True)
    category = models.CharField(max_length=100, default='Other')
    status = models.CharField(max_length=20, choices=STATUS, default='Completed')
    featured = models.BooleanField(default=False)
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta: ordering = ['order', '-featured', '-created_at']
    def __str__(self): return self.title

class Experience(OrderedModel):
    job_title = models.CharField(max_length=160)
    company = models.CharField(max_length=160)
    location = models.CharField(max_length=120, blank=True)
    start_date = models.CharField(max_length=30, blank=True)
    end_date = models.CharField(max_length=30, blank=True)
    is_current = models.BooleanField(default=False)
    description = models.TextField(blank=True)
    class Meta: ordering = ['order', '-id']
    def __str__(self): return f'{self.job_title} — {self.company}'

class Education(OrderedModel):
    degree = models.CharField(max_length=180)
    institution = models.CharField(max_length=180)
    location = models.CharField(max_length=120, blank=True)
    start_date = models.CharField(max_length=30, blank=True)
    end_date = models.CharField(max_length=30, blank=True)
    description = models.TextField(blank=True)
    class Meta: ordering = ['order', '-id']
    def __str__(self): return self.degree

class Certification(OrderedModel):
    name = models.CharField(max_length=180)
    issuer = models.CharField(max_length=180, blank=True)
    issue_date = models.CharField(max_length=40, blank=True)
    credential_url = models.URLField(blank=True)
    class Meta: ordering = ['order', '-id']
    def __str__(self): return self.name

class Resume(models.Model):
    file = models.FileField(upload_to='resume/', validators=[validate_pdf])
    original_name = models.CharField(max_length=255, blank=True)
    uploaded_at = models.DateTimeField(auto_now=True)
    def __str__(self): return self.original_name or self.file.name

class ContactMessage(models.Model):
    name = models.CharField(max_length=120)
    email = models.EmailField()
    subject = models.CharField(max_length=180)
    message = models.TextField(max_length=5000)
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    class Meta: ordering = ['-created_at']
    def __str__(self): return f'{self.subject} from {self.name}'

class WebsiteSettings(models.Model):
    site_title = models.CharField(max_length=180, default='Atul Kumar Dubey | Portfolio')
    meta_description = models.CharField(max_length=300, blank=True)
    footer_text = models.CharField(max_length=240, blank=True)
    allow_contact_form = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self): return self.site_title
