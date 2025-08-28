from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, F, ExpressionWrapper, fields
from django.http import HttpResponse
import csv
import datetime
from datetime import timedelta
from django.db.models.functions import TruncMonth, TruncWeek, TruncDay
from django.db import models
from users.permissions import IsAdminUser, IsSalesperson
from .models import Order, OrderItem
from users.models import UserProfile 
class BaseSalesReportView(APIView):
    """
    Base class for sales report generation. Handles common queryset filtering
    based on user role and CSV response generation.
    """
    permission_classes = [IsAuthenticated]

    def get_queryset_base(self):
        """
        Returns the base queryset for orders, filtered by user role.
        """
        user = self.request.user
        queryset = Order.objects.all()

        # Safely check for user profile before accessing role
        if hasattr(user, 'profile') and user.is_authenticated:
            if user.profile.role == 'salesperson':
                queryset = queryset.filter(salesperson=user.profile)
            elif user.profile.role != 'admin': # If not salesperson or admin, no access
                return Order.objects.none()
        else:
            # If user is not authenticated or has no profile, deny access or return empty queryset
            return Order.objects.none()

        # For reports, we often need order items data, so prefetch it
        queryset = queryset.prefetch_related('order_items__flavor', 'client', 'salesperson__user')
        return queryset

    def generate_csv_response(self, filename, header, data):
        """
        Helper method to generate an HTTPResponse with CSV content.
        """
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        writer = csv.writer(response)
        writer.writerow(header)
        writer.writerows(data)
        return response

class DailySalesReportView(BaseSalesReportView):
    """
    Generates a daily sales report.
    Salespersons get their own daily report. Admins can get any salesperson's or all.
    """
    def get(self, request, *args, **kwargs):
        date_str = request.query_params.get('date')
        if not date_str:
            return Response({"detail": "Date parameter is required (YYYY-MM-DD)."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            report_date = datetime.datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response({"detail": "Invalid date format. Use YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)

        # Get base queryset filtered by user role
        queryset = self.get_queryset_base().filter(order_date__date=report_date)

        # Admin can filter by specific salesperson - ensure request.user.profile exists
        if hasattr(request.user, 'profile') and request.user.profile.role == 'admin':
            salesperson_id = request.query_params.get('salesperson_id')
            if salesperson_id:
                queryset = queryset.filter(salesperson__user__id=salesperson_id)

        # Aggregate total liters sold for each order
        queryset = queryset.annotate(
            total_liters_sold=Sum('order_items__quantity_liters')
        ).order_by('client__name') # Order for consistent reporting

        header = ['Order ID', 'Client Name', 'Salesperson', 'Order Date', 'Total Amount', 'Payment Status', 'Total Liters Sold']
        data = []
        for order in queryset:
            data.append([
                order.id,
                order.client.name,
                order.salesperson.user.username,
                order.order_date.strftime('%Y-%m-%d'),
                order.total_amount,
                order.payment_status,
                order.total_liters_sold if order.total_liters_sold is not None else 0
            ])

        filename = f"daily_sales_report_{report_date}.csv"
        return self.generate_csv_response(filename, header, data)

class WeeklySalesReportView(BaseSalesReportView):
    """
    Generates a weekly sales report (aggregated by day within the week).
    Salespersons get their own weekly report. Admins can get any salesperson's or all.
    """
    def get(self, request, *args, **kwargs):
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')

        if not start_date_str or not end_date_str:
            return Response({"detail": "Start date and end date parameters are required (YYYY-MM-DD)."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            start_date = datetime.datetime.strptime(start_date_str, '%Y-%m-%d').date()
            end_date = datetime.datetime.strptime(end_date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response({"detail": "Invalid date format. Use YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)

        if start_date > end_date:
            return Response({"detail": "Start date cannot be after end date."}, status=status.HTTP_400_BAD_REQUEST)

        queryset = self.get_queryset_base().filter(order_date__date__range=[start_date, end_date])

        # Admin can filter by specific salesperson - ensure request.user.profile exists
        if hasattr(request.user, 'profile') and request.user.profile.role == 'admin':
            salesperson_id = request.query_params.get('salesperson_id')
            if salesperson_id:
                queryset = queryset.filter(salesperson__user__id=salesperson_id)

        # Group by day and aggregate
        report_data = queryset.annotate(
            day=TruncDay('order_date')
        ).values('day').annotate(
            total_sales=Sum('total_amount'),
            num_orders=models.Count('id'),
            total_liters_sold_week=Sum('order_items__quantity_liters')
        ).order_by('day')

        header = ['Date', 'Total Sales', 'Number of Orders', 'Total Liters Sold']
        data = []
        for row in report_data:
            data.append([
                row['day'].strftime('%Y-%m-%d'),
                row['total_sales'],
                row['num_orders'],
                row['total_liters_sold_week']
            ])

        filename = f"weekly_sales_report_{start_date}_to_{end_date}.csv"
        return self.generate_csv_response(filename, header, data)


class MonthlySalesReportView(BaseSalesReportView):
    """
    Generates a monthly sales report (aggregated by week or day within the month).
    Salespersons get their own monthly report. Admins can get any salesperson's or all.
    """
    def get(self, request, *args, **kwargs):
        year = request.query_params.get('year')
        month = request.query_params.get('month')

        if not year or not month:
            return Response({"detail": "Year and month parameters are required."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            year = int(year)
            month = int(month)
            # Validate month/year if needed, e.g., 1-12 for month
            if not (1 <= month <= 12):
                raise ValueError("Month must be between 1 and 12.")
        except ValueError:
            return Response({"detail": "Invalid year or month format."}, status=status.HTTP_400_BAD_REQUEST)

        # Filter for the specific month
        queryset = self.get_queryset_base().filter(order_date__year=year, order_date__month=month)

        # Admin can filter by specific salesperson - ensure request.user.profile exists
        if hasattr(request.user, 'profile') and request.user.profile.role == 'admin':
            salesperson_id = request.query_params.get('salesperson_id')
            if salesperson_id:
                queryset = queryset.filter(salesperson__user__id=salesperson_id)

        # Group by month (or can group by week/day within month if desired)
        report_data = queryset.annotate(
            month=TruncMonth('order_date')
        ).values('month').annotate(
            total_sales=Sum('total_amount'),
            num_orders=models.Count('id'),
            total_liters_sold_month=Sum('order_items__quantity_liters')
        ).order_by('month')

        header = ['Month', 'Total Sales', 'Number of Orders', 'Total Liters Sold']
        data = []
        for row in report_data:
            data.append([
                row['month'].strftime('%Y-%m'), # Format as YYYY-MM
                row['total_sales'],
                row['num_orders'],
                row['total_liters_sold_month']
            ])

        filename = f"monthly_sales_report_{year}-{month}.csv"
        return self.generate_csv_response(filename, header, data)

class YearlySalesReportView(BaseSalesReportView):
    """
    Generates a yearly sales report (aggregated by month within the year).
    Only accessible by Admin users.
    """
    permission_classes = [IsAdminUser] # Override permission for this specific view

    def get(self, request, *args, **kwargs):
        year = request.query_params.get('year')

        if not year:
            return Response({"detail": "Year parameter is required."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            year = int(year)
        except ValueError:
            return Response({"detail": "Invalid year format."}, status=status.HTTP_400_BAD_REQUEST)

        queryset = self.get_queryset_base().filter(order_date__year=year)

        # Admin can still filter by specific salesperson for this yearly report
        # Ensure request.user.profile exists
        if hasattr(request.user, 'profile') and request.user.profile.role == 'admin':
            salesperson_id = request.query_params.get('salesperson_id')
            if salesperson_id:
                queryset = queryset.filter(salesperson__user__id=salesperson_id)

        # Group by month within the year and aggregate
        report_data = queryset.annotate(
            month=TruncMonth('order_date')
        ).values('month', 'salesperson__user__username').annotate(
            total_sales=Sum('total_amount'),
            num_orders=models.Count('id'),
            total_liters_sold_year=Sum('order_items__quantity_liters')
        ).order_by('month', 'salesperson__user__username')

        # For yearly report, it's useful to see sales per salesperson per month
        header = ['Month', 'Salesperson', 'Total Sales', 'Number of Orders', 'Total Liters Sold']
        data = []
        for row in report_data:
            data.append([
                row['month'].strftime('%Y-%m'),
                row['salesperson__user__username'],
                row['total_sales'],
                row['num_orders'],
                row['total_liters_sold_year']
            ])

        filename = f"yearly_sales_report_{year}.csv"
        return self.generate_csv_response(filename, header, data)