from django.template.defaulttags import register
from django.utils.html import conditional_escape
from django.utils.safestring import mark_safe
#register = template.Library()

@register.filter
def item(dic,i):
    return dic.get(i)
@register.filter
def shortnumber(value):
    b,value=divmod(int(value),1000000000)
    if b>0:
        return str(b)+'B'
    m,value=divmod(value,1000000)
    if m>0:
        return str(m)+'M'
    k,value=divmod(value,1000)
    if k>0:
        return str(k)+'K'
    return value

