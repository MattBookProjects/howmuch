from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    is_admin = models.BooleanField(default=False)
    
    def to_short_form(self):
        return {
            "ID": self.id,
            "username": self.username,
            "is_admin": self.is_admin
        }

