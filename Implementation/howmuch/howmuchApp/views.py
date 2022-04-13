from django.shortcuts import render
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.contrib.auth import authenticate, login, logout
from .models import User
import json


def index(request):
    return render(request, "howmuchApp/index.html")

def get_csrf_token(request):
    return JsonResponse({"token": get_token(request)})

def register(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
        except:
            return JsonResponse({"message": "Missing request body"}, status=400)

        username = data.get('username')
        if username is None:
            return JsonResponse({"message": "Missing username parameter"}, status=400)
        
        password = data.get('password')
        if password is None:
            return JsonResponse({"message": "Missing password parameter"}, status=400)
        try:
            User.objects.create_user(username=username, password=password)
        except:
            return JsonResponse({"message": "Username is already taken"}, status=409)

        return JsonResponse({"message": "Successfully registered new user"}, status=201)

    return JsonResponse({"message": "POST method required"}, status=400)


def login_view(request):
    if request.method == "POST":
        if request.user.is_authenticated:
            return JsonResponse({"message": "User already logged in"}, status=403)
        try: 
            data = json.loads(request.body) 
        except: 
            return JsonResponse({"message": "Missing request body"}, status=400)
        username = data.get('username')
        if username is None:
            return JsonResponse({"message": "Missing username parameter"}, status=400)

        password = data.get('password')
        if password is None:
            return JsonResponse({"message": "Missing password parameter"}, status=400)

        user = authenticate(request, username=username, password=password)
        if user is None:
            return JsonResponse({"message": "Incorrect username or password"}, status=401)
        login(request, user)
        return JsonResponse({"message": "Logged in successfully"}, status=200)
    return JsonResponse({"message": "Incorrect request method"}, status=400)


def user_short_form(request):
    if request.method == "GET":
        if request.user.is_authenticated:
            return JsonResponse({"user": request.user.to_short_form()})

        return JsonResponse({"user": None})

    return JsonResponse({"message": "GET method required"}, status=400)

