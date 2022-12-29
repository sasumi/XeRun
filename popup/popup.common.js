(() => {
    let navs = document.querySelectorAll('.nav a ');
    let currentPath = document.location.pathname;
    navs.forEach(nav =>{
        if(nav.href.indexOf(currentPath)>=0){
            nav.parentNode.classList.add('active');
        }
    });
    document.querySelector('.logo a').href = document.location.href;
})();