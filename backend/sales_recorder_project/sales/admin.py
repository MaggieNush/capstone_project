from django.contrib import admin
from .models import Order, OrderItem, Payment

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 1 # Allows adding multiple items in the same order

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'client', 'salesperson', 'order_date', 'total_amount', 'payment_status', 'created_at')
    list_filter = ('payment_status', 'order_date', 'salesperson__user__username', 'client__name')
    search_fields = ('client__name', 'salesperson__user__username')
    inlines = [OrderItemInline]
    raw_id_fields = ('client','salesperson',)  # Useful for large number of clients and salespersons

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('id', 'client', 'order', 'amount_paid', 'payment_date', 'recorded_by_salesperson', 'created_at')
    list_filter = ('payment_date', 'payment_method', 'client__name', 'recorded_by_salesperson__user__username')
    search_fields = ('client__name', 'recorded_by_salesperson__user__username')
    raw_id_fields = ('client', 'order', 'recorded_by_salesperson')