function get_snap_profile(tag){
    if(tag.parentElement.lastElementChild.tagName.toLowerCase()=='div') return;
    let div=document.createElement('div');
    div.classList.add('float_snap_profile');
    div.innerHTML='<i class="fas fa-spinner fa-pulse block" style="margin:auto;background-color:transparent;padding:20px"></i>';
    div.setAttribute('onmouseleave','delete_snap_profile(this)');
    tag.parentElement.style.position='relative';
    tag.parentElement.appendChild(div);
    let xhr=new XMLHttpRequest();
    xhr.open('get','/account/snap_profile/'+tag.href.split('/')[5]+'/',true);
    xhr.send();
    xhr.onload=function(){
        if(this.status==200 && this.responseText!='account has deactivated'){
            jesondata=JSON.parse(this.responseText);
            div.innerHTML=  '<div class="flex width100">'+
                                '<a class="block" href="/account/profile/'+jesondata.id+'/"><img class="poll-profile cover inline radius50" src="'+jesondata.img+'"></a>'+
                                '<h3 calss="no width100"><a href="/account/profile/'+jesondata.id+'/" style="color:gray">'+jesondata.fullname+'</a></h3>'+
                                '<input type="hidden" value="'+jesondata.id+'">'+
                            '</div>'+
                            (document.getElementById('profile-Id').value !== String(jesondata.id)?('<i class="fas" onclick="followunfollow(this,'+(jesondata.following ?'false)">&#xf00c;':'true)">&#xf067;')+'</i>'):'')+
                            //(document.getElementById('profile-Id').value !== String(jesondata.id)?('<i class="fas fa-'+(jesondata.following ?'check" onclick="unfollow(this)"':'plus" onclick="follow(this)"')+'></i>'):'')+
                            '<div class="flex width100">'+
                                '<h4 class="inline-block no">Total Post</h4>'+
                                '<h4 class="inline-block no">'+jesondata.total_post+'</h4>'+
                            '</div>'+
                            '<div class="flex width100">'+
                                '<h4 class="inline-block no">Followers</h4>'+
                                '<h4 class="inline-block no">'+jesondata.total_followers+'</h4>'+
                            '</div>'+
                            '<div class="flex width100">'+
                                '<h4 class="inline-block no">Following</h4>'+
                                '<h4 class="inline-block no">'+jesondata.total_following+'</h4>'+
                            '</div>';
        }else if(this.resposeText=='account has deleted') div.innerHTML='<div style="margin:10px 20px">Account has been deactivated...</div>';
        else div.innerHTML='Something Went Wrong...';
    }
}
function delete_snap_profile(tag){
    tag.parentElement.removeAttribute('style');
    tag.remove();
}
//add this after
function unfollow_warning(tag){
    let warning_container=document.createElement('div');
    warning_container.classList.add('whole-window');
    warning_container.innerHTML='<div styly="display:block;background-color:rgb(228, 247, 255);border-radius:20px;margin:auto">'+
                                    '<div class="width100" style="text-align:right;margin:10px 20px 0"><button type="button" onclick="close_unfollow_warning(this)">✖</button></div>'+
                                    '<div class="width100" style="text-align:center;margin:10px 20px 0">Do You Realy Sure To Unfollow?</div>'+
                                    '<div>'+
                                        '<button type="button" onclick="close_unfollow_warning(this)">No</button>'+
                                        '<button type="button" onclick="close_unfollow_warning(this);unfollow(this)">Yes</button>'+
                                    '</div>'+
                                '</div>';
    tag.parentElement.appendChild(warning_container);
}
function followunfollow(tag,flag){
    let icon=tag.innerHTML;
    tag.innerHTML='<i class="fas fa-spinner fa-pulse" style="margin:auto;background-color:transparent;"></i>';
    let action=tag.getAttribute('onclick')
    tag.removeAttribute('onclick');
    let xhr =new  XMLHttpRequest();
    xhr.open('post','/account/followunfollow/',true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.send('csrfmiddlewaretoken='+document.getElementsByName('csrfmiddlewaretoken')[0].value+'&follower='+document.getElementById('profile-Id').value+'&inspiration='+tag.previousElementSibling.lastElementChild.value+'&message='+(flag?'follow':'unfollow'));
    xhr.onload=function(){
        if(this.status==200 && (this.responseText=='following' || this.responseText=='unfollow')){
            if(this.responseText=='following'){
                tag.innerHTML="&#xf00c;";
                tag.setAttribute('onclick','followunfollow(this,false)');
            }else{
                tag.innerHTML="&#xf067;";
                tag.setAttribute('onclick','followunfollow(this,true)');
            }
            //tag.classList.add('fa-plus');
        }
        else{
            tag.innerHTML=icon;
            tag.setAttribute('onclick',action);
            //tag.classList.add('fa-check');
        }
    }
}