from django.db import models
from django.contrib.auth.models import User
from polls.models import *


class Profile(models.Model):
    user=models.OneToOneField(User,on_delete=models.CASCADE)
    total_poll_posted=models.PositiveIntegerField(default=0,editable=False)
    total_poll_voted=models.PositiveIntegerField(default=0,editable=False)
    image=models.ImageField(blank=True)

    answered=models.ManyToManyField(Polls,through='Vote')
    following=models.ManyToManyField('self',through='Follow',through_fields=('follower','inspiration'))

    @property
    def fullname(self):
        return self.user.first_name + ' ' + self.user.last_name

    def __str__(self):
        return self.user.first_name + ' ' + self.user.last_name 

    def voted(self,poll_id):
        if self.answered.get(id=poll_id):
            return self.vote_set.get(poll__id=poll_id).vote
        else:
            return None
    @property
    def followers_count(self):
        return self.follower_table.count()
    @property
    def following_count(self):
        return self.following.count()
    @property
    def total_post(self):
        return self.user.polls_set.count()

class Vote(models.Model):
    voting_time=models.DateTimeField(editable=False,auto_now=True)
    poll=models.ForeignKey(Polls,on_delete=models.CASCADE)
    user=models.ForeignKey(Profile,on_delete=models.CASCADE)
    vote=models.ForeignKey(Choices,on_delete=models.CASCADE,blank=False,related_name='user_vote')

    def __str__(self):
        return self.user.__str__()+">"+self.poll.__str__()+'-'+self.vote.__str__()

class Follow(models.Model):
    follower=models.ForeignKey('Profile',on_delete=models.CASCADE,blank=False,related_name='following_table')
    inspiration=models.ForeignKey('Profile',on_delete=models.CASCADE,blank=False,related_name='follower_table')

    def __str__(self):
        return self.follower.fullname+'following'+self.inspiration.fullname

class Notification(models.Model):
    user=models.OneToOneField(User,on_delete=models.CASCADE)
    new_comment=models.DateTimeField(blank=False)
    reply=models.DateTimeField(blank=False)
    mention=models.DateTimeField(blank=False)
