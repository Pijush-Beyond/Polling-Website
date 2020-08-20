from django.contrib import admin
from .models import *

class ChoiceDisplay(admin.TabularInline):
    model=Choices
    extra=1

class ImageDisplay(admin.TabularInline):
    model=Media
    extra=1

class QuestionDisplay(admin.ModelAdmin):
    fields=['headline','description','user']
    inlines=[ChoiceDisplay,ImageDisplay]

admin.site.register(Polls,QuestionDisplay)
admin.site.register(Comments)