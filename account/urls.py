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
    path('followunfollow/',views.followunfollow,name='followUnfollow'),
    path('updatenotifications/<int:user_id>/',views.updatenotifications,name='updatenotifications'),
    path('loadnotifications/<int:user_id>/',views.loadnotifications,name='loadnotifications')
]
