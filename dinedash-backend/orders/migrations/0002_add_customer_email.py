# Generated manually to add customer_email field to Order model

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='customer_email',
            field=models.EmailField(blank=True, help_text='Customer email address for payment processing and notifications.', null=True),
        ),
    ]
