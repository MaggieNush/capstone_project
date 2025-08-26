from rest_framework import viewsets, status
from rest_framework.response import Response
from django.db.models import Sum
from .models import Order, Payment
from rest_framework.permissions import IsAuthenticated
from .serializers import OrderSerializer, PaymentSerializer
from users.permissions import IsAdminUser, IsSalesperson, IsOwnerOfOrder, IsOwnerOfPayment
from users.models import UserProfile 


class OrderViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows orders to be viewed, created, or edited.
    Salespersons manage their own orders. Admins manage all orders.
    """
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated, IsOwnerOfOrder]

    def get_queryset(self):
        """
        Filter orders based on user role.
        Salespersons only see orders they recorded.
        Admins see all orders and can apply filters.
        """
        user = self.request.user
        if hasattr(user, 'profile'):
            if user.profile.role == 'admin':
                queryset = Order.objects.all()
                # Admin can filter by salesperson, client, date range, payment status
                salesperson_id = self.request.query_params.get('salesperson_id')
                client_id = self.request.query_params.get('client_id')
                start_date = self.request.query_params.get('start_date')
                end_date = self.request.query_params.get('end_date')
                payment_status = self.request.query_params.get('payment_status')

                if salesperson_id:
                    queryset = queryset.filter(salesperson__user__id=salesperson_id)
                if client_id:
                    queryset = queryset.filter(client__id=client_id)
                if start_date:
                    queryset = queryset.filter(order_date__gte=start_date)
                if end_date:
                    queryset = queryset.filter(order_date__lte=end_date)
                if payment_status:
                    queryset = queryset.filter(payment_status=payment_status)

                return queryset.select_related('client', 'salesperson__user').prefetch_related('order_items__flavor').order_by('-order_date')
            elif user.profile.role == 'salesperson':
                return Order.objects.filter(salesperson=user.profile).select_related('client', 'salesperson__user').prefetch_related('order_items__flavor').order_by('-order_date')
        return Order.objects.none()

    def perform_create(self, serializer):
        # Salesperson is automatically set by the serializer's create method
        serializer.save()

    def perform_update(self, serializer):
        # Update order and its items, recalculate total
        serializer.save()


class PaymentViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows payments to be viewed, created, or edited.
    Salespersons manage their own recorded payments. Admins manage all payments.
    """
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated, IsOwnerOfPayment]

    def get_queryset(self):
        """
        Filter payments based on user role.
        Salespersons only see payments they recorded.
        Admins see all payments and can apply filters.
        """
        user = self.request.user
        if hasattr(user, 'profile'):
            if user.profile.role == 'admin':
                queryset = Payment.objects.all()
                # Admin can filter by salesperson, client, date range
                salesperson_id = self.request.query_params.get('salesperson_id')
                client_id = self.request.query_params.get('client_id')
                start_date = self.request.query_params.get('start_date')
                end_date = self.request.query_params.get('end_date')

                if salesperson_id:
                    queryset = queryset.filter(recorded_by_salesperson__user__id=salesperson_id)
                if client_id:
                    queryset = queryset.filter(client__id=client_id)
                if start_date:
                    queryset = queryset.filter(payment_date__gte=start_date)
                if end_date:
                    queryset = queryset.filter(payment_date__lte=end_date)

                return queryset.select_related('client', 'order', 'recorded_by_salesperson__user').order_by('-payment_date')
            elif user.profile.role == 'salesperson':
                return Payment.objects.filter(recorded_by_salesperson=user.profile).select_related('client', 'order', 'recorded_by_salesperson__user').order_by('-payment_date')
        return Payment.objects.none()

    def perform_create(self, serializer):
        # The `recorded_by_salesperson` is automatically set by the serializer's create method
        serializer.save()
