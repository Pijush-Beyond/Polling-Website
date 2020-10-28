from django.db import models
from django.db.models import F
from django.contrib.auth.models import User
from polls.models import *


class Profile(models.Model):
    user=models.OneToOneField(User,on_delete=models.CASCADE)
    total_poll_posted=models.PositiveIntegerField(default=0,editable=False)
    total_poll_voted=models.PositiveIntegerField(default=0,editable=False)
    image=models.ImageField(blank=True)
    sex=models.CharField(max_length=10,blank=False)
    fullname=models.CharField(max_length=200,blank=False)

    answered=models.ManyToManyField(Polls,through='Vote')
    following=models.ManyToManyField('self',through='Follow',through_fields=('follower','inspiration'))

    def save(self,*args,**kwargs):
        self.fullname=self.user.first_name+' '+self.user.last_name
        super().save(*args,**kwargs)
    '''
    @property
    def fullname(self):
        return self.user.first_name + ' ' + self.user.last_name
    '''
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
    id=models.CharField(max_length=100,primary_key=True)
    poll=models.ForeignKey(Polls,on_delete=models.CASCADE)
    user=models.ForeignKey(Profile,on_delete=models.CASCADE)
    vote=models.ForeignKey(Choices,on_delete=models.CASCADE,blank=False,related_name='user_vote')
    voting_time=models.DateTimeField(editable=False,auto_now=True)

    def __str__(self):
        return self.user.__str__()+">"+self.poll.__str__()+'-'+self.vote.__str__()
    def save(self,*args,**kwargs):
        if(kwargs['justsave']):
            kwargs.pop('justsave')
            super().save(*args,**kwargs)
            return
        self.id=str(self.poll.id)+'_'+str(self.user.id)
        try:
            instance=Vote.objects.get(id=self.id)
        except Exception as e:
            instance.vote=self.vote
            instance.save(justsave=True)
        else:
            Notification.objects.create(post=self.poll,typeof='3')
            super().save(*args,**kwargs)

class Follow(models.Model):
    follower=models.ForeignKey('Profile',on_delete=models.CASCADE,blank=False,related_name='following_table')
    inspiration=models.ForeignKey('Profile',on_delete=models.CASCADE,blank=False,related_name='follower_table')

    class Meta:
        unique_together=['follower','inspiration']
        
    def __str__(self):
        return self.follower.fullname+'following'+self.inspiration.fullname

class DeleteManager(models.QuerySet):
    def delete(self,*args,**kwargs):
        # print('this is delete method on QuerySet')
        for nt in self:
            nt.foruser.notificationcount_set.update(count=F('count')-1)
        super().delete(*args,**kwargs)

    def save(self,*args,**kwargs):
        # print('it is in the save of QuerySet')
        if(self.byuser==self.foruser):
            return False
        else: super().save(*args,**kwargs)

class Notification(models.Model):
    id=models.CharField(max_length=100,primary_key=True)
    byuser=models.ForeignKey(User,on_delete=models.CASCADE,blank=True,null=True,related_name='byuser')#thick
    foruser=models.ForeignKey(User,on_delete=models.CASCADE)
    typeof=models.CharField(max_length=2,null=False,default='1')#thick
    post=models.ForeignKey(Polls,on_delete=models.CASCADE,blank=True,null=True)#thick
    comment=models.ForeignKey(Comments,on_delete=models.CASCADE,blank=True,null=True)
    time=models.DateTimeField(auto_now=True,auto_created=True)

    objects=DeleteManager.as_manager()
    # delete_manager=

    class Meta:
        ordering=['-time']
    def __str__(self):
        typeof=self.typeof
        returnline='this is {} notifiction for user '+self.foruser.profile.fullname+' for post '+self.post.__str__()+(' genareted by '+self.byuser.get(id=user).profile.fullname if(self.byuser) else '')
        if(typeof=='1'):return returnline.format('reaction')
        elif(typeof=='21'):return returnline.format('comment')
        elif(typeof=='22'):return returnline.format('reply-comment')
        elif(typeof=='3'):return returnline.format('vote')
        elif(typeof=='4'):return returnline.format('result publish')
        elif(typeof=='5'):return returnline.format('new follower')

    def save(self,*args,**kwargs):
        if(kwargs.get('justsave')):
            kwargs.pop('justsave')
            #self.seen=False
            super().save(*arges,**kwargs)
            return
        typeof=self.typeof
        if(typeof=='1'):
            self.id=str(self.foruser.id)+'_'+self.typeof+'_'+str(self.post.id)+'_'+str(self.byuser)+'_'+str(timezone.now())
            super().save(*args,**kwargs)
            n_c=self.foruser.notificationcount_set.update(count=models.F('count')+1)
            # nc.count.update(count=models.F('count')+1)
            return
        elif(typeof=='3'):
            self.id=str(self.foruser.id)+'_'+self.typeof+'_'+str(self.post.id)+'_'+str(self.byuser)+'_'+str(timezone.now())
            super().save(*args,**kwargs)
            self.foruser.notificationcount_set.get().update(count=models.F('count')+1)
            return
        elif(typeof=='5'):#follow notification registration
            self.id=str(self.foruser.id)+'_'+self.typeof+'_-1_'+str(self.byuser)+'_'+str(timezone.now())
            super().save(*args,**kwargs)
            self.foruser.notificationcount_set.get().update(count=models.F('count')+1)
            return
        elif(typeof=='22'):
            self.id=str(self.byuser.id)+'_'+str(self.foruser.id)+'_'+self.typeof+'_'+str(self.post.id)+'_'+str(timezone.now())
            super().save(*args,**kwargs)
            self.foruser.notificationcount_set.get().update(count=models.F('count')+1)
            return
        elif(typeof=='21'):listofforuser=set(self.post.comments_set.exclude(user__in=kwargs.get('exclude_list')).values_list('user',flat=True).distinct());listofforuser.add(self.post.user.id);listofforuser.discard(self.byuser.id)
        elif(typeof=='4'):listofforuser=set(self.post.comments_set.values_list('user',flat=True));listofforuser.update(set(self.post.vote_set.values_list('user',flat=True)));listofforuser.discard(self.post.user.id)
        kwargs.pop('exclude_list')
        # print(listofforuser)
        for foruser in User.objects.filter(id__in=listofforuser):
            self.foruser=foruser
            # self.foruser.notificationcount_set.update(count=F('count')+1)
            self.id=str(self.byuser.id)+'_'+str(self.foruser.id)+'_'+self.typeof+'_'+str(self.post.id)+'_'+str(timezone.now())
            if self.foruser.notification_set.filter(post=self.post,typeof__in=('21','22'),byuser=self.byuser).count()<=0:
                if(super().save(*args,**kwargs) is not False):
                    self.foruser.notificationcount_set.update(count=F('count')+1)

    def delete(self,*args,**kwargs):
        #print('this is in delete of notification save function')
        self.foruser.notificationcount_set.update(count=F('count')-1)
        super().delete(*args,**kwargs)

class NotificationCount(models.Model):
    user=models.ForeignKey(User,on_delete=models.CASCADE)
    count=models.IntegerField(default=0,blank=False)

    def __str__(self):
        return 'Total count of notifications '+str(self.count)+' for user '+self.user.profile.fullname
    
    def save(self,*args,**kwargs):
        # print('this is in save notifification count')
        self.count=0 if self.count<0 else self.count
        super().save(*args,**kwargs)