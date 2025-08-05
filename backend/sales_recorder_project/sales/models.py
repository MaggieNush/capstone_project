from django.db import models
from clients.models import Client  # Import Client model from clients app
from core.models import Flavor  # Import Flavor model from core app
from users.models import UserProfile  # Import UserProfile model from users app

class Sale(models.Model):
    """
    """