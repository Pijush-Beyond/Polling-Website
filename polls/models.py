from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User

class Polls(models.Model):
    headline=models.CharField(max_length=120,unique=True,null=False,)
    description=models.TextField(max_length=1000)
    createing_time=models.DateTimeField(auto_now_add=True)
    editing_time=models.DateTimeField(auto_now=True)
    like=models.ManyToManyField(User,through='Likes')
    show_collapsed=models.BooleanField(default=False)

    user=models.ForeignKey(User,on_delete=models.CASCADE)
    @property
    def total_comment(self):
        return self.comments_set.count()
    @property
    def total_vote(self):
        v=0
        for i in  self.choices_set.all():
            v+=i.user_vote.count()
        return v
    @property
    def edited(self):
        return True if (self.create_time!=self.edit_time) else False
    @property
    def like(self):
        result=0
        for i in self.likes_set.all():
            result+=1 if i.like_or_dislike else 0
        return result
    def dislike(self):
        result=0
        for i in self.likes_set.all():
            result+=1 if not i.like_or_dislike else 0
        return result
    def commented(self,user):
        return True if self.comments_set.filter(user__id=user) else False
    def __str__(self):
        return self.headline

class Choices(models.Model):
    title=models.CharField(max_length=50)
    description=models.TextField(max_length=1000,blank=True)
    image=models.ImageField(blank=True)

    poll=models.ForeignKey(Polls,on_delete=models.CASCADE)

    def __str__(self):
        return self.title
 
class Comments(models.Model):
    user=models.ForeignKey(User,on_delete=models.CASCADE,blank=False,)
    poll=models.ForeignKey(Polls,on_delete=models.CASCADE,blank=False)
    comment=models.CharField(blank=False,max_length=100)
    reply_of=models.ForeignKey('self',on_delete=models.CASCADE,blank=True,null=True)

    commenting_time=models.DateTimeField(auto_now_add=True)
    editing_time=models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.comment

    @staticmethod
    def max_length():
        return 100 #put the length maximum length you want to apply on

    #for when commented information
    @property
    def commented(self):
        intervel=timezone.now()-self.commenting_time
        days=intervel.days
        years,days=divmod(days,365)
        if years>0:
            return str(years)+' year'
        month,days=divmod(days,30)
        if month>0:
            return str(month)+' month'
        weak,days=divmod(days,7)
        if weak>0:
            return str(weak)+' week'
        if days>0:
            return str(days)+' day'
        seconds=intervel.seconds
        hours,seconds=divmod(seconds,3600)
        if hours>0:
            return str(hours)+' h'
        min,seconds=divmod(seconds,60)
        if min>0:
            return str(min)+' min'
        return 'just now'
    @property
    def edited(self):
        return True if self.commenting_time<self.editing_time else False

class Media(models.Model):
    media_type=models.CharField(max_length=10,blank=False)
    img=models.ImageField(upload_to='post_images/',blank=True,null=True)
    video=models.FileField(upload_to='post_video/',blank=True,null=True)
    files=models.FileField(upload_to='post_files/',blank=True,null=True)
    poll=models.ForeignKey('Polls',on_delete=models.CASCADE)

class Likes(models.Model):
    like_or_dislike=models.BooleanField()
    user=models.ForeignKey(User,on_delete=models.CASCADE)
    poll=models.ForeignKey(Polls,on_delete=models.CASCADE)

    def __str__(self):
        return self.poll.__str__() +' '+self.user.profile.fullname