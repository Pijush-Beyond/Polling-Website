var notification_count_mistmatch;
function loadNotifications(){
    if(document.getElementById('profile-Id').value===''){
        let notification_container=document.getElementById('notifications');
        notification_container.innerHTML="Please Login First...";
        return;
    }
    let xhr=new XMLHttpRequest();
    xhr.open('post','/account/loadnotifications/'+document.getElementById('profile-Id').value+'/',true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    let data='csrfmiddlewaretoken='+document.getElementsByName('csrfmiddlewaretoken')[0].value;
    xhr.send(data);
    xhr.onload=function(){
        if(this.status==200 && this.responseText!='something went wrong'){
            data=JSON.parse(this.responseText);
            //console.log(this.responseText);
            //notification_count_mistmatch=(Number(document.getElementById('total-notifications').value)+data.notifications.length)==data.notification_count;
            sortNotifications(data);
            setTimeout(updateNotifications,15000,data.end_time,[]);
        }
    }
}
function updateNotifications(time,no_need_notifications){
    let xhr=new XMLHttpRequest();
    xhr.open('post','/account/updatenotifications/'+document.getElementById('profile-Id').value+'/',true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    let data='csrfmiddlewaretoken='+document.getElementsByName('csrfmiddlewaretoken')[0].value+'&endtime='+time+(!notification_count_mistmatch?'&count_mismatch=true':'')+'&noneed'+no_need_notifications.join(',');
    xhr.send(data);
    xhr.onload=function(){
        if(this.status==200 && this.responseText!='something went wrong'){
            data=JSON.parse(this.responseText);
            notification_count_mistmatch=(Number(document.getElementById('total-notifications').value)+data.notifications.length)==data.notification_count;
            no_need_notifications=sortNotifications(data,true);
            setTimeout(updateNotifications,15000,data.end_time,no_need_notifications);
        }
    }
}
function sortNotifications(notifications,update){
    let info={
        reaction:{reaction_count:{},reaction_name:{},reaction_img:{},reaction_id:{}},
        vote:{vote_count:{},vote_name:{},vote_img:{},vote_id:{}},
        follow:{follow_count:0,follow_name:[],follow_img:[],follow_id:[]},
    }
    let sorted_notifications=[];
    for(let nt of notifications.notifications){
        if(nt[1]=='1'){
            if(info.reaction.reaction_count[nt[nt.length-1]]!==undefined){
                info.reaction.reaction_count[nt[nt.length-1]]+=1;
                info.reaction.reaction_name[nt[nt.length-1]].push(nt[4]);
                info.reaction.reaction_img[nt[nt.length-1]].push(nt[3]);
                info.reaction.reaction_id[nt[nt.length-1]].push(nt[0]);
                break;
            }else{
                info.reaction.reaction_count[nt[nt.length-1]]=1;
                info.reaction.reaction_img[nt[nt.length-1]]=[nt[3]];
                info.reaction.reaction_name[nt[nt.length-1]]=[nt[4]];
                info.reaction.reaction_id[nt[nt.length-1]]=[nt[0]];
            }
        }else if(nt[1]=='3'){
            if(info.vote.vote_count[nt[nt.length-1]]!==undefined){
                info.vote.vote_count[nt[nt.length-1]]+=1;
                info.vote.vote_name[nt[nt.length-1]].push(nt[4]);
                info.vote.vote_img[nt[nt.length-1]].push(nt[3]);
                info.reaction.vote_id[nt[nt.length-1]].push(nt[0]);
                break;
            }else{
                info.vote.vote_count[nt[nt.length-1]]=1;
                info.vote.vote_img[nt[nt.length-1]]=[nt[3]];
                info.vote.vote_name[nt[nt.length-1]]=[nt[4]];
                info.reaction.vote_id[nt[nt.length-1]]=[nt[0]];
            }
        }else if(nt[1]=='5'){
            info.follow.follow_count+=1;
            info.follow.follow_name.push(nt[4]);
            info.follow.follow_img.push(nt[3]);
            info.reaction.follow_id[nt[nt.length-1]].push(nt[0]);
            if(info.follow.follow_count!=0)break;
        }
        sorted_notifications.push(nt);
    }
    if(notifications.all_id!==undefined)deletenotification(notifications.all_id);
    return placeNotification(sorted_notifications,info,notifications.notification_count,update);
}
function placeNotification(sorted_notifications,info,total_notifications,update){
    let no_need_notifications=[];
    try{
        let current_page_type=document.getElementById('current-page-type').value;
    }catch(error){
        setTimeout(placeNotification,1000,sorted_notifications,info,total_notifications,update);
        return;
    }
    let current_page_id=document.getElementById('poll_id').value;
    document.getElementById('total-notifications').value=total_notifications;
    let exsits_notification=document.getElementsByClassName('notification');
    let notification_container=document.getElementById('notifications');
    for(let nt of sorted_notifications){
        let notification=document.createElement('a');
        notification.classList.add('flex','pointer','notification');
        notification.setAttribute('style','align-items:center');
        notification.setAttribute('onclick','shownotificationdetails(event,this)');
        if(nt[1]=='1'){
            if(current_page_id==nt[nt.length-1]){no_need_notifications.push(nt[0]);continue;}
            if(window.innerWidth<=1000 && !document.getElementById('notification').classList.contains('greenbutton'))
                for(let i of document.getElementsByClassName('notificationdot')) i.classList.remove('hide');
            let flag=false
            if(update){
                for(let n of exsits_notification){
                    if(n.children[4].value==nt[nt.length-1]){
                        n.children[0].src=nt[3];
                        n.children[1].firstChild.innerHTML=nt[4];
                        if(n.children[1].lastChild.getAttribute('hidden')){
                            n.children[1].lastChild.removeAttribute('hidden');
                            n.children[1].lastChild.innerHTML=" and other "+info.reaction.reaction_count[nt[nt.length-1]];
                        }else n.children[1].lastChild.innerHTML=" and other "+(Number(n.children[1].lastChild.innerHTML.split(' ')[3])+info.reaction.reaction_count[nt[nt.length-1]]);
                        n.children[2].value=n.children[2].value+','+info.reaction.reaction_name[nt[nt.length-1]].join(',');
                        n.children[3].value=n.children[3].value+','+info.reaction.reaction_img[nt[nt.length-1]].join(',');
                        n.children[5].value=n.children[5].value+','+info.reaction.reaction_id.join(',');
                        notification.insertAdjacentElement('afterbegin',n);
                        break;
                    }
                }
            }
            if(flag)break;
            notification.innerHTML='<div style="position:relative">'+
                                        '<img class="poll-profile cover inline radius50" style="width:35px;height:35px" src="'+(nt[3]!==''?nt[3]:'/static/image/profile.jpg')+'">'+
                                    '</div>'+
                                    '<div class="width100" style="margin-left:8px;">'+
                                        '<span>'+nt[4]+'</span><span'+(info.reaction.reaction_count[nt[nt.length-1]]-1 <= 0?' hidden':'')+'> and other '+(info.reaction.reaction_count[nt[nt.length-1]]-1)+'</span> reacted on your '+' post '+'you have shared'+
                                    '</div>'+
                                    '<input type="hidden" name="names" value="'+info.reaction.reaction_name[nt[nt.length-1]].join(',')+'">'+
                                    '<input type="hidden" name="dps" values="'+info.reaction.reaction_img[nt[nt.length-1]].join(',')+'">'+
                                    '<input type="hidden" name="post" value"'+nt[nt.length-1]+'">'+
                                    '<input type="hidden" name="n-id"value="'+info.reaction.reaction_id[nt[nt.length-1]].join(',')+'">'+
                                    '<input type="hidden" name="n-type" value="'+nt[1]+'">';
            notification.href="/"+nt[nt.length-1]+'/';
            notification_container.insertAdjacentElement('afterbegin',notification);
        }else if(nt[1]=='3'){
            if(current_page_id==nt[nt.length-1]){no_need_notifications.push(nt[0]);continue;}
            if(window.innerWidth<=1000 && !document.getElementById('notification').classList.contains('greenbutton'))
                for(let i of document.getElementsByClassName('notificationdot')) i.classList.remove('hide');
            let flag=false
            if(update){
                for(let n of exsits_notification){
                    if(n.children[4].value==nt[nt.length-1]){
                        n.children[0].src=nt[3];
                        n.children[1].firstChild.innerHTML=nt[4];
                        if(n.children[1].lastChild.getAttribute('hidden')){
                            n.children[1].lastChild.removeAttribute('hidden');
                            n.children[1].lastChild.innerHTML=" and other "+info.vote.vote_count[nt[nt.length-1]];
                        }else n.children[1].lastChild.innerHTML=" and other "+(Number(n.children[1].lastChild.innerHTML.split(' ')[3])+info.vote.vote_count[nt[nt.length-1]]);
                        n.children[2].value=n.children[2].value+','+info.vote.vote_name[nt[nt.length-1]].join(',');
                        n.children[3].value=n.children[3].value+','+info.vote.vote_img[nt[nt.length-1]].join(',');
                        n.children[5].value=n.children[5].value+','+info.vote.vote_id[nt[nt.length-1]].join(',');
                        notification.insertAdjacentElement('afterbegin',n);
                        break;
                    }
                }
            }
            if(flag)break;
            notification.innerHTML='<div style="position:relative">'+
                                        '<img class="poll-profile cover inline radius50" style="width:35px;height:35px" src="'+(nt[3]!==''?nt[3]:'/static/image/profile.jpg')+'">'+
                                    '</div>'+ 
                                    '<div class="width100" style="margin-left:8px;">'+
                                        '<span>'+nt[4]+'</span><span'+(info.vote.vote_count[nt[nt.length-1]]-1 <= 0?' hidden':'')+'> and other '+(info.vote.vote_count[nt[nt.length-1]]-1)+'</span> voted on your '+' post '+'you have shared'+
                                    '</div>'+
                                    '<input type="hidden" name="names" value="'+info.vote.vote_name[nt[nt.length-1]].join(',')+'">'+
                                    '<input type="hidden" name="dps" values="'+info.vote.vote_img[nt[nt.length-1]].join(',')+'">'+
                                    '<input type="hidden" name="post" value"'+nt[nt.length-1]+'">'+
                                    '<input type="hidden" name="n-id" value="'+info.vote.vote_id.join(',')+'">'+
                                    '<input type="hidden" name="n-type" value="'+nt[1]+'">';
            notification.href="/"+nt[nt.length-1]+'/';
            notification_container.insertAdjacentElement('afterbegin',notification);
        }else if(nt[1]=='5'){
            if(current_page_type=='myprofile'){no_need_notifications.push(nt[0]);continue;}
            if(window.innerWidth<=1000 && !document.getElementById('notification').classList.contains('greenbutton'))
                for(let i of document.getElementsByClassName('notificationdot')) i.classList.remove('hide');
            let flag=false
            if(update){
                for(let n of exsits_notification){
                    if(n.children[4].value==nt[nt.length-1]){
                        n.children[0].src=nt[3];
                        n.children[1].firstChild.innerHTML=nt[4];
                        if(n.children[1].lastChild.getAttribute('hidden')){
                            n.children[1].lastChild.removeAttribute('hidden');
                            n.children[1].lastChild.innerHTML=" and other "+info.follow.follow_count;
                        }else n.children[1].lastChild.innerHTML=" and other "+(Number(n.children[1].lastChild.innerHTML.split(' ')[3])+info.follow.follow_count);
                        n.children[2].value=n.children[2].value+','+info.follow.follow_name.join(',');
                        n.children[3].value=n.children[3].value+','+info.follow.follow_img.join(',');
                        n.children[5].value=n.children[5].value+','+info.follow.follow_id.join(',');
                        notification.insertAdjacentElement('afterbegin',n);
                        document.getElementById('follower-count').innerHTML=Number(document.getElementById('follower-count').innerHTML)+info.follow.follow_count;
                        break;
                    }
                }
            }
            if(flag)break;
            notification.innerHTML='<div style="position:relative">'+
                                        '<img class="poll-profile cover inline radius50" style="width:35px;height:35px" src="'+(nt[3]!==''?nt[3]:'/static/image/profile.jpg')+'">'+
                                    '</div>'+
                                    '<div class="width100"'+
                                        '<span>'+nt[4]+'</span><span'+(info.follow.follow_count-1 <= 0?' hidden':'')+'> and other '+(info.follow.follow_count-1)+'</span> started to follow you'+
                                    '</div>'+
                                    '<input type="hidden" name="names" value="'+info.follow.follow_name.join(',')+'">'+
                                    '<input type="hidden" name="dps" values="'+info.follow.follow_img.join(',')+'">'+
                                    '<input type="hidden" name="post" value"'+nt[nt.length-1]+'">'+//where is post_id comming from????
                                    '<input type="hidden" name="n-id" value="'+info.follow.follow_id.join(',')+'">'+
                                    '<input type="hidden" name="n-type" value="'+nt[1]+'">';
            document.getElementById('follower-count').innerHTML=Number(document.getElementById('follower-count').innerHTML)+info.follow.follow_count;
            notification.href="/account/"+document.getElementById('profile-Id').value+'/';
            notification_container.insertAdjacentElement('afterbegin',notification);
        }else if(nt[1]=='4'){
            if(current_page_type==nt[nt.length-1])no_need_notifications.push(nt[0]);
            if(window.innerWidth<=1000 && !document.getElementById('notification').classList.contains('greenbutton'))
                for(let i of document.getElementsByClassName('notificationdot')) i.classList.remove('hide');
            notification.innerHTML='<div style="position:relative">'+
                                        '<img class="poll-profile cover inline radius50" style="width:35px;height:35px" src="'+(nt[3]!==''?nt[3]:'/static/image/profile.jpg')+'">'+
                                    '</div>'+
                                    '<div class="width100" style="margin-left:8px;">'+
                                        '<span>'+nt[4]+'</span> reveale the result of the poll you have voted'+
                                    '</div>'+
                                    '<input type="hidden" name="post" value"'+nt[nt.length-1]+'">'+
                                    '<input type="hidden" name="n-id" value="'+nt[0]+'">'+
                                    '<input type="hidden" name="n-type" value="'+nt[1]+'">';
            notification.href="/"+nt[nt.length-1]+'/';
            notification_container.insertAdjacentElement('afterbegin',notification);
        }else if(nt[1]=='21'){
            if(current_page_id==nt[nt.length-1]){no_need_notifications.push(nt[0]);continue;}
            if(window.innerWidth<=1000 && !document.getElementById('notification').classList.contains('greenbutton'))
                for(let i of document.getElementsByClassName('notificationdot')) i.classList.remove('hide');
            notification.innerHTML='<div style="position:relative">'+
                                        '<img class="poll-profile cover inline radius50" style="width:35px;height:35px" src="'+(nt[3]!==''?nt[3]:'/static/image/profile.jpg')+'">'+
                                    '</div>'+
                                    '<div class="width100" style="margin-left:8px;">'+
                                        '<span>'+nt[4]+'</span> commented on the post you have commented recently'+
                                    '</div>'+
                                    '<input type="hidden" name="post" value"'+nt[nt.length-1]+'">'+
                                    '<input type="hidden" name="n-id"value="'+nt[0]+'">'+
                                    '<input type="hidden" name="n-type" value="'+nt[1]+'">';
            notification.href="/"+nt[nt.length-1]+'/';
            notification_container.insertAdjacentElement('afterbegin',notification);
        }else if(nt[1]=='22'){
            if(current_page_id==nt[nt.length-1]){no_need_notifications.push(nt[0]);continue;}
            if(window.innerWidth<=1000 && !document.getElementById('notification').classList.contains('greenbutton'))
                for(let i of document.getElementsByClassName('notificationdot')) i.classList.remove('hide');
            notification.innerHTML='<div style="position:relative">'+
                                        '<img class="poll-profile cover inline radius50" style="width:35px;height:35px" src="'+(nt[3]!==''?nt[3]:'/static/image/profile.jpg')+'">'+
                                    '</div>'+
                                    '<div class="width100" style="margin-left:8px;">'+
                                        '<span>'+nt[4]+'</span> replyed to you'+
                                    '</div>'+
                                    '<input type="hidden" name="post" value"'+nt[nt.length-1]+'">'+
                                    '<input type="hidden" name="n-id" value="'+nt[0]+'">'+
                                    '<input type="hidden" name="n-type" value="'+nt[1]+'">';
            notification.href="/"+nt[nt.length-1]+'/';
            notification_container.insertAdjacentElement('afterbegin',notification);
        }
    }
    return no_need_notifications;
}
function deletenotification(all_id){
    let notifications=document.getElementsByClassName('notification');
    for(let nt of notifications){
        if(nt.lastElementChild.value=='1' || nt.lastElementChild.value=='3' || nt.lastElementChild.value=='5'){
            let ids=nt.children[4].value.split(',');
            let new_ids=[];
            let dps=nt.children[3].value.split(',');
            let new_dps=[];
            let names=nt.children[3].value.split(',');
            let new_names=[];
            let flag=false;
            for(let id in ids){
                if(all_id.includes(ids[id])){
                    new_ids.push(ids[id]);
                    new_dps.push(dps[id]);
                    new_names.push(names[id])
                    flag=true;
                }
            }
            let len= new_ids.length;
            if(nt.lastElementChild.value=='5')document.getElementById('follower-count').innerHTML=Number(document.getElementById('follower-count').innerHTML)-(nt.lastElementChild.previousElementSibling.value.split(',').length - new_ids.length);
            if(flag && len>0){
                nt.firstElementChild.firstElementChild.src=new_dps[0];
                nt.children[1].firstChild.innerHTML=new_names[0];
                if(len==1)nt.children[1].lastChild.setAttribute('hidden','hidden');
                else{
                    nt.children[1].lastChild.removeAttribute('hidden');
                    nt.innerHTML=' and other '+(len-1);
                }
                nt.children[2].value=new_names.join(',');
                nt.children[3].value=new_dps.join(',');
                nt.children[4].value=new_ids.join(',');
            }
            else if(flag) nt.remove();
        }else{
            if(!all_id.includes(nt.lastElementChild.previousElementSibling.value))nt.remove();
        }
    }
}
function shownotificationdetails(e,notification){
    let title;
    let flag_for_poll_page=false;
    let flag_current_is_poll_page;
    e.preventDefault();
    if(window.innerWidth<=700){
        showprofilenavbar(document.getElementsByClassName('profilebarcontainer')[0],document.getElementsByClassName('main-menu')[0]);
    }else if(window.innerWidth<=1000){
        showNotificationbar(document.getElementsByClassName('sidebarcontainer')[0],document.getElementById('notification'));
    }
    notification.hidden=true;
    //document.getElementsByClassName('maincontainer').innerHTML=             //waiting code after 
    try {
        clearTimeout(update);
        flag_current_is_poll_page=true;  
    } catch (error) {
        flag_current_is_poll_page=false;
    }
    if(notification.lastElementChild.value!='5')flag_for_poll_page=true;
    let xhr=new XMLHttpRequest();
    xhr.open('post',notification.href,true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.send('csrfmiddlewaretoken='+document.getElementsByName('csrfmiddlewaretoken')[0].value+'&notification=True');
    xhr.onload=function(){
        if(this.status==200){
            if(notification.lastElementChild.value!='5'){
                for(let nt of document.getElementsByClassName('notification')){
                    if(nt.lastElementChild.previousElementSibling.previousElementSibling.value==notification.lastElementChild.previousElementSibling.previousElementSibling.value)nt.remove();
                }
            }
            notification.remove();
            document.getElementsByClassName('maincontainer')[0].innerHTML=this.responseText;
            if(flag_for_poll_page) title='Poll No:'+notification.lastElementChild.previousElementSibling.previousElementSibling.value;
            else title=document.getElementsByName('Dp')[0].innerHTML;
            window.top.document.title=title;
            window.top.history.pushState({'title':title,'html':this.responseText},'',notification.href);
            if(flag_current_is_poll_page) delete update;
            if(flag_for_poll_page)loadComment();
        }else{
            if(flag_current_is_poll_page)update=setTimeout(continusresponse,1000,lastcommentloadtime);//there must do edit for jsondata.endtime ---> common_animations sections also;
        }
    }
}



