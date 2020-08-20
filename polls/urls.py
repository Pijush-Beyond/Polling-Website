from django.urls import path
from . import views

app_name="polls"
urlpatterns = [
    path('',views.home,name='home'),
    path('<int:poll_no>/',views.poll,name="poll"),
    path('add/',views.addpoll,name='addpoll'),#not define
    path('about/',views.about,name='about'),#not define
    path('vote/<int:poll_no>/',views.vote,name="vote"),
    path('result/<int:poll_no>/',views.result,name="result"),
    path('edit/<int:poll_no>/',views.edit,name='edit'),
    path('delete/<int:poll_no>/',views.delete,name='delete'),
    path('polls/likelist/<int:poll_no>/',views.likelist,name='likelist'),
    path('polls/dislikelist/<int:poll_no>/',views.dislikelist,name='dislikelist'),
    path('polls/votelist/<int:poll_no>/',views.votelist,name='votelist'),
    #for comment
    path('polls/sendcomment/',views.sendcomment,name='sendcomment'),
    path('polls/modifycomment',views.modifycomment,name='modifycomment'),
    path('polls/update/',views.update,name='update'),
    path('polls/<int:poll_no>/like/',views.like,name='like'),
]
 