from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('register', views.register, name='register'),
    path('user/shortform', views.user_short_form, name='user_short_form'),
    path('csrf', views.get_csrf_token, name='get_csrf_token'),
    path('login', views.login_view, name='login'),
]