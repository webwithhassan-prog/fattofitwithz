
(function(){

  function initFTFDashboard(){

    var dashboard = document.getElementById('ftf-dashboard');

    if(!dashboard){
      return;
    }


    var sidebar = document.getElementById('ftf-sidebar');
    var overlay = document.getElementById('ftf-overlay');
    var menuButton = document.getElementById('ftf-menu-button');

    var navItems = dashboard.querySelectorAll('[data-page]');
    var pages = dashboard.querySelectorAll('[data-content]');
    var pageLinks = dashboard.querySelectorAll('[data-page-link]');


    function closeMobileMenu(){

      if(sidebar){
        sidebar.classList.remove('active');
      }

      if(overlay){
        overlay.classList.remove('active');
      }

    }


    function openMobileMenu(){

      if(sidebar){
        sidebar.classList.add('active');
      }

      if(overlay){
        overlay.classList.add('active');
      }

    }


    function showPage(pageName){

      if(!pageName){
        pageName = 'dashboard';
      }


      var pageExists = false;

      pages.forEach(function(page){

        var pageType = page.getAttribute('data-content');

        if(pageType === pageName){

          page.classList.add('active');

          pageExists = true;

        }else{

          page.classList.remove('active');

        }

      });


      if(!pageExists){

        pageName = 'dashboard';

        pages.forEach(function(page){

          if(page.getAttribute('data-content') === 'dashboard'){
            page.classList.add('active');
          }

        });

      }


      navItems.forEach(function(item){

        if(item.getAttribute('data-page') === pageName){

          item.classList.add('active');

        }else{

          item.classList.remove('active');

        }

      });


      closeMobileMenu();


      try{

        if(window.history && window.history.replaceState){

          window.history.replaceState(
            null,
            '',
            '#' + pageName
          );

        }

      }catch(error){}

    }


    navItems.forEach(function(item){

      item.addEventListener('click', function(event){

        var pageName = item.getAttribute('data-page');

        if(!pageName){
          return;
        }

        event.preventDefault();

        showPage(pageName);

      });

    });


    pageLinks.forEach(function(link){

      link.addEventListener('click', function(event){

        var pageName = link.getAttribute('data-page-link');

        if(!pageName){
          return;
        }

        event.preventDefault();

        showPage(pageName);

      });

    });


    if(menuButton){

      menuButton.addEventListener('click', function(){

        if(
          sidebar &&
          sidebar.classList.contains('active')
        ){

          closeMobileMenu();

        }else{

          openMobileMenu();

        }

      });

    }


    if(overlay){

      overlay.addEventListener('click', function(){

        closeMobileMenu();

      });

    }


    window.addEventListener('resize', function(){

      if(window.innerWidth > 750){

        closeMobileMenu();

      }

    });


    window.addEventListener('hashchange', function(){

      var hash = window.location.hash.replace('#','');

      if(hash){
        showPage(hash);
      }

    });


    var initialPage = window.location.hash.replace('#','');

    if(initialPage){

      showPage(initialPage);

    }else{

      showPage('dashboard');

    }

  }


  if(document.readyState === 'loading'){

    document.addEventListener(
      'DOMContentLoaded',
      initFTFDashboard
    );

  }else{

    initFTFDashboard();

  }

})();
