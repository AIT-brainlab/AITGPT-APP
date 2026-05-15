"""
URL configuration for backend project.
"""
from django.contrib import admin
from django.urls import path, include

from core import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/signup/', views.signup, name='signup'),
    path('api/auth/login/', views.login, name='login'),
    path('api/auth/logout/', views.logout, name='logout'),
    path('api/auth/profile/', views.user_profile, name='profile'),
    path('api/langflow/chat/', views.langflow_chat, name='langflow_chat'),
    path('api/langflow/chat/test/', views.langflow_chat_test, name='langflow_chat_test'),
    path('api/tasks/', include('tasks.urls')),
]
