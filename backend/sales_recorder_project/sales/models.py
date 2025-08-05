from django.db import models
from clients.models import Client  # Import Client model from clients app
from core.models import Flavor  # Import Flavor model from core app
from users.models import UserProfile  # Import UserProfile model from users app

class Order(models.Model):
    """
    Represents a sale made by a client
    """
    PAYMENT_STATUS_CHOICES = [
        ('paid', 'Paid'),
        ('outstanding', 'Outstanding'),
    ]

    client = models.ForeignKey(Client, on_delete=models.PROTECT, related_name='orders')
    sales_person = models.ForeignKey(
        UserProfile,
        on_delete=models.PROTECT, # If sales person is deleted, the sale remains but without a sales person
        related_name='recorded_orders',
        limit_choices_to={'role': 'sales_person'},  # Only allow sales persons to record sales
    )

    order_date = models.DateTimeField(auto_now_add=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default='outstanding'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order {self.id} for {self.client.name} by {self.sales_person.user.username} on {self.order_date.strftime('%Y-%m-%d %H:%M:%S')}"

class OrderItem(models.Model):
    """
    Represents an item in a sale order
    """
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='order_items')
    flavor = models.ForeignKey(Flavor, on_delete=models.PROTECT, related_name='order_items')
    quantity_liters = models.DecimalField(max_digits=10, decimal_places=2)
    price_per_liter = models.DecimalField(max_digits=10, decimal_places=2)
    item_total = models.DecimalField(max_digits=10, decimal_places=2) # Calculated as quantity_liters * price_per_liter
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.quantity}L of {self.flavor.name} for Order{self.order.id}"
    
class Payment(models.Model):
    """"
    Records payments by a client
    Can be linked to an order or a general payment
    """
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='payments'),
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
    recorded_by_sales_person = models.ForeignKey(
        UserProfile,
        on_delete=models.PROTECT, # Protects payment if a sales person is deleted
        related_name='recorded_payments',
        limit_choices_to={'role': 'sales_person'},  # Only allow sales persons to record payments
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Payment of {self.amount_paid} by {self.client.name} on {self.payment_date}"