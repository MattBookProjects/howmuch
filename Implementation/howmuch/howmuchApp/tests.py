from django.test import TestCase, Client
from django.urls import reverse
from .views import *


class RegisterTestCase(TestCase):

    def setUp(self):
        self.client = Client()

    def test_register_correct(self):
        response = self.client.post(reverse(register), json.dumps({"username": "username1", "password": "password1"}), content_type='application/json')
        self.assertEqual(response.status_code, 201)

    def test_register_username_taken(self):
        User.objects.create(username='username1', password='password1')
        response = self.client.post(reverse(register), json.dumps({"username": "username1", "password": "password1"}), content_type='application/json')
        self.assertEqual((response.status_code, response.json()["message"]), (409, "Username is already taken"))

    def test_register_missing_request_body(self):
        response = self.client.post(reverse(register))
        self.assertEqual((response.status_code, response.json()["message"]), (400, "Missing request body"))

    def test_register_missing_username_parameter(self):
        response = self.client.post(reverse(register), json.dumps({"password": "password1"}), content_type='application/json')
        self.assertEqual((response.status_code, response.json()["message"]), (400, "Missing username parameter"))

    def test_register_missing_password_parameter(self):
        response = self.client.post(reverse(register), json.dumps({"username": "username1"}), content_type='application/json')
        self.assertEqual((response.status_code, response.json()["message"]), (400, "Missing password parameter"))

        