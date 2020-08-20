from django.contrib import admin
from django.urls import path,include
from . import views

app_name="account"
urlpatterns = [
    path('',views.account,name='account'),
    path('logout/',views.logout,name='logout'),
    path('login/',views.login,name='login'),
    path('profile/<int:user_id>/',views.profile,name='profile'),
    path('snap_profile/<int:user_id>/',views.snap_profile,name='snap_profile'),
    path('follow/',views.follow,name='follow'),
    path('unfollow/',views.unfollow,name='unfollow'),
]
