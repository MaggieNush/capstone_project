from django.db import models

class Flavor(models.Model):
    """
    Represents various flavors sold by the company.
    """
    name = models.CharField(max_length=100, unique=True)
    base_price_per_liter = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
