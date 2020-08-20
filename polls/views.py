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
    return render(request,'polls/html/poll.html',{'poll':poll,'vote':user_vote,'maxlength':100,'num1':num1,'like':like,'commented': poll.commented(request.user.id)})

def edit(request,poll_no):
    pass
def delete(request,poll_no):
    pass
 
@login_required(login_url='/account/login/')
def vote(request,poll_no):
    p=Polls.objects.get(id=poll_no)
    c=Choices.objects.get(id=int(request.POST.get('vote')))
    voter=request.user.profile

    #registering vote in Vote model
    vote=Vote.objects.filter(poll=p).filter(user=voter)
    if vote and len(vote)==1:
        c.vote+=1
        c.save()
        pre_vote=vote[0].vote
        pre_vote.vote-=1
        pre_vote.save()
        vote[0].vote=c
        vote[0].save()
    else:
        p.total_votes+=1
        c.vote+=1
        p.save()
        c.save()
        Vote.objects.create(voting_time=timezone.now(),poll=p,user=voter,vote=c)

    
    return redirect('polls:result',p.id)

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

#function for adding poll
def addpoll(request):
    pass

#funtion for about section
def about(request):
    pass

def like(request,poll_no):
    if request.method=="POST" and request.user:
        try:
            poll=Polls.objects.get(id=poll_no)
        except Exception as e:
            return HttpResponse('poll has been deleted')
        else:
            if request.POST.get('like')!='':
                try:
                    poll.likes_set.get(user=request.user)
                except Exception as e:
                    Likes.objects.create(poll=poll,user=request.user,like_or_dislike=True if request.POST.get('like')=='1' else False)
                else:
                    like=poll.likes_set.get(user=request.user)
                    like.like_or_dislike= True if request.POST.get('like')=='1' else False
                    like.save()
            else:
                like=poll.likes_set.get(user=request.user)
                like.delete()
        return HttpResponse('ok')
    else:
        return HttpResponse("user did't login or bad request")

def modifycomment(request):
    if request.method=='POST' and request.user.id:
        #print(request.POST.get('delete'),request.POST.get('comment'),request.POST.get('poll'),sep='\n')
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
        if request.POST.get('comment_id'):
            try:
                comment=Comments.objects.get(id=int(request.POST.get('comment_id')))
            except expression as identifier:
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
            except Exception as e:
                return HttpResponse('somthing wrong')
            else:
                n=Comments.objects.filter(reply_of=del_comment).count()+1
                del_comment.delete()
                return HttpResponse('done')
        comment=Comments.objects.create(user=request.user,poll=poll,comment=request.POST.get('comment'),reply_of=reply_of)
        return HttpResponse(comment.id)
    else:
        return HttpResponse('this is working...')
    #print(request.POST)

#for returning reply comment as list of dictionary
def returnreplysasjson(id,base_time):
    comment_list=[]
    comments=Comments.objects.filter(reply_of__id=id).order_by('commenting_time')
    for c in comments:
            base_time=base_time if base_time>c.editing_time else c.editing_time
            dic_comment={
                'id':c.id,
                'user':c.user.profile.fullname,
                'userid':c.user.id,
                'image':c.user.profile.image.url if c.user.profile.image else '/media/defaultprofile.jpg',
                'comment':c.comment,
                'c_time':c.commented,
                'edited':c.edited,
            }
            comment_list.append(dic_comment)
    return comment_list,base_time

def sendcomment(request):
    try:
        poll=Polls.objects.get(id=int(request.GET.get('poll')))
    except Exception as e:
        return HttpResponse('POll has been deleted')
    else:
        try:
            base_time=Comments.objects.all()[0].commenting_time
        except Exception as e:
            base_time=timezone.now()
        comment_list=[]
        comments=Comments.objects.filter(poll=poll).filter(reply_of__isnull=True).order_by('commenting_time')
        for c in comments:
            base_time=base_time if base_time>c.editing_time else c.editing_time
            reply,base_time=returnreplysasjson(c.id,base_time)
            dic_comment={
                'id':c.id,
                'user':c.user.profile.fullname,
                'userid':c.user.id,
                'image':c.user.profile.image.url if c.user.profile.image else '/media/defaultprofile.jpg',
                'comment':c.comment,
                'c_time':c.commented,
                'edited':c.edited,
                'replycomment':reply
            }
            comment_list.append(dic_comment)
        #reply_comment={}
        #for comment in comments:
        #    reply_comment[comment.id]=Comments.objects.filter(reply_of__id=comment.id).order_by('-commenting_time')
        #response_text=json.dumps(comment_list)
        #print('n\nJson:-\n',json.dumps(comment_list,indent=4),'\n')
        #return HttpResponse(response_text)
        return JsonResponse({'comments':comment_list,'endtime':str(base_time)})

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
        newending_time=ending_time
        comment_list=[]
        for i in Comments.objects.filter(poll=poll):
            comment_list.append(i.id)
        newcomment=[]
        for c in Comments.objects.filter(poll=poll).filter(reply_of__isnull=True).filter(commenting_time__gt=ending_time).order_by('commenting_time'):
            newending_time=c.commenting_time if newending_time<c.commenting_time else newending_time
            if c.id not in newcomment_from_request:
                dic_comment={
                    'id':c.id,
                    'user':c.user.profile.fullname,
                    'userid':c.user.id,
                    'image':c.user.profile.image.url if c.user.profile.image else '/media/defaultprofile.jpg',
                    'comment':c.comment,
                    'c_time':c.commented,
                    'edited':c.edited,
                }
                newcomment.append(dic_comment)
        replycomment=[]
        for c in Comments.objects.filter(poll=poll).filter(reply_of__isnull=False).filter(commenting_time__gt=ending_time).order_by('commenting_time'):
            newending_time=c.commenting_time if newending_time<c.commenting_time else newending_time
            if c.id not in newreply_from_request:
                dic_comment={
                    'id':c.id,
                    'user':c.user.profile.fullname,
                    'userid':c.user.id,
                    'image':c.user.profile.image.url if c.user.profile.image else '/media/defaultprofile.jpg',
                    'comment':c.comment,
                    'c_time':c.commented,
                    'edited':c.edited,
                    'reply_of':c.reply_of.id,
                }
                replycomment.append(dic_comment)
        editedcomment=[]
        for c in Comments.objects.filter(editing_time__gt=ending_time).filter(commenting_time__lt=ending_time):
            newending_time=c.editing_time if newending_time<c.editing_time else newending_time
            if c.id not in edited_from_request:
                dic_comment={
                    'id':c.id,
                    'comment':c.comment
                }
                editedcomment.append(dic_comment)
        #print(newcomment)
        return JsonResponse({
                        'editedcomment':editedcomment,
                        'newcomment':newcomment,
                        'newreplycomment':replycomment,
                        'commentlist':comment_list,
                        'vote':poll.total_vote,
                        'comment':poll.total_comment,
                        'endtime':str(newending_time)
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
                    'img':p.user.profile.image.url if p.user.profile.image else '/media/defaultprofile.jpg',
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
                    'img':p.user.profile.image.url if p.user.profile.image else '/media/defaultprofile.jpg',
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
                'img':p.user.profile.image.url if p.user.profile.image else '/media/defaultprofile.jpg',
                'fullname':p.user.profile.fullname,
            }
            votelist.append(data)
        return JsonResponse({'list':votelist})
