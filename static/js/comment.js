var newcomment_list=[];
var newreplycomment_list=[];
var editedcomment_list=[];
function showcommentmenu(id,main_comment,place){
    if( ! place.hasChildNodes()){
        if(main_comment)
            var data=document.getElementById('comment_'+id).children[1].firstElementChild.firstElementChild.children;
        else
            var data=document.getElementById('comment_'+id).children[1].firstElementChild.children;

        var user=document.getElementById('profile-Id');
        var creator=document.getElementById('poll-creator');
        let tag;
        if(user.value=='None')tag=showlogin(data);
        else if(user.value==data[data.length-1].value)tag=showalloption(data,id,main_comment);
        else if(user.value!=creator.value)tag=showreplyoption(data,id,main_comment);
        else tag=showcreatoroption(data,id,main_comment);

        position(tag,place);
    }
}

function showlogin(data){
    let tag=document.createElement('div');
    tag.setAttribute('class','temporary');
    tag.setAttribute('onmouseleave',"disapeare(this)");

    let child=document.createElement('h5');
    child.innerText='login pleace...'
    child.setAttribute('class','option');
    tag.appendChild(child);
    //console.log('this is here');
    return tag;
}

//for comment maker
function showalloption(data,id,main_comment){
    //creation of menu bar
    let comment='comment'+id;
    let tag=document.createElement('div');
    tag.setAttribute('class','temporary');
    tag.setAttribute('onmouseleave',"disapeare(this)");

    //for comment editing
    let child=document.createElement('h5')
    child.setAttribute('class','option');
    child.innerHTML='edit';
    child.setAttribute('onmouseup',"edit('"+comment+"',"+'this,'+main_comment+")");
    tag.appendChild(child);

    //for comment delete
    child=document.createElement('h5');
    child.setAttribute('class','option');
    child.setAttribute('onmouseup',"del('"+'comment_'+id+"',"+'this,'+main_comment+")");
    child.innerHTML="delete";
    tag.appendChild(child);

    //for reply
    if(main_comment) comment='comment_'+id;
    else comment='comment_'+data[2].value;
    child=document.createElement('h5');
    child.setAttribute('class','option');
    child.innerHTML='reply';
    child.setAttribute('onmouseup',"reply('"+comment+"',"+'this'+")");
    tag.appendChild(child);
    return tag;
}

//for othere user 
function showreplyoption(data,id,main_comment){
    let comment;
    if(main_comment) comment='comment_'+id;
    else comment='comment_'+data[2].value;

    //creation of menu bar
    let tag=document.createElement('div');
    tag.setAttribute('class','temporary');
    tag.setAttribute('onmouseleave',"disapeare(this)");


    let child=document.createElement('h5');
    child.setAttribute('class','option');
    child.innerHTML='reply';
    child.setAttribute('onmouseup',"reply('"+comment+"',"+'this'+")");
    tag.appendChild(child);
    return tag;
}

//for poll-creator
function showcreatoroption(data,id,main_comment){
    let comment;
    if(main_comment) comment='comment_'+id;
    else comment='comment_'+data[2].value;

    let tag=document.createElement('div');
    tag.setAttribute('class','temporary');
    tag.setAttribute('onmouseleave',"disapeare(this)");

    //this is for reply option
    let child=document.createElement('h5');
    child.setAttribute('class','option');
    child.innerHTML='reply';
    child.setAttribute('onmouseup',"reply('"+comment+"',"+'this'+")");
    tag.appendChild(child);

    //this is for delete option
    child=document.createElement('h5');
    child.setAttribute('class','option');
    child.setAttribute('onmouseup',"del('"+'comment_'+id+"',this,"+main_comment+")");
    child.innerHTML="delete";
    tag.appendChild(child);
    return tag;
}

function position(tag,place){
    tag.style.position='absolute';   
    tag.style.top='100%';
    tag.style.right='0px';
    place.appendChild(tag);
    
}

function disapeare(tag){
    tag.remove();
    
}

function edit(id,menu,flag){
    menu.parentElement.remove()
    let comment=document.getElementById(id);
    let newtag=document.createElement('textarea');
    newtag.value=comment.innerText;
    newtag.style.height=comment.offsetHeight+'px';
    newtag.setAttribute('onblur',"editeddefocus(this,"+flag+")");
    //newtag.setAttribute('onblur',"editeddefocus(this)");
    newtag.id=comment.id;
    newtag.setAttribute('oninput','autohightinreament(this)');
    newtag.setAttribute('rows','1');
    newtag.setAttribute('maxlength',max_comment_length);
    comment.insertAdjacentElement("beforebegin",newtag);
    comment.style.display='none';
    newtag.focus();
    hide(newtag.parentElement.parentElement);
    
}
function editedsubmit(tag,flag,parent,waiting){
    if(parent===undefined)parent=tag.parentElement.parentElement;
    tag.value=tag.value.trimRight();
    if(tag.value.trim()==0){
        if(flag)del(tag.parentElement.parentElement.parentElement.parentElement.id,tag,flag);
        else del(tag.parentElement.parentElement.parentElement.id,tag,flag);
        return;
    }
    if(waiting===undefined){
        waiting=document.createElement('div');
        waiting.innerText='Sending....'
        parent.parentElement.replaceChild(waiting,parent);
    }
    if(!flag_for_other_request){
        setTimeout(submitstartcomment,500,tag,flag,parent,waiting);
        return;
    }
    clearTimeout(update);

    let xlr=new XMLHttpRequest();
    xlr.open('post','/polls/modifycomment',true);
    xlr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    let data='csrfmiddlewaretoken='+document.getElementsByName('csrfmiddlewaretoken')[0].value+'&comment_id='+tag.id.slice(7)+'&comment='+tag.value+"&poll="+document.getElementById('poll_id').value;
    xlr.send(data);
    xlr.onload=function(){
        if(this.status==200){
            if(this.responseText!='something wrong'){
                waiting.parentElement.replaceChild(parent,waiting);
                let div=tag.nextElementSibling;
                tag.remove();
                div.removeAttribute('style');
                if(div.previousElementSibling.children.length!=3 && this.responseText!='not changed'){
                    div.previousElementSibling.innerHTML=div.previousElementSibling.innerHTML+'<span class="flag-block"><div class="dot inline-block"></div>edited<span>';
                    editedcomment_list.push(Number(tag.id.split('_')[1]));
                }
                update=setTimeout(continusresponse,2000,flag_endtime);
            }
            else{
                if(flag)waiting.parentElement.parentElement.remove();
                else waiting.parentElement.remove();
                alert('Comment is Deleted which you are trying to reply...');
                update=setTimeout(continusresponse,2000,flag_endtime);
            }
        }
        else{
            waiting.remove();
            alert('Something Went Wrong...\nPleace try again...');
        }
    }
    
}
function editeddefocus(tag,flag){
    let div=tag.nextElementSibling;
    if(div.innerText!=tag.value){
        editedsubmit(tag,flag);
    }else{
        tag.remove();
        div.removeAttribute('style');
    }
}
function del(id,menu,flag){
    if(menu)menu.parentElement.remove();
    let comment=document.getElementById(id);
    if (flag) count=comment.lastElementChild.lastElementChild.children.length+1;
    else count=1;

    let waiting=document.createElement('div');
    waiting.innerText='Sending....'
    comment.parentElement.replaceChild(waiting,comment);

    let xlr=new XMLHttpRequest();
    xlr.open('post','/polls/modifycomment',true);
    xlr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    let data='csrfmiddlewaretoken='+document.getElementsByName('csrfmiddlewaretoken')[0].value+'&delete='+id.slice(8)+"&poll="+document.getElementById('poll_id').value;
    xlr.send(data);
    xlr.onload=function(){
        if(this.status==200){
            if(this.responseText!='something wrong'){
                waiting.remove();
                tag_count=document.getElementById('comment-count');
                tag_count.innerText=Number(tag_count.innerText)-count;
            }
            else{
                waiting.parentElement.replaceChild(comment,waiting)
                alert('Comment is Deleted which you are trying to reply...');
            }
        }
        else{
            waiting.parentElement.replaceChild(comment,waiting)
            alert('Comment is Deleted which you are trying to reply...');
        }
        
    }
    //Ajex here for delete send signal
}

function reply(id,menu){
    let tag=document.createElement('div');
    tag.id='comment_';
    tag.classList.add('flex','flex-start','upper-low-padding', 'hundrad');

    let a=document.createElement('a');
    a.classList.add('inline-block');
    a.href='/account/profile/'+document.getElementById('profile-Id').value+'/';
    //a.classList.add('snap_profile');
    a.innerHTML='<img class="poll-profile cover inline radius50" style="opacity:0.5" src="'+document.getElementsByName('Dp')[0].src+'">';
    tag.appendChild(a);

    let divtag=document.createElement('div');
    divtag.classList.add('flex','hundrad','comment-background');
    let innerdiv=document.createElement('div');
    innerdiv.classList.add('hundrad','left-padding');
    let htag=document.createElement('h4');
    htag.classList.add('no');
    htag.innerHTML='<a href="/account/profile/'+document.getElementById('profile-Id').value+'/" class="snap_profile" onmouseenter="get_snap_profile(this)">'+document.getElementsByName('Dp')[1].innerText+'</a>';
    innerdiv.appendChild(htag);
    let newtag=document.createElement('textarea');
    newtag.style.height='24.861px';
    //newtag.setAttribute('onchange',"submit(this)");
    newtag.setAttribute('onblur',"defocus(this)");
    newtag.id='comment';
    newtag.setAttribute('oninput','autohightinreament(this)');
    newtag.setAttribute('rows','1');
    newtag.setAttribute('maxlength',max_comment_length);
    innerdiv.appendChild(newtag);
    let inputhidden=document.createElement('input');
    inputhidden.setAttribute('type','hidden');
    inputhidden.value=id.split('_')[1];
    innerdiv.appendChild(inputhidden);
    inputhidden=document.createElement('input');
    inputhidden.setAttribute('type','hidden');
    inputhidden.value=document.getElementById('profile-Id').value;
    innerdiv.appendChild(inputhidden);
    divtag.appendChild(innerdiv);

    
    //divtag.appendChild(newmenu);

    tag.appendChild(divtag);

    document.getElementById(id).lastElementChild.lastElementChild.appendChild(tag);
    newtag.focus();
    hide(menu.parentElement.parentElement.parentElement);
    hide(document.getElementById(id).lastElementChild.firstElementChild);
    //console.log(document.getElementById(id).lastElementChild.firstElementChild);
    //hide(tag.lastElementChild);
    //console.log(id);
    
}
function show(tag){
    if(tag.firstElementChild.children[1].tagName.toLowerCase()!='textarea')
        tag.lastElementChild.style.display='initial';
    
}
function hide(tag){
    //console.log(tag);
    if(tag.lastElementChild.firstElementChild)
        tag.lastElementChild.firstElementChild.remove();
    tag.lastElementChild.style.display='none';
    
}
//this is for replying comment submit
function submit(tag,parent,waiting){
    //console.log('this in submit');
    //tag.parentElement.parentElement.parentElement.style.display='none';
    //defocus(tag);
    if(parent===undefined) parent=tag.parentElement.parentElement.parentElement;
    if(waiting===undefined){
        waiting=document.createElement('div');
        waiting.innerText='Sending....'
        parent.parentElement.replaceChild(waiting,parent);
    }
    if(!flag_for_other_request){
        setTimeout(submitstartcomment,500,tag,parent,waiting);
        return;
    }
    clearTimeout(update);
    tag.parentElement.parentElement.setAttribute('onmouseenter',"show(this)");
    tag.parentElement.parentElement.setAttribute('onmouseleave','hide(this)')

    let xlr=new XMLHttpRequest();
    xlr.open('post','/polls/modifycomment',true);
    xlr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    let data='csrfmiddlewaretoken='+document.getElementsByName('csrfmiddlewaretoken')[0].value+'&comment='
            +tag.value+'&poll='+document.getElementById('poll_id').value+'&reply_of='+tag.nextElementSibling.value;
    xlr.send(data);
    xlr.onload=function(){
        if(this.status==200){
            if(this.responseText!='something wrong'){
                let id=this.responseText;
                newreplycomment_list.push(Number(id));
                tag.parentElement.parentElement.previousElementSibling.firstElementChild.removeAttribute('style');
        
                let div=document.createElement('div');
                div.classList.add('textarea','hundrad','left-padding','pre-wrap');
                div.innerText=tag.value;
                div.id=tag.id+id;
                tag.parentElement.replaceChild(div,tag);
                div.previousElementSibling.innerHTML=div.previousElementSibling.innerHTML+'<span class="flag-block"><div class="dot inline-block"></div>just now</span>';
                parent.id+=id;
                let newmenu=document.createElement('div');//three dotted menu =newmenu
                newmenu.classList.add('comment-menu');
                newmenu.setAttribute('onmouseenter',"showcommentmenu('"+id+"',false,this)");
                newmenu.style.position='relative';
                newmenu.style.display='none';
                newmenu.style.position='relative';
                parent.lastElementChild.appendChild(newmenu);
                waiting.parentElement.replaceChild(parent,waiting);

                tag_count=document.getElementById('comment-count');
                tag_count.innerText=Number(tag_count.innerText)+1;
                update=setTimeout(continusresponse,2000,flag_endtime);//calling continueresponse with fla_endtime
            }
            else{
                waiting.remove();
                alert('Comment is Deleted which you are trying to reply...');
            }
        }
        else{
            waiting.remove();
            alert('Comment is Deleted which you are trying to reply...');
        }
    }
}
function defocus(tag){
    //tag.disabled=true
    //console.log('this is defocused....')
    if(tag.value.trim().length==0)tag.parentElement.parentElement.parentElement.remove();
    else submit(tag);
    
}

//for textarea auto hide increment
function autohightinreament(tag){
    tag.style.height = 'inherit';
    let v=window.getComputedStyle(tag);
    let height=parseInt(v.getPropertyValue('padding-top'),10)+
                parseInt(v.getPropertyValue('padding-bottom'),10)+
                parseInt(v.getPropertyValue('border-bottom-width'),10)+
                parseInt(v.getPropertyValue('border-top-width'),10)+
                tag.scrollHeight;
    tag.style.height=height+'px';
    if(((tag.value.length/max_comment_length)*100)>95)tag.style.borderColor='rgb(138, 7, 7)';
    else if(((tag.value.length/max_comment_length)*100)>80)tag.style.borderColor='rgb(255, 157, 0)';
    else tag.style.borderColor='gray';
    
}

function shine(tag){
    tag.style.opacity='initial';
    
}
function dim(tag){
    tag.style.opacity='0.5';
    //console.log('this is in shinefocus',tag.tagName);
    
}
function showloginwindow(){
    console.log('this is in showloginwindow');
    
}
function shineandfocus(tag){
    shine(tag);
    tag.lastElementChild.firstElementChild.firstElementChild.children[1].focus()
    
}
function dimifnocomment(tag){
    //console.log('this is in dimifnocomment',tag.tagName,toString(tag.lastElementChild.firstElementChild.firstElementChild.children[1].value==''));
    if(tag.lastElementChild.firstElementChild.firstElementChild.children[1].value.trim()==0){
        tag.lastElementChild.firstElementChild.firstElementChild.children[1].value='';
        tag.lastElementChild.firstElementChild.firstElementChild.children[1].style.height='24px';
        dim(tag);
        tag.lastElementChild.firstElementChild.firstElementChild.children[1].blur();
        
    }
    
}
function submitstartcomment(tag,parent,waiting){
    if(parent===undefined)parent=tag.parentElement.parentElement.parentElement.parentElement;
    if(tag.value.trim().length!=0){
        if(waiting===undefined){
            waiting=document.createElement('div');
            waiting.innerText='Sending....';
            parent.parentElement.replaceChild(waiting,parent);
        }
        //console.log('this before return');
        if(!flag_for_other_request){
            //setTimeout(submitstartcomment,500,tag,parent,waiting);
            console.log('this is in return');
            return;
        }
        //console.log('this is after return');
        clearTimeout(update);

        let xlr=new XMLHttpRequest();
        xlr.open('post','/polls/modifycomment',true);
        xlr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        let data='csrfmiddlewaretoken='+document.getElementsByName('csrfmiddlewaretoken')[0].value+'&comment='+tag.value.trimRight()+'&poll='+document.getElementById('poll_id').value;
        xlr.send(data);
        xlr.onload=function(){
            waiting.parentElement.replaceChild(parent,waiting);
            if(this.status==200){
                let id=this.responseText;//most important part of the funtion
                if(newcomment_list)newcomment_list.push(Number(id));//list of newcomment
                else newcomment_list=[Number(id)];

                let comment=parent.cloneNode(true);
                comment.removeAttribute('onmouseenter');
                comment.removeAttribute('onmouseleave');
                comment.id="comment_"+id;
                let divcomment=document.createElement('div');
                divcomment.id='comment'+id;
                divcomment.innerText=tag.value.trimRight();
                divcomment.classList.add('textarea', 'hundrad','left-padding','pre-wrap');
                justdiv=comment.lastElementChild.firstElementChild.firstElementChild;
                justdiv.replaceChild(divcomment,justdiv.children[1]);
                let image=divcomment.parentElement.parentElement.parentElement.previousElementSibling;
                let a=document.createElement('a');
                a.classList.add('inline-block');
                a.href='/account/profile/'+document.getElementById('profile-Id').value+'/';
                //a.classList.add('snap_profile');
                a.innerHTML='<img class="poll-profile cover inline radius50" src="'+document.getElementsByName('Dp')[0].src+'">';
                image.parentElement.replaceChild(a,image);
                divcomment.previousElementSibling.innerHTML='<a href="/account/profile/'+document.getElementById('profile-Id').value+'/" class="snap_profile" onmouseenter="get_snap_profile(this)">'+document.getElementsByName('Dp')[1].innerText+'</a><span class="flag-block"><div class="dot inline-block"></div>just now</span>';
                //divcomment.previousElementSibling.innerHTML=divcomment.previousElementSibling.innerHTML+'<span class="flag-block"><div class="dot inline-block"></div>just now</span>';
                justdiv.parentElement.setAttribute('onmouseenter','show(this)');
                justdiv.parentElement.setAttribute('onmouseleave','hide(this)');
                comment.lastElementChild.firstElementChild.lastElementChild.setAttribute('onmouseenter',"showcommentmenu('"+id+"',true,this)");
                comment.lastElementChild.firstElementChild.lastElementChild.style.position='relative';
                comment.lastElementChild.firstElementChild.lastElementChild.style.display='none';
                parent.parentElement.appendChild(comment);
                comment.scrollIntoView();
                tag.value='';
                tag.style.borderColor='gray';
                tag_count=document.getElementById('comment-count');
                tag_count.innerText=Number(tag_count.innerText)+1;
                update=setTimeout(continusresponse,2000,flag_endtime)//calling continueresponse with settime and passing flag_endtime
            }
            else{
                alert('Somwthing Went Wrong...\nPleace Try again...')
            }
        }
    }
    else dimifnocomment(parent);
    //for offline web...  
}

//for comment load
function loadComment(){
    let loading=document.createElement('div')
    loading.setAttribute('class','center-text-align');
    loading.innerText='Loading.....';
    document.getElementById('blankcomment').parentElement.appendChild(loading);
    let xlr=new XMLHttpRequest();
    xlr.open('get','/polls/sendcomment/?poll='+document.getElementById('poll_id').value,true);
    xlr.send();
    xlr.onload=function(){
        if(this.status==200 && this.responseText!='Poll has been deleted'){
            let jsondata=JSON.parse(this.responseText);
            //var endtime=jsondata.endtime;
            //console.log('Ending TimeRecive:=',jsondata.endtime)
            putComment(jsondata.comments,loading);
            flag_endtime=jsondata.endtime;
            //update=setTimeout(continusresponse,100,flag_endtime);
        }
        else{
            loading.remove();
            alert('somthing wrong...\nPlease try again...');
        }
    }
}
function putComment(jsondata,loading){
    let place=loading.parentElement;
    loading.remove();
    for(commentdata of jsondata){
        comment=place.children[1].cloneNode(true);
        comment.removeAttribute('style');
        comment.id='comment_'+commentdata.id;
        comment.removeAttribute('onmouseenter');
        comment.removeAttribute('onmouseleave');
        let a=document.createElement('a');
        a.classList.add('inline-block');
        a.href='/account/profile/'+commentdata.userid+'/';
        //a.classList.add('snap_profile');
        a.innerHTML='<img class="poll-profile cover inline radius50" src="'+commentdata.image+'">';
        comment.replaceChild(a,comment.firstElementChild);
        maincomment=comment.lastElementChild.firstElementChild;
        maincomment.setAttribute('onmouseenter','show(this)');//for three dotted menu show and
        maincomment.setAttribute('onmouseleave','hide(this)');//for hide
        maincomment.firstElementChild.firstElementChild.innerHTML='<a class="snap_profile" href="/account/profile/'+commentdata.userid+'/" onmouseenter="get_snap_profile(this)">'+commentdata.user+'</a>'+
                                                                    '<span class="flag-block"><div class="dot inline-block"></div>'+commentdata.c_time+'</span>'+(commentdata.edited?
                                                                    '<span class="flag-block"><div class="dot inline-block"></div>edited<span>':'');//for user name
        //div tag for comment
        let divcomment=document.createElement('div');
        divcomment.id='comment'+commentdata.id;
        divcomment.innerText=commentdata.comment.trimRight();
        divcomment.classList.add('textarea', 'hundrad','left-padding','pre-wrap');
        maincomment.firstElementChild.replaceChild(divcomment,maincomment.firstElementChild.children[1]);//actual comment in div tag
        maincomment.lastElementChild.setAttribute('onmouseenter',"showcommentmenu('"+commentdata.id+"',true,this)");//three dotted menu
        maincomment.firstElementChild.lastElementChild.value=commentdata.userid;//for hidden input that holdes user information
        replycommenttag=maincomment.nextElementSibling;
        place.appendChild(comment);//push the comment with its reply not yet attached
        placeReplyComment(replycommenttag,commentdata.replycomment,commentdata.id);
    }
}

function placeReplyComment(tag,commentdata,id){
    for(replys of commentdata){
        let div=document.createElement('div');
        div.id='comment_'+replys.id;
        div.classList.add('flex','flex-start','upper-low-padding', 'hundrad');
        div.innerHTML='<a class="inline-block" href="/account/profile/'+replys.userid+'/"><img class="poll-profile cover inline radius50" src="'+replys.image+'"></a>'+
                        "<div class='flex hundrad comment-background' onmouseenter='show(this)' onmouseleave='hide(this)'>"+
                            "<div class='hundrad left-padding'>"+
                                '<h4 class="no">'+
                                    '<a class="snap_profile" href="account/profile/'+replys.userid+'/" onmouseenter="get_snap_profile(this)">'+replys.user+'</a>'+
                                    '<span class="flag-block"><div class="dot inline-block"></div>'+replys.c_time+'</span>'+(replys.edited?'<span class="flag-block"><div class="dot inline-block"></div>edited<span>':'')+
                                '</h4>'+
                                '<div id="comment'+replys.id+'" class="textarea hundrad left-padding pre-wrap">'+replys.comment+'</div>'+
                                '<input type="hidden" value="'+id+'">'+
                                '<input type="hidden" value="'+replys.userid+'">'+
                            '</div>'+
                            '<div class="comment-menu" onmouseenter="showcommentmenu('+replys.id+',false,this)" style="position: relative;display:none"></div>'+
                        "</div>";
        tag.appendChild(div);
    }
}

//continue response
function continusresponse(endtime){
    flag_for_other_request=false;//flag indicating to not allow other request 
    let xlr=new XMLHttpRequest();
    let data='/polls/update/?poll='+document.getElementById('poll_id').value+'&endtime='+endtime+'&newcomments=['+newcomment_list+']&newreplys=['+newreplycomment_list+']&editedcomments=['+editedcomment_list+']';
    newcomment_list=[];
    newreplycomment_list=[];
    editedcomment_list=[];
    //console.log('this is in continueresponse');
    xlr.open('get',data,true);
    xlr.send();
    xlr.onload=function(){
        if(this.status==200){
            if(this.responseText!='poll is deleted'){
                jsonresponse=JSON.parse(this.responseText);
                editedcomment(jsonresponse.editedcomment);
                newcomment(jsonresponse.newcomment);
                replycomment(jsonresponse.newreplycomment);
                deletecomment(jsonresponse.commentlist);
                document.getElementById('vote-count').innerHTML=jsonresponse.vote;
                document.getElementById('comment-count').innerHTML=jsonresponse.comment;
                flag_for_other_request=true;//flag indicating to allow other request
                flag_endtime=jsonresponse.endtime;
                update=setTimeout(continusresponse,3000,jsonresponse.endtime);
            }
            else{
                div=document.createElement('div');
                div.innerHTML="This poll has been deleted...";
                document.getElementsByClassName('main').parentElement.replaceChild(div,document.getElementsByClassName('main'));
            }
        }
        else alert('Somthing is wrong...\nTry to refrash the page...')
    }
}
function newcomment(comments){
    for(commentdata of comments){
        comment=document.getElementById('blankcomment').cloneNode(true);
        comment.removeAttribute('style');
        comment.id='comment_'+commentdata.id;
        comment.removeAttribute('onmouseenter');
        comment.removeAttribute('onmouseleave');
        let a=document.createElement('a');
        a.classList.add('inline-block');
        a.href='/account/profile/'+commentdata.userid+'/';
        //a.classList.add('snap_profile');
        a.innerHTML='<img class="poll-profile cover inline radius50" src="'+commentdata.image+'">';
        comment.replaceChild(a,comment.firstElementChild);
        //comment.firstElementChild.src=commentdata.image;
        maincomment=comment.lastElementChild.firstElementChild;
        maincomment.setAttribute('onmouseenter','show(this)');//for three dotted menu show and
        maincomment.setAttribute('onmouseleave','hide(this)');//for hide
        maincomment.firstElementChild.firstElementChild.innerHTML='<a class="snap_profile" href="/account/profile/'+commentdata.userid+'/" onmouseenter="get_snap_profile(this)">'+commentdata.user+'</a>'+
                                                                    '<span class="flag-block"><div class="dot inline-block"></div>'+commentdata.c_time+'</span>'+(commentdata.edited?
                                                                    '<span class="flag-block"><div class="dot inline-block"></div>edited<span>':'');//for user name
        //div tag for comment
        let divcomment=document.createElement('div');
        divcomment.id='comment'+commentdata.id;
        divcomment.innerText=commentdata.comment.trimRight();
        divcomment.classList.add('textarea', 'hundrad','left-padding','pre-wrap');
        maincomment.firstElementChild.replaceChild(divcomment,maincomment.firstElementChild.children[1]);//actual comment in div tag
        maincomment.lastElementChild.setAttribute('onmouseenter',"showcommentmenu('"+commentdata.id+"',true,this)");//three dotted menu
        maincomment.firstElementChild.lastElementChild.id=commentdata.userid;//for hidden input that holdes user information
        replycommenttag=maincomment.nextElementSibling;
        document.getElementById('blankcomment').parentElement.appendChild(comment);//push the comment with its reply not yet attached
    }
}

function replycomment(comments){
    //console.log(comments);
    for(replys of comments){
        reply_of=replys.reply_of;
        maincomment=document.getElementById('comment_'+reply_of);
        let div=document.createElement('div');
        div.id='comment_'+replys.id;
        div.classList.add('flex','flex-start','upper-low-padding', 'hundrad');
        div.innerHTML='<a class="inline-block" href="/account/profile/'+commentdata.userid+'/"><img class="poll-profile cover inline radius50" src="'+replys.image+'"></a>'+
                        "<div class='flex hundrad comment-background' onmouseenter='show(this)' onmouseleave='hide(this)'>"+
                            "<div class='hundrad left-padding'>"+
                                '<h4 class="no">'+
                                    +'<a class="snap_profile" href="account/profile/'+commentdata.userid+'/" onmouseenter="get_snap_profile(this)">'+replys.user+'</a>'+
                                    '<span class="flag-block"><div class="dot inline-block"></div>'+replys.c_time+'</span>'+(replys.edited?'<span class="flag-block"><div class="dot inline-block"></div>edited<span>':'')+
                                '</h4>'+
                                '<div id="comment'+replys.id+'" class="textarea hundrad left-padding pre-wrap">'+replys.comment+'</div>'+
                                '<input type="hidden" value="'+reply_of+'">'+
                                '<input type="hidden" value="'+replys.userid+'">'+
                            '</div>'+
                            '<div class="comment-menu" onmouseenter="showcommentmenu('+replys.id+',false,this)" style="position: relative;display:none"></div>'+
                        "</div>";
        maincomment.lastElementChild.lastElementChild.appendChild(div);
    }
}
function deletecomment(comment_ids){
    itaration_comment=document.getElementById('blankcomment').parentElement.children;
    //console.log(itaration_comment[3],'\n',typeof(itaration_comment));
    if(itaration_comment.length>=2){
        for(let i in itaration_comment){
            //console.log('before continue:',i);
            if(i<2)continue;
            if(i=='length') break;
            if(!comment_ids.includes(Number(itaration_comment[i].id.split('_',2)[1]))){
                itaration_comment[i].remove();
                continue;
            }
            childs=itaration_comment[i].lastElementChild.lastElementChild.children;
            if(childs.length!=0){
                for(child of childs){
                    id=child.id.split('_',2);
                    if(!comment_ids.includes(Number(id[1])) && id[1]!='')
                        child.remove();
                }
            }
        }
    }
}
function editedcomment(editedcomments){
    for(comment of editedcomments){
        div=document.getElementById('comment'+comment.id);
        div.innerText=comment.comment;
        if(div.previousElementSibling.children.length==2){
            editedtag=document.createElement('span');
            editedtag.classList.add('flag-block');
            editedtag.innerHTML='<div class="dot inline-block"></div>edited';
            div.previousElementSibling.appendChild(editedtag);
        }
    }
}
document.onkeydown = function(e){
    if(e.target.tagName.toLowerCase()=='textarea' || e.target.tagName.toLowerCase()=='input')return;
    e=e || window.event;
    let video=false;
    for( v of document.getElementsByTagName('video')){
        if(v.parentElement.style.display=='block')video=v;
    }/*
    let image=false;
    for(let i of document.querySelectorAll('.post-picture-container img')){
        if(i.parentElement.style.display=='block')image=i;
    }*/
    if(e.keyCode === 32){
        e.preventDefault();
        if(video!==false)video.paused ? play(video) : pause(video);
    }else if(e.keyCode === 70){
        e.preventDefault()
        if(video!==false /*|| image!==false*/){
            if(document.fullscreenElement) document.exitFullscreen();
            else if(video!==false)video.requestFullscreen();
            //else image.requestFullscreen();
        }
    }else if(e.keyCode === 77){
        e.preventDefault();
        if(video!==false)video.muted ? unmute(video) : mute(video);
    }else if(e.keyCode === 39){
        e.preventDefault();
        let dot=document.getElementsByClassName('activeslide')[0].nextElementSibling;
        if(dot) dot.click();
    }else if(e.keyCode === 37){
        e.preventDefault();
        let dot=document.getElementsByClassName('activeslide')[0].previousElementSibling;
        if(dot) dot.click();
    }
};