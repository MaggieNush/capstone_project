from django.db import models
from clients.models import Client
from core.models import Flavor
from users.models import UserProfile

class Order(models.Model):
    """
    Represents a sale made by a client
    """
    PAYMENT_STATUS_CHOICES = [
        ('paid', 'Paid'),
        ('outstanding', 'Outstanding'),
    ]

    client = models.ForeignKey(Client, on_delete=models.PROTECT, related_name='orders')
    salesperson = models.ForeignKey(
        UserProfile,
        on_delete=models.PROTECT, # If salesperson is deleted, the sale remains but without a salesperson
        related_name='recorded_orders',
        limit_choices_to={'role': 'salesperson'},  # Only allow salespersons to record sales
    )

    order_date = models.DateTimeField(auto_now_add=True)
    # total_amount will be calculated by the serializer after order items are added
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default='outstanding'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order {self.id} for {self.client.name} by {self.salesperson.user.username} on {self.order_date}"

class OrderItem(models.Model):
    """
    Represents an item in a sale order
    """
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='order_items')
    flavor = models.ForeignKey(Flavor, on_delete=models.PROTECT, related_name='order_items')
    quantity_liters = models.DecimalField(max_digits=10, decimal_places=2)
    price_per_liter_at_sale = models.DecimalField(max_digits=10, decimal_places=2)
    item_total = models.DecimalField(max_digits=10, decimal_places=2) # Calculated as quantity_liters * price_per_liter_at_sale
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.quantity_liters}L of {self.flavor.name} for Order{self.order.id}" # Corrected quantity reference

class Payment(models.Model):
    """"
    Records payments by a client
    Can be linked to an order or a general payment
    """
    client = models.ForeignKey(Client, on_delete=models.PROTECT, related_name='payments')
    order = models.ForeignKey(
        Order,
        on_delete=models.SET_NULL, # If order is deleted, payment remains but unlinked
        related_name='payments',
        null=True,
        blank=True
    )
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2)
    payment_date = models.DateTimeField()
    payment_method = models.CharField(max_length=50, null=True, blank=True)  # e.g., Cash, Mpesa, Bank Transfer
    recorded_by_salesperson = models.ForeignKey(
        UserProfile,
        on_delete=models.PROTECT, # Protects payment if a salesperson is deleted
        related_name='recorded_payments',
        limit_choices_to={'role': 'salesperson'},  # Only allow salespersons to record payments
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Payment of {self.amount_paid} by {self.client.name} on {self.payment_date}"
