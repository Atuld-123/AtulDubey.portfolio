from django.core.management.base import BaseCommand
from portfolio.models import Profile, Skill, Project, Experience, Education, Certification, WebsiteSettings

class Command(BaseCommand):
    help = 'Create starter portfolio content. Existing entries are left unchanged.'

    def handle(self, *args, **options):
        Profile.objects.get_or_create(pk=1, defaults={
            'full_name': 'Atul Kumar Dubey',
            'professional_title': 'Data & Analytics Professional',
            'short_intro': 'I build reliable data workflows and turn complex information into useful insights.',
            'about_heading': 'From raw records to clear decisions.',
            'about_me': 'I work across SQL, Python, Snowflake, and Power BI, with experience in reporting, data transformation, and data quality.',
            'contact_intro': 'Have an opportunity or question? Send me a message.',
            'email': 'dubeyatul0490@gmail.com', 'location': 'India',
            'github_url': 'https://github.com/Atuld-123',
            'linkedin_url': '',
            'availability_status': 'Open to opportunities',
        })
        skills = [
            ('Python', 'Programming', 75), ('Pandas', 'Programming', 70), ('PySpark', 'Programming', 65),
            ('SQL', 'Databases', 80), ('Snowflake', 'Databases', 65), ('Power BI', 'Analytics & BI', 70),
            ('Advanced Excel', 'Tools', 80), ('Git / GitHub', 'Tools', 65),
        ]
        for order, (name, category, proficiency) in enumerate(skills):
            Skill.objects.get_or_create(name=name, defaults={'category': category, 'proficiency': proficiency, 'order': order})
        Project.objects.get_or_create(title='Product Analytics Data Pipeline', defaults={
            'description': 'A repeatable pipeline that extracts product API data, validates and transforms records, and prepares analytics-ready data for a Snowflake warehouse.',
            'technologies': ['Python', 'Pandas', 'PySpark', 'SQL', 'Snowflake'], 'category': 'Data Engineering',
            'status': 'In Progress', 'featured': True, 'is_published': True,
            'github_url': 'https://github.com/Atuld-123/product-analytics-data-pipeline', 'order': 0,
        })
        Project.objects.get_or_create(title='Data Analytics Certification Project', defaults={
            'description': 'Practice in data cleaning, transformation, visualization, and reporting for business decision support.',
            'technologies': ['Advanced Excel', 'SQL', 'Power BI'], 'category': 'Business Intelligence',
            'status': 'Completed', 'is_published': True, 'github_url': 'https://www.acciojob.com/', 'order': 1,
        })
        Experience.objects.get_or_create(job_title='GIS Data Analyst', company='Geohunt Solutions Pvt. Ltd.', defaults={
            'location': 'India', 'start_date': 'Apr 2026', 'end_date': 'Sep 2026',
            'description': 'Wrote SQL for project reporting, transformed data with Python and Spark, maintained Snowflake data-quality checks, and built Power BI reports.', 'order': 0,
        })
        Experience.objects.get_or_create(job_title='Server Engineer', company='Allied Digital Services', defaults={
            'location': 'India', 'start_date': 'Jan 2025', 'end_date': 'Apr 2026',
            'description': 'Produced operational reports and supported database backup, recovery, endpoint configuration, networking, and Windows troubleshooting.', 'order': 1,
        })
        Education.objects.get_or_create(degree='B.Tech, Computer Science and Engineering', institution='Shambhunath Institute of Engineering and Technology', defaults={
            'location': 'Prayagraj', 'start_date': '2021', 'end_date': '2024', 'description': 'CGPA 6.8', 'order': 0,
        })
        Certification.objects.get_or_create(name='Data Analyst Certification', issuer='AccioJob', defaults={
            'credential_url': '', 'order': 0,
        })
        WebsiteSettings.objects.get_or_create(pk=1, defaults={'site_title': 'Atul Kumar Dubey | Data & Analytics Portfolio', 'meta_description': 'Portfolio of Atul Kumar Dubey, a data and analytics professional.', 'footer_text': 'Designed around data, built with intent.'})
        self.stdout.write(self.style.SUCCESS('Starter portfolio content is ready. Review and edit it in /admin-panel/.'))
