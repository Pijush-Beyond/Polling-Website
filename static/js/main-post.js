
function showlist(action,identifier){
    place=document.getElementsByClassName('person-list')[0];
    place.parentElement.parentElement.style.transform='scale(1,1)';
    place.innerHTML='<i class="fas fa-spinner fa-pulse block" style="margin:auto"></i>'
    let xhr=new XMLHttpRequest();
    xhr.open('get',action,true);
    xhr.send();
    xhr.onload=function(){
        if(this.status==200 && this.responseText!='poll has been deleted')
            placelist(place,this.responseText,identifier)
        else place.innerHTML='<div style="text-align:center">Something went Wrong...<br>Pleace Try Again</div>'
    }
}
function placelist(place,listtext,identifier){
    let options=document.getElementsByClassName('personlist-option');
    for(let op of options) op.classList.remove('active-option');
    place.innerHTML='';
    list=JSON.parse(listtext);
    list=list.list;
    let icon;
    if(identifier==1){
        icon="fas fa-thumbs-up";
        options[0].classList.add('active-option');
    }else if(identifier==2){
        icon="fas fa-thumbs-down";
        options[1].classList.add('active-option');
    }else{
        icon="fas fa-vote-yea";
        options[2].classList.add('active-option');
    }
    for(item of list){
        div=document.createElement('div');
        div.classList.add('flex','width100','list-item');
        div.innerHTML='<div class="width100"><img class="poll-profile cover inline-block radius50" style="width:35px;height:35px;margin-top: 5px" src="'+item.img+'">'+
                    '<h3 class="no inline-block horizontally-center" style="padding-left: 5px";color:#355c65>'+item.fullname+'</h3></div>'+
                    '<i class="'+icon+'" style="margin:auto;color:rgb(199, 163, 29);font-size:20px">';
        place.appendChild(div);
    }
}
function hidepersonlist(){
    let list=document.getElementsByClassName('person-list')[0];
    list.innerHTML='';
    list.parentElement.parentElement.style.transform='scale(0,0)';
}
//var flag_for_comment_load=false; 
function loadContent(){
    flag_for_comment_load=true;
}
function changeSlide(tag,n){
    pre_v=tag.parentElement.lastElementChild.value;
    showSlide(tag.parentElement.nextElementSibling,Number(pre_v)+n);
}
function showSlide(tag,slide_change_no){
    let slide=tag.previousElementSibling.children;
    
    for(let i of slide){
        i.style.display='none';
        if(i.children.length==5){
            if(!i.firstElementChild.paused) pause(i.children[2]);
            i.firstElementChild.currentTime=0;
        }
    }
    for(let i of tag.children) i.className=i.className.replace('activeslide','');
    if(slide_change_no>1 && slide_change_no<(slide.length-3)){
        let arrows=tag.previousElementSibling.children;
        for(let i=2;i<4;i++) arrows[arrows.length-i].style.display ="inline-block";
    }
    else if(slide_change_no==1){//hide left arrow
        let arrows=tag.previousElementSibling.children;
        arrows[arrows.length-2].style.display ="inline-block";
    }
    else if(slide_change_no==(slide.length-3)){//hide rigth arrow
        let arrows=tag.previousElementSibling.children;
        arrows[arrows.length-3].style.display ="inline-block";   
    }
    tag.children[slide_change_no-1].classList.add('activeslide');
    slide[slide_change_no-1].style.display='block';

    tag.previousElementSibling.lastElementChild.value=slide_change_no;//stores the current slide no.
}
function collapse(tag){
    tag=tag.parentElement.parentElement.nextElementSibling;
    if(tag.style.maxHeight=='0px')tag.style.maxHeight=tag.scrollHeight+'px';
    else tag.style.maxHeight='0px';
}
function select(tag){
    if(document.getElementById(tag.classList[tag.classList.length-1]).checked){
        document.getElementById(tag.classList[tag.classList.length-1]).checked=false;
        document.getElementsByClassName('choice-submit')[0].disabled=true;
    }else {
        document.getElementById(tag.classList[tag.classList.length-1]).checked=true;
        document.getElementsByClassName('choice-submit')[0].disabled=false;
    }
}
function like(tag){
    if(document.getElementById('profile-Id').value==''){
        alert('Please login First');
        return;
    }
    let form=tag.parentElement.parentElement;
    checking_flag=tag.previousElementSibling.checked;
    let second_Condition_flag=false;
    for(let input of form.elements){
        if(input.checked==true){
            checked_radio=input.nextElementSibling.nextElementSibling;
            second_Condition_flag=true;
        }
    }
    if(tag.previousElementSibling.checked==true) tag.previousElementSibling.checked=false;
    else tag.previousElementSibling.checked=true;
    let xhr=new XMLHttpRequest();
    xhr.open('post',form.action,true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.send('csrfmiddlewaretoken='+document.getElementsByName('csrfmiddlewaretoken')[0].value+'&like='+form.elements.namedItem('like').value);
    xhr.onload=function(){
        if(this.status!=200 && this.responseText!='ok'){
            if(tag.previousElementSibling.checked==true) tag.previousElementSibling.checked=false;
            else tag.previousElementSibling.checked=true;
            alert('something went wrong')
        }else{
            if(checking_flag==true)tag.nextElementSibling.innerHTML=Number(tag.nextElementSibling.innerHTML)-1;
            else if(second_Condition_flag){
                checked_radio.innerHTML=Number(checked_radio.innerHTML)-1;
                tag.nextElementSibling.innerHTML=Number(tag.nextElementSibling.innerHTML)+1;
            }else tag.nextElementSibling.innerHTML=Number(tag.nextElementSibling.innerHTML)+1;
        }
    }
}
function play(tag,flag){
    if(flag===undefined) tag.play();
    tag=tag.nextElementSibling;
    tag.style.display='none'
    tag.nextElementSibling.removeAttribute('style');
}
function pause(tag,flag){
    if(flag===undefined) tag.pause();
    tag=tag.nextElementSibling.nextElementSibling;
    tag.style.display='none'
    tag.previousElementSibling.removeAttribute('style');
}
function mute(tag,flag){
    if(flag===undefined)tag.muted=true;
    tag=tag.nextElementSibling.nextElementSibling.nextElementSibling;
    tag.style.display='none'
    tag.nextElementSibling.removeAttribute('style');
}
function unmute(tag,flag){
    if(flag===undefined)tag.muted=false;
    tag=tag.parentElement.lastElementChild;
    tag.style.display='none'
    tag.previousElementSibling.removeAttribute('style');
}