from django.db import migrations, models
import django.core.validators


class Migration(migrations.Migration):
    dependencies = [('portfolio', '0001_initial')]

    operations = [
        migrations.AlterField(
            model_name='skill',
            name='proficiency',
            field=models.PositiveSmallIntegerField(
                default=0,
                validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(100)],
            ),
        ),
    ]
