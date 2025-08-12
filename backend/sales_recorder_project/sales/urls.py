from rest_framework.routers import DefaultRouter
from .views import OrderViewSet, PaymentViewSet
from django.urls import path # Import path for custom report endpoints
from . import views_reports

router = DefaultRouter()
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'payments', PaymentViewSet, basename='payment') # Register order and payment viewsets

urlpatterns = router.urls + [
    # Reports endpoints
    path('reports/sales/daily/', views_reports.DailySalesReportView.as_view(), name='daily_sales_report'),
    path('reports/sales/weekly/', views_reports.WeeklySalesReportView.as_view(), name='weekly_sales_report'),
    path('reports/sales/monthly/', views_reports.MonthlySalesReportView.as_view(), name='monthly_sales_report'),
    path('reports/sales/yearly/', views_reports.YearlySalesReportView.as_view(), name='yearly_sales_report'),
    
]