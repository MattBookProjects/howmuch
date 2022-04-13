from django.test import TestCase, Client
from django.urls import reverse
from .views import *


class RegisterTestCase(TestCase):

    def setUp(self):
        self.client = Client()

    def test_register_correct(self):
        response = self.client.post(reverse('register'), json.dumps({"username": "username1", "password": "password1"}), content_type='application/json')
        self.assertEqual(response.status_code, 201)

    def test_register_username_taken(self):
        User.objects.create(username='username1', password='password1')
        response = self.client.post(reverse('register'), json.dumps({"username": "username1", "password": "password1"}), content_type='application/json')
        self.assertEqual((response.status_code, response.json()["message"]), (409, "Username is already taken"))

    def test_register_missing_request_body(self):
        response = self.client.post(reverse('register'))
        self.assertEqual((response.status_code, response.json()["message"]), (400, "Missing request body"))

    def test_register_missing_username_parameter(self):
        response = self.client.post(reverse('register'), json.dumps({"password": "password1"}), content_type='application/json')
        self.assertEqual((response.status_code, response.json()["message"]), (400, "Missing username parameter"))

    def test_register_missing_password_parameter(self):
        response = self.client.post(reverse('register'), json.dumps({"username": "username1"}), content_type='application/json')
        self.assertEqual((response.status_code, response.json()["message"]), (400, "Missing password parameter"))


class LoginTestCase(TestCase):

    def setUp(self):
        self.client = Client()
        User.objects.create_user(username="username1", password="password1")

    def test_login_view_correct(self):
        response = self.client.post(reverse('login'), json.dumps({"username": "username1", "password": "password1"}), content_type="application/json")
        self.assertEqual((response.status_code, response.json()["message"]), (200, "Logged in successfully"))

    def test_login_view_already_logged_in(self):
        self.client.login(username="username1", password="password1")
        response = self.client.post(reverse('login'), json.dumps({"username": "username1", "password": "password1"}), content_type="application/json")
        self.assertEqual((response.status_code, response.json()["message"]), (403, "User already logged in"))

    def test_login_view_incorrect_username(self):
        response = self.client.post(reverse('login'), json.dumps({"username": "username", "password": "password1"}), content_type="application/json")
        self.assertEqual((response.status_code, response.json()["message"]), (401, "Incorrect username or password"))

    def test_login_view_incorrect_password(self):
        response = self.client.post(reverse('login'), json.dumps({"username": "username1", "password": "password"}), content_type="application/json")
        self.assertEqual((response.status_code, response.json()["message"]), (401, "Incorrect username or password"))

    def test_login_view_incorrect_login_and_password(self):
        response = self.client.post(reverse('login'), json.dumps({"username": "username", "password": "password"}), content_type="application/json")
        self.assertEqual((response.status_code, response.json()["message"]), (401, "Incorrect username or password"))

    def test_login_view_missing_request_body(self):
        response = self.client.post(reverse('login'))
        self.assertEqual((response.status_code, response.json()["message"]), (400, "Missing request body"))

    def test_login_view_missing_username_parameter(self):
        response = self.client.post(reverse('login'), json.dumps({"password": "password"}), content_type='application/json')
        self.assertEqual((response.status_code, response.json()["message"]), (400, "Missing username parameter"))

    def test_login_view_missing_password_parameter(self):
        response = self.client.post(reverse('login'), json.dumps({"username": "username"}), content_type='application/json')
        self.assertEqual((response.status_code, response.json()["message"]), (400, "Missing password parameter"))

    def test_login_view_incorrect_request_method(self):
        response = self.client.get(reverse('login'))
        self.assertEqual((response.status_code, response.json()["message"]), (400, "Incorrect request method"))
        