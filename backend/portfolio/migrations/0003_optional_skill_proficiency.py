from django.db import migrations, models
import django.core.validators

class Migration(migrations.Migration):
    dependencies = [('portfolio', '0002_skill_proficiency_default_zero')]

    operations = [
        migrations.AlterField(
            model_name='skill',
            name='proficiency',
            field=models.PositiveSmallIntegerField(
                blank=True,
                default=None,
                null=True,
                validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(100)],
            ),
        ),
    ]
