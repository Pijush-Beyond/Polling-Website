import datetime

from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.http import HttpResponse,JsonResponse
from polls.templatetags.myfilter import *
from .models import *
from django.utils import timezone

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
                'img':user.profile.image.url if user.profile.image else '/static/image/profile.jpg',
                'fullname':user.profile.fullname,
                'total_post':shortnumber(user.profile.total_post),
                'total_followers': shortnumber(user.profile.followers_count),
                'total_following': shortnumber(user.profile.following_count),
                'following':True if request.user.profile.following.all() else False,
            }
            return JsonResponse(details,safe=False)

def followunfollow(request):
    if request.method=="POST" and request.user.id==int(request.POST.get('follower')):
        try:
            follower=User.objects.get(id=int(request.POST.get('follower')))#.profile
            inspiration=User.objects.get(id=int(request.POST.get('inspiration')))#.profile
        except Exception as e:
            return HttpResponse('something wrong')
        else:
            if request.POST.get('message')=='follow':
                try:
                    Follow.objects.get(follower=follower.profile,inspiration=inspiration.profile)
                except Exception as e:
                    Follow.objects.create(follower=follower.profile,inspiration=inspiration.profile)
                    Notification.update_or_create(byuser=request.user,foruser=inspiration,typeof='5')
                return HttpResponse('following')
            elif request.POST.get('message') == 'unfollow':
                try:
                    Follow.objects.get(follower=follower.profile,inspiration=inspiration).delete()
                    Notification.objects.get(byuser=request.user,foruser=inspiration,typeof='5').delete()
                except Exception as e:
                    pass
                return HttpResponse('unfollow')

def loadnotifications(request,user_id):
    try:
        user=User.objects.get(id=user_id)
    except Exception as e:
        user=None
    if(request.method=="POST" and user):
        notifications={}
        notifications['notifications']=list(Notification.objects.filter(foruser=request.user,).values_list('id','typeof','byuser','byuser__profile__image','byuser__profile__fullname','comment','post'))
        notifications['notification_count']=NotificationCount.objects.get(user=request.user).count
        notifications['end_time']=str(timezone.now())
        return JsonResponse(notifications)
    else:
        return HttpResponse('something went wrong')

def updatenotifications(request,user_id):
    try:
        user=User.objects.get(id=user_id)
    except Exception as e:
        user=None
    if(request.method=="POST" and user):
        ending_time=request.POST.get('endtime').rsplit(' ',1)
        try:
            no_need_notifications=request.POST.get('noneed').split(',')
        except Exception as e:
            no_need_notifications=[]
        for i in no_need_notifications:
            try:
                Notification.objects.get(id=i).delete()
            except Exception as e:
                pass
        ending_time=datetime.datetime.strptime('+'.join(ending_time),'%Y-%m-%d %H:%M:%S.%f%z')
        notifications={}
        notifications['notifications']=list(Notification.objects.filter(foruser=request.user,time__gte=ending_time).values_list('id','typeof','byuser','byuser__profile__image','byuser__profile__fullname','comment','post'))
        if(request.GET.get('count_mismatch')):
            notifications['all_id']=User.objects.all().values_list('id',flat=True)
        notifications['notification_count']=NotificationCount.objects.get(user=request.user).count
        notifications['end_time']=str(timezone.now())
        return JsonResponse(notifications)
    else:
        return HttpResponse('something went wrong')