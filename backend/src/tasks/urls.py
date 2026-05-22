from django.urls import path
from . import views

app_name = 'tasks'

urlpatterns = [
    path('health/', views.health_check, name='health_check'),
    path('write/', views.async_write, name='async_write'),
    path('read/', views.async_read, name='async_read'),
    path('chat-log/', views.chat_log_read, name='chat_log_read'),
    path('chat-log/write/', views.chat_log_write, name='chat_log_write'),
    path('chat-log/test-logic/', views.chat_log_test_logic, name='chat_log_test_logic'),
]
