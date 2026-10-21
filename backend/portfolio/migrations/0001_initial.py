# Generated for the first release of the portfolio CMS.
import django.core.validators
import django.db.models.deletion
import portfolio.validators
from django.db import migrations, models

class Migration(migrations.Migration):
    initial = True
    dependencies = []
    operations = [
        migrations.CreateModel(name='Certification', fields=[
            ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ('order', models.PositiveIntegerField(default=0)), ('name', models.CharField(max_length=180)),
            ('issuer', models.CharField(blank=True, max_length=180)), ('issue_date', models.CharField(blank=True, max_length=40)),
            ('credential_url', models.URLField(blank=True)),
        ], options={'ordering': ['order', '-id']}),
        migrations.CreateModel(name='Education', fields=[
            ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ('order', models.PositiveIntegerField(default=0)), ('degree', models.CharField(max_length=180)),
            ('institution', models.CharField(max_length=180)), ('location', models.CharField(blank=True, max_length=120)),
            ('start_date', models.CharField(blank=True, max_length=30)), ('end_date', models.CharField(blank=True, max_length=30)),
            ('description', models.TextField(blank=True)),
        ], options={'ordering': ['order', '-id']}),
        migrations.CreateModel(name='Experience', fields=[
            ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ('order', models.PositiveIntegerField(default=0)), ('job_title', models.CharField(max_length=160)),
            ('company', models.CharField(max_length=160)), ('location', models.CharField(blank=True, max_length=120)),
            ('start_date', models.CharField(blank=True, max_length=30)), ('end_date', models.CharField(blank=True, max_length=30)),
            ('is_current', models.BooleanField(default=False)), ('description', models.TextField(blank=True)),
        ], options={'ordering': ['order', '-id']}),
        migrations.CreateModel(name='Profile', fields=[
            ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ('full_name', models.CharField(default='Atul Kumar Dubey', max_length=160)),
            ('professional_title', models.CharField(blank=True, max_length=180)), ('short_intro', models.TextField(blank=True)),
            ('about_heading', models.CharField(blank=True, default='From raw records to clear decisions.', max_length=180)),
            ('about_me', models.TextField(blank=True)), ('contact_intro', models.TextField(blank=True)),
            ('email', models.EmailField(blank=True, max_length=254)), ('phone', models.CharField(blank=True, max_length=40)),
            ('location', models.CharField(blank=True, max_length=120)), ('linkedin_url', models.URLField(blank=True)),
            ('github_url', models.URLField(blank=True)), ('other_links', models.JSONField(blank=True, default=list)),
            ('availability_status', models.CharField(blank=True, default='Open to opportunities', max_length=120)),
            ('profile_picture', models.ImageField(blank=True, upload_to='profile/', validators=[portfolio.validators.validate_image])),
            ('updated_at', models.DateTimeField(auto_now=True)),
        ]),
        migrations.CreateModel(name='Project', fields=[
            ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ('order', models.PositiveIntegerField(default=0)), ('title', models.CharField(max_length=180)),
            ('description', models.TextField()), ('technologies', models.JSONField(blank=True, default=list)),
            ('image', models.ImageField(blank=True, upload_to='projects/', validators=[portfolio.validators.validate_image])),
            ('github_url', models.URLField(blank=True)), ('live_url', models.URLField(blank=True)),
            ('category', models.CharField(default='Other', max_length=100)),
            ('status', models.CharField(choices=[('Completed', 'Completed'), ('In Progress', 'In Progress'), ('Planned', 'Planned')], default='Completed', max_length=20)),
            ('featured', models.BooleanField(default=False)), ('is_published', models.BooleanField(default=True)),
            ('created_at', models.DateTimeField(auto_now_add=True)),
        ], options={'ordering': ['order', '-featured', '-created_at']}),
        migrations.CreateModel(name='Resume', fields=[
            ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ('file', models.FileField(upload_to='resume/', validators=[portfolio.validators.validate_pdf])),
            ('original_name', models.CharField(blank=True, max_length=255)), ('uploaded_at', models.DateTimeField(auto_now=True)),
        ]),
        migrations.CreateModel(name='Skill', fields=[
            ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ('order', models.PositiveIntegerField(default=0)), ('name', models.CharField(max_length=100)),
            ('category', models.CharField(choices=[(x, x) for x in ['Programming', 'Backend Development', 'Databases', 'Cybersecurity', 'Networking', 'Linux', 'Cloud', 'DevOps', 'Tools', 'Analytics & BI', 'Other']], default='Other', max_length=60)),
            ('description', models.CharField(blank=True, max_length=300)),
            ('proficiency', models.PositiveSmallIntegerField(default=70, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(100)])),
            ('icon', models.CharField(blank=True, max_length=80)),
        ], options={'ordering': ['order', 'name']}),
        migrations.CreateModel(name='WebsiteSettings', fields=[
            ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ('site_title', models.CharField(default='Atul Kumar Dubey | Portfolio', max_length=180)),
            ('meta_description', models.CharField(blank=True, max_length=300)), ('footer_text', models.CharField(blank=True, max_length=240)),
            ('allow_contact_form', models.BooleanField(default=True)), ('updated_at', models.DateTimeField(auto_now=True)),
        ]),
        migrations.CreateModel(name='ContactMessage', fields=[
            ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ('name', models.CharField(max_length=120)), ('email', models.EmailField(max_length=254)),
            ('subject', models.CharField(max_length=180)), ('message', models.TextField(max_length=5000)),
            ('created_at', models.DateTimeField(auto_now_add=True)), ('is_read', models.BooleanField(default=False)),
        ], options={'ordering': ['-created_at']}),
    ]
