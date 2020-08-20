from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.http import HttpResponse,JsonResponse
from polls.templatetags.myfilter import *
from .models import *

#@login_required(login_url='/account/login')
def account(request):
    pass

def login(request):
    pass

def logout(request):
    pass

def profile(request,user_id):
    pass

def snap_profile(request,user_id):
    if(request.method=="GET" and request.user.id):
        try:
            user=User.objects.get(id=int(user_id))
        except Exception as e:
            return HttpResponse('account has deactivated')
        else:
            details={
                'id':user.id,
                'img':user.profile.image.url if user.profile.image else '/media/defaultprofile.jpg',
                'fullname':user.profile.fullname,
                'total_post':shortnumber(user.profile.total_post),
                'total_followers': shortnumber(user.profile.followers_count),
                'total_following': shortnumber(user.profile.following_count),
                'following':True if request.user.profile.following.all() else False,
            }
            return JsonResponse(details,safe=False)

def follow(request):
    if request.method=="POST" and request.user.id==int(request.POST.get('follower')):
        try:
            follower=User.objects.get(id=int(request.POST.get('follower'))).profile
            inspiration=User.objects.get(id=int(request.POST.get('inspiration'))).profile
        except Exception as e:
            return HttpResponse('something wrong')
        else:
            try:
                Follow.objects.get(follower=follower,inspiration=inspiration)
            except Exception as e:
                Follow.objects.create(follower=follower,inspiration=inspiration)
            finally:
                return HttpResponse('ok')
def unfollow(request):
    if request.method=="POST" and request.user.id==int(request.POST.get('follower')):
        try:
            inspiration=User.objects.get(id=int(request.POST.get('inspiration'))).profile
            follow_entry=User.objects.get(id=int(request.POST.get('follower'))).profile.following_table.get(inspiration=inspiration)
        except Exception as e:
            return HttpResponse('something wrong')
        else:
            follow_entry.delete()
            print(follow_entry)
            return HttpResponse('ok')