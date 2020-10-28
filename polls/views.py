import json
import datetime,time
import os

from django.shortcuts import render,redirect
from django.http import HttpResponse,JsonResponse,FileResponse,Http404
from .models import *
from django.contrib.auth.decorators import login_required
from account.models import *
from django.utils import timezone
from django.conf import settings
from django.db.models import Q
from account.views import *
from django.db.models import F

def home(request):
    polls=Polls.objects.order_by('-create_time')
    if request.user.id:
        voted=request.user.profile.answered.all().order_by('-create_time')
    else:
        voted=None

    return render(request,'polls/html/polls.html',{'polls':polls,'voted':voted})
    
def poll(request,poll_no):
    poll=Polls.objects.get(id=poll_no)
    if request.user.id:
        try:
            user_vote=request.user.profile.voted(poll_no).id
        except Exception:
            user_vote=None
    else:
        user_vote=None
    try:
        like=poll.likes_set.get(user=request.user).like_or_dislike
    except Exception:
        like=None
    num1=-(Choices.objects.filter(poll=poll)[0].id-1)
    if(request.method=="POST"):
        if(request.POST.get('notification')):request.user.notification_set.filter(post=poll).delete()
        return render(request,'polls/html/poll.html',{'poll':poll,'vote':user_vote,'maxlength':100,'num1':num1,'like':like,'commented': poll.commented(request.user.id)})
    else:
        return render(request,'polls/html/common.html',{'title':"Poll:"+str(poll.id)})

def edit(request,poll_no):
    pass
def delete(request,poll_no):
    pass
 
@login_required(login_url='/account/login/')
def vote(request,poll_no):
    if(request.method=="POST" and request.user.id):
        if(request.POST.get('vote')!='unvote'):
            Vote.objects.update_or_create(user=request.user,vote=Choices(id=int(request.POST.get('vote'))),poll=Polls(id=poll_no))
            try:
                Notification.objects.get(byuser=request.user,foruser=poll.user,typeof='3',post=poll)
            except Exception as e:
                Notification.objects.create(byuser=request.user,foruser=poll.user,typeof='3',post=poll)
        else:
            try:
                Vote.objects.get(poll=poll_no,user=request.user).delete()
                Notification.objects.get(byuser=request.user,foruser=poll.user,typeof='3',post=poll).delete()
            except Exception as e:
                pass
        return redirect('polls:result',poll_no) if(poll.publish_result) else redirect('polls:thank_you_for_voting',poll_no)

def result(request,poll_no):
    poll=Polls.objects.get(id=poll_no)
    choices=Choices.objects.filter(poll__pk=poll_no).order_by('-vote')

    if request.user.id:
        try:
            user_vote=request.user.profile.voted(poll_no)
        except Exception:
            user_vote=None
    else:
        user_vote=None
    #for comments
    comments=Comments.objects.filter(poll__id=poll_no).filter(reply_of__isnull=True).order_by('-commenting_time')
    reply_comment={}
    for comment in comments:
        reply_comment[comment.id]=Comments.objects.filter(reply_of__id=comment.id).order_by('-commenting_time')
    
    return render(request,'polls/html/result.html',{'poll':poll,"choices":choices,'vote':user_vote,'comments':comments,'reply_comment':reply_comment,'maxlength':100})

def thankYouForVoting(request,poll_no):
    pass
#function for adding poll
def addpoll(request):
    pass

#funtion for about section
def about(request):
    pass

def like(request,poll_no):
    if request.method=="POST" and request.user.id:
        try:
            poll=Polls.objects.get(id=poll_no)
        except Exception as e:
            return HttpResponse('poll has been deleted')
        else:
            if request.POST.get('like')!='':
                try:
                    pre_reaction=poll.likes_set.get(user=request.user)
                except Exception as e:
                    Likes.objects.create(poll=poll,user=request.user,like_or_dislike=True if request.POST.get('like')=='1' else False)
                else:             
                    pre_reaction=poll.likes_set.get(user=request.user)
                    pre_reaction.like_or_dislike= True if request.POST.get('like')=='1' else False
                    pre_reaction.save()
                try:
                    Notification.objects.get(byuser=request.user,foruser=poll.user,typeof='1',post=poll)
                except Exception as e:
                    Notification.objects.create(byuser=request.user,foruser=poll.user,typeof='1',post=poll)
            else:
                try:
                    poll.likes_set.get(user=request.user).delete()
                    Notification.objects.get(byuser=request.user,foruser=poll.user,typeof='1',post=poll).delete()
                except Exception as e:
                    pass
        return HttpResponse('ok')
    else:
        return HttpResponse("user did't login or bad request")

def modifycomment(request):
    if request.method=='POST' and request.user.id:
        try:
            poll=Polls.objects.get(id=int(request.POST.get('poll')))
        except Exception:
            return HttpResponse('something wrong')
        if bool(request.POST.get('reply_of')):
            try:
                reply_of=Comments.objects.get(id=int(request.POST.get('reply_of')))
            except Exception as e:
                return HttpResponse('something wrong')
        else:
            reply_of=None
        if request.POST.get('comment_id'):#edit comment
            try:
                comment=Comments.objects.get(id=int(request.POST.get('comment_id')))
            except Exception as e:
                return HttpResponse('something wrong')
            else:
                if(comment.comment==request.POST.get('comment')): return HttpResponse('not changed')
                comment.comment=request.POST.get('comment')
                comment.editing_time=timezone.now()
                comment.save()
                return HttpResponse(comment.id)
        #for delete
        if request.POST.get('delete'):
            try:
                del_comment=Comments.objects.get(id=int(request.POST.get('delete')))
                Notification.objects.filter(comment=del_comment).delete()
                del_comment.delete()
            except Exception as e:
                return HttpResponse('somthing wrong')
            else:
                return HttpResponse('done')
        comment=Comments.objects.create(user=request.user,poll=poll,comment=request.POST.get('comment'),reply_of=reply_of)
        exclude_list=[request.user]
        if reply_of:
            Notification.objects.create(byuser=request.user,post=poll,typeof='22',foruser=reply_of.user,comment=comment)
            exclude_list.append(reply_of.user)
            ncopy=Notification(byuser=request.user,post=poll,typeof='21',comment=comment)
            ncopy.save(exclude_list=exclude_list)
        else:
            # print('this is in modifycomment')
            ncopy=Notification(byuser=request.user,post=poll,typeof='21',comment=comment)
            ncopy.save(exclude_list=exclude_list)
        return HttpResponse(comment.id)
    else:
        return HttpResponse('this is working...')

#for returning reply comment as list of dictionary
def returnreplysasjson(id):
    comment_list=[]
    for c in Comments.objects.filter(reply_of__id=id).order_by('commenting_time'):
            #base_time=base_time if base_time>c.editing_time else c.editing_time
            dic_comment={
                'id':c.id,
                'user':c.user.profile.fullname,
                'userid':c.user.id,
                'image':c.user.profile.image.url if c.user.profile.image else '/static/image/profile.jpg',
                'comment':c.comment,
                'c_time':c.commented,
                'edited':c.edited,
            }
            comment_list.append(dic_comment)
    return comment_list

def sendcomment(request):
    try:
        poll=Polls.objects.get(id=int(request.GET.get('poll')))
    except Exception as e:
        return HttpResponse('POll has been deleted')
    else:
        '''try:
            base_time=Comments.objects.all()[0].commenting_time
        except Exception as e:
            base_time=timezone.now()'''
        comment_list=[]
        comments=Comments.objects.filter(poll=poll).filter(reply_of__isnull=True).order_by('commenting_time')
        for c in comments:
            #base_time=base_time if base_time>c.editing_time else c.editing_time
            reply=returnreplysasjson(c.id)
            dic_comment={
                'id':c.id,
                'user':c.user.profile.fullname,
                'userid':c.user.id,
                'image':c.user.profile.image.url if c.user.profile.image else '/static/image/profile.jpg',
                'comment':c.comment,
                'c_time':c.commented,
                'edited':c.edited,
                'replycomment':reply
            }
            comment_list.append(dic_comment)
        return JsonResponse({'comments':comment_list,'endtime':str(timezone.now())})

def update(request):
    try:
        poll=Polls.objects.get(id=int(request.GET.get('poll')))
    except Exception as e:
        return HttpResponse('poll is deleted')
    else:
        newcomment_from_request=json.loads(request.GET.get('newcomments'))
        newreply_from_request=json.loads(request.GET.get('newreplys'))
        edited_from_request=json.loads(request.GET.get('editedcomments'))
        
        ending_time=request.GET.get('endtime').rsplit(' ',1)
        ending_time=datetime.datetime.strptime('+'.join(ending_time),'%Y-%m-%d %H:%M:%S.%f%z')
        #newending_time=ending_time
        comment_list=[]
        for i in Comments.objects.filter(poll=poll):
            comment_list.append(i.id)
        newcomment=[]
        for c in Comments.objects.filter(poll=poll).filter(reply_of__isnull=True).filter(commenting_time__gt=ending_time).order_by('commenting_time'):
            #newending_time=c.commenting_time if newending_time<c.commenting_time else newending_time
            if c.id not in newcomment_from_request:
                dic_comment={
                    'id':c.id,
                    'user':c.user.profile.fullname,
                    'userid':c.user.id,
                    'image':c.user.profile.image.url if c.user.profile.image else '/static/image/profile.jpg',
                    'comment':c.comment,
                    'c_time':c.commented,
                    'edited':c.edited,
                }
                newcomment.append(dic_comment)
        replycomment=[]
        for c in Comments.objects.filter(poll=poll).filter(reply_of__isnull=False).filter(commenting_time__gt=ending_time).order_by('commenting_time'):
            #newending_time=c.commenting_time if newending_time<c.commenting_time else newending_time
            if c.id not in newreply_from_request:
                dic_comment={
                    'id':c.id,
                    'user':c.user.profile.fullname,
                    'userid':c.user.id,
                    'image':c.user.profile.image.url if c.user.profile.image else '/static/image/profile.jpg',
                    'comment':c.comment,
                    'c_time':c.commented,
                    'edited':c.edited,
                    'reply_of':c.reply_of.id,
                }
                replycomment.append(dic_comment)
        editedcomment=[]
        for c in Comments.objects.filter(editing_time__gt=ending_time).filter(commenting_time__lt=ending_time):
            #newending_time=c.editing_time if newending_time<c.editing_time else newending_time
            if c.id not in edited_from_request:
                dic_comment={
                    'id':c.id,
                    'comment':c.comment
                }
                editedcomment.append(dic_comment)
        return JsonResponse({
                        'editedcomment':editedcomment,
                        'newcomment':newcomment,
                        'newreplycomment':replycomment,
                        'commentlist':comment_list,
                        'vote':poll.total_vote,
                        'comment':poll.total_comment,
                        'dilike':poll.likes_set.filter(like_or_dislike=False).count(),
                        'like':poll.likes_set.filter(like_or_dislike=True).count(),
                        'endtime':str(timezone.now())
                    })

#additional data send
def likelist(request,poll_no):
    try:
        poll=Polls.objects.get(id=poll_no)
    except Exception as e:
        return HttpResponse('poll has been deleted')
    else:
        likelist=[]
        for p in poll.likes_set.all():
            if p.like_or_dislike:
                data={
                    'img':p.user.profile.image.url if p.user.profile.image else '/static/image/profile.jpg',
                    'fullname':p.user.profile.fullname,
                }
                likelist.append(data)
        return JsonResponse({'list':likelist})

def dislikelist(request,poll_no):
    try:
        poll=Polls.objects.get(id=poll_no)
    except Exception as e:
        return HttpResponse('poll has been deleted')
    else:
        dislikelist=[]
        for p in poll.likes_set.all():
            if not p.like_or_dislike:
                data={
                    'img':p.user.profile.image.url if p.user.profile.image else '/static/image/profile.jpg',
                    'fullname':p.user.profile.fullname,
                }
                dislikelist.append(data)
        return JsonResponse({'list':dislikelist})

def votelist(request,poll_no):
    try:
        poll=Polls.objects.get(id=poll_no)
    except Exception as e:
        return HttpResponse('poll has been deleted')
    else:
        votelist=[]
        for p in poll.vote_set.all():
            data={
                'img':p.user.profile.image.url if p.user.profile.image else '/static/image/profile.jpg',
                'fullname':p.user.profile.fullname,
            }
            votelist.append(data)
        return JsonResponse({'list':votelist})
