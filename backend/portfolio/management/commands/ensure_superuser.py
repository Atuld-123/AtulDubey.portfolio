import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = 'Create the initial staff superuser from deployment environment variables.'

    def handle(self, *args, **options):
        username = os.getenv('DJANGO_SUPERUSER_USERNAME', '').strip()
        email = os.getenv('DJANGO_SUPERUSER_EMAIL', '').strip()
        password = os.getenv('DJANGO_SUPERUSER_PASSWORD', '')
        if not username or not email or not password:
            self.stdout.write('Initial superuser credentials are not configured; skipping.')
            return

        user_model = get_user_model()
        if user_model.objects.filter(username=username).exists():
            self.stdout.write(f'Superuser {username!r} already exists; skipping.')
            return

        try:
            user_model.objects.create_superuser(username=username, email=email, password=password)
        except (TypeError, ValueError) as exc:
            raise CommandError(f'Could not create initial superuser: {exc}') from exc
        self.stdout.write(self.style.SUCCESS(f'Created initial superuser {username!r}.'))
