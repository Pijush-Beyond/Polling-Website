function showprofilenavbar(profilebarcontainer,menu){
    let stringtoreplace;
    if(menu.firstElementChild.getAttribute('style')){
        for(let line of menu.children){
            if(line.tagName.toLowerCase()=='sup')break;
            line.removeAttribute('style');
        }
        let notificationbutton=document.getElementById('notification');
        if(notificationbutton.classList.contains('greenbutton'))
            showNotificationbar(document.getElementsByClassName('sidebarcontainer')[0],notificationbutton)
        stringtoreplace=profilebarcontainer.getAttribute('style').replace(/width:\s*100%;/i,'');
        profilebarcontainer.setAttribute('style',stringtoreplace);
        stringtoreplace=profilebarcontainer.nextElementSibling.getAttribute('style').replace(/width:\s*0px;/i,'');
        profilebarcontainer.nextElementSibling.setAttribute('style',stringtoreplace);

        //profilebarcontainer.removeAttribute('style');
        //profilebarcontainer.nextElementSibling.removeAttribute('style');
    }else{
        menu.children[0].style.transform='rotate(-39deg)';
        menu.children[0].style.borderColor='rgb(231, 228, 228)';
        menu.children[1].style.opacity='0';
        menu.children[2].style.transform='rotate(39deg)';
        menu.children[2].style.borderColor='rgb(231, 228, 228)';

        profilebarcontainer.style.width='100%';
        profilebarcontainer.nextElementSibling.style.width='0';
    }
}
function showNotificationbar(sidebar,notificationbutton){
    let stringtoreplace,tag;
    if(notificationbutton.classList.contains('greenbutton')){
        notificationbutton.classList.remove('greenbutton');
        if(window.innerWidth<=700){
            stringtoreplace=sidebar.getAttribute('style').replace(/width:\s*100%;/i,'');
            sidebar.setAttribute('style',stringtoreplace);
            document.getElementsByClassName('profilebarcontainer')[0].style.width='100%';
        }else if(window.innerWidth<=1000){
            stringtoreplace=sidebar.getAttribute('style').replace(/width:\s*50%;/i,'');
            sidebar.setAttribute('style',stringtoreplace);
            tag=document.getElementsByClassName('profilebarcontainer')[0];
            stringtoreplace=tag.getAttribute('style').replace(/width:\s*50%;/i,'');
            tag.setAttribute('style',stringtoreplace);
            tag=document.getElementsByClassName('main')[0];
            stringtoreplace=tag.getAttribute('style').replace(/width:\s*0px;/i,'');
            tag.setAttribute('style',stringtoreplace);
        }
    }else{
        notificationbutton.classList.add('greenbutton');
        if(window.innerWidth<=700){
            sidebar.style.width='100%';
            tag=document.getElementsByClassName('profilebarcontainer')[0];
            stringtoreplace=tag.getAttribute('style').replace(/width:\s*100%;/i,'');
            tag.setAttribute('style',stringtoreplace);
        }
        else if(window.innerWidth<=1000){
            sidebar.style.width='50%';
            document.getElementsByClassName('profilebarcontainer')[0].style.width='50%';
            document.getElementsByClassName('main')[0].style.width='0';
        }
    }
}
function resize(){
    let profile=document.getElementsByClassName('profilebarcontainer')[0];
    profile.style.height=window.innerHeight-document.getElementsByTagName('nav')[0].scrollHeight-(window.pageYOffset<=22?(22-window.pageYOffset):0)+'px';
    let sidebar=document.getElementsByClassName('sidebarcontainer')[0];
    sidebar.style.height=profile.style.height;
    profile.style.top=document.getElementsByTagName('nav')[0].scrollHeight+'px';
    sidebar.style.top=document.getElementsByTagName('nav')[0].scrollHeight+'px';
    document.getElementById('profilenavbar').style.height=profile.offsetHeight-12+'px';
    document.getElementById('sidebar').style.height=profile.offsetHeight-12+'px';
    if(window.innerWidth>1000){
        let tag=document.getElementsByClassName('profilebarcontainer')[0];
        if(tag.getAttribute('style')){
            let stringtoreplace=tag.getAttribute('style').replace(/width:\s*(\d+)(%?)(px)?;/i,'');//50
            tag.setAttribute('style',stringtoreplace);
        }
        tag=document.getElementsByClassName('main')[0];
        if(tag.getAttribute('style')){
            stringtoreplace=tag.getAttribute('style').replace(/width:\s*(\d+)(%?)(px)?;/i,'');
            tag.setAttribute('style',stringtoreplace);
        }
        tag=document.getElementsByClassName('sidebarcontainer')[0];
        if(tag.getAttribute('style')){
            stringtoreplace=tag.getAttribute('style').replace(/width:\s*(\d+)(%?)(px)?;/i,'');
            tag.setAttribute('style',stringtoreplace);
        }
        document.getElementById('notification').classList.remove('greenbutton');
        //for make lined menu bar in previous state
        let menu=document.getElementsByClassName('main-menu')[0];
        for(let line of menu.children){
            if(line.tagName.toLowerCase()=='sup')break;
            line.removeAttribute('style');
        }
    }else if(window.innerWidth>700){
        for(let line of document.getElementsByClassName('main-menu-line')){
            if(line.tagName.toLowerCase()=='sup')break;
            line.removeAttribute('style');
        }
        let tag=document.getElementsByClassName('profilebarcontainer')[0];
        let stringtoreplace=tag.getAttribute('style').replace(/width:\s*(\d+)(%?)(px)?;/i,'');
        tag.setAttribute('style',stringtoreplace);
        if( document.getElementById('notification').classList.contains('greenbutton')){
            document.getElementsByClassName('sidebarcontainer')[0].style.width='50%';
            tag.style.width="50%";
        }else{
            tag=document.getElementsByClassName('main')[0];
            stringtoreplace=tag.getAttribute('style').replace(/width:\s*(\d+)(%?)(px)?;/i,'');
            tag.setAttribute('style',stringtoreplace);
        }
    }else if(window.innerWidth<=700){
        if( document.getElementById('notification').classList.contains('greenbutton')){
            let menu=document.getElementsByClassName('main-menu')[0];
            menu.children[0].style.transform='rotate(-39deg)';
            menu.children[0].style.borderColor='rgb(231, 228, 228)';
            menu.children[1].style.opacity='0';
            menu.children[2].style.transform='rotate(39deg)';
            menu.children[2].style.borderColor='rgb(231, 228, 228)';

            document.getElementsByClassName('sidebarcontainer')[0].style.width='100%';
            document.getElementsByClassName('profilebarcontainer')[0].style.width='0';
        }
    }
}
function resizemenu_side(){
    let profile=document.getElementsByClassName('profilebarcontainer')[0];
    profile.style.height=window.innerHeight-document.getElementsByTagName('nav')[0].scrollHeight-(window.pageYOffset<=22?(22-window.pageYOffset):0)+'px';
    document.getElementById('profilenavbar').style.height=profile.offsetHeight-12+'px';
    let sidebar=document.getElementsByClassName('sidebarcontainer')[0];
    sidebar.style.height=profile.style.height;
    document.getElementById('sidebar').style.height=profile.offsetHeight-12+'px';
}
function backtoprofilbar(){
    document.getElementById('notification').classList.remove('greenbutton');
    let sidebar=document.getElementsByClassName('sidebarcontainer')[0];
    let stringtoreplace=sidebar.getAttribute('style').replace(/width:\s*100%;/i,'');
    sidebar.setAttribute('style',stringtoreplace);
    document.getElementsByClassName('profilebarcontainer')[0].style.width='100%';
}