XDom.onPageLoad(function(){
  //Click on overlay behind sidebar menu
  XDom('#content_block').on('click', function(){ xmore_click(); });
  
  //Initialize Slideshow Components
  XDom('.cmptSlideshow').for(function(xdobj){
    var animation = XDom.getAttribute(xdobj, 'data-animation');
    var slideshow = new aphSlideshow(xdobj, 4000, animation);
  });

  //Initialize Carousel Components
  XDom('.cmptCarousel').for(function(xdobj){
    var carousel = new aphCarousel(xdobj);
  });
});

document.addEventListener('click', function(e){
  if(e && e.target && e.target.hasAttribute && e.target.hasAttribute('href')){
    var href = (e.target.getAttribute('href')||'').toString();
    if(href && (href[0]=='#')){
      window.location.hash = '#';
      window.location.hash = href;
      e.preventDefault();
    }
  }
}, false);

//Hide Popup Menus when user clicks outside
XDom(document).on('click', function(e){
  if(e.target){
    var xdtarget = XDom(e.target);
    if(xdtarget.class.contains('nav_button_container')) return;
    if(xdtarget.parent('.nav_button_container').length) return;
  }
});

function side_menu_click(obj){
  var xdobj = XDom(obj);
  var menu_item_id = xdobj.data.id;
  if(!menu_item_id) return true;
  var secondary_panel = XDom('#side_menu_'+menu_item_id);
  if(!secondary_panel.length) return true;
  secondary_panel.animate.opacity(true);
  return false;
}

function side_menu_back(obj){
  var xdpane = XDom(obj).parent('.side_menu_pane');
  //Clear all secondary panes
  if(!xdpane.length){
    XDom('.side_menu_pane_secondary').animate.opacity(false);
    return;
  }
  //Clear current pane
  xdpane.animate.opacity(false);
}

var side_menu_expanded = false;
var _SIDE_MENU_WIDTH = 250;
var menu_base_width = 0;
var menu_base_width_checks = 0;

XDom.onPageLoad(function(){ xupdate_layout(); });
XDom(window).on('resize', function(){ xupdate_layout(); });
window.setInterval(function(){ xupdate_layout(); }, 500);

var xupdate_layout_times = [];

function xupdate_layout(source){
  var xdBody = XDom('body'); 
  var wbody = xdBody.calc.width();
  XDom('#body_inner').style.width = wbody;

  var curtime = new Date().getTime();
  xupdate_layout_times.push(curtime);
  if(xupdate_layout_times.length > 10){
    xupdate_layout_times.shift();
    //Debounce more than 10 refreshes per second for second_pass
    if((curtime - xupdate_layout_times[0]) < 1000){
      if(source=='second_pass') return;
    }
  }

  //Resize body wrapper
  var xdBodyWrapper = XDom('#body_wrapper');
  if(xdBodyWrapper.length){
    var wsidemenu = wbody - xdBodyWrapper.calc.width();
    if(wsidemenu > _SIDE_MENU_WIDTH) wsidemenu = _SIDE_MENU_WIDTH; 
    if(wsidemenu>0){
      xdBodyWrapper.style.width = wbody - wsidemenu;
    }
  }

  //Get sum of menu item widths
  var old_menu_base_width = menu_base_width;
  var xdXNav = XDom('#xnav');
  if(xdXNav.isVisible()){
    menu_base_width = 0;
    var num_items = 0;
    xdXNav.getChildren('.nav_button_container').for(function(xdobj){ num_items++; menu_base_width += xdobj.calc.widthToBorder(); });
    menu_base_width += (num_items-1)*65;
    xdXNav.style.maxWidth = menu_base_width + 'px';
    menu_base_width_checks++;
    if(old_menu_base_width != menu_base_width) menu_base_width_checks = 1;
  }

  //Switch to widehead (nav with text), if it will fit on the scren
  var widehead = false;
  var widehead_width = menu_base_width + 315;
  if(wbody > widehead_width){
    widehead = true;
  }

  if(widehead) xdBody.class.add('widehead');
  else xdBody.class.remove('widehead');

  if(widehead && xdXNav.isVisible() && (menu_base_width_checks < 2)){ xupdate_layout('second_pass'); }
}

function xmore_click(){
  var w = _SIDE_MENU_WIDTH;
  side_menu_expanded = true;
  var xdSideMenuWrapper = XDom('#side_menu_wrapper');
  var xdContentBlock = XDom('#content_block');
  if(xdSideMenuWrapper.calc.width() > 0){
    xdContentBlock.style.display = false;
    w = 0;
  }
  else {
    xdContentBlock.style.display = true;
  }
  XDom('#xmenu_solidbg').animate({'left':w+'px'});
  var xdbody = XDom('body');
  var xdbodywrapper = XDom('#body_wrapper');
  var initLeft = xdbodywrapper.calc.left();
  xdbodywrapper.animate(function(obj, pct){
    var curleft = initLeft+((w - initLeft)*pct);
    var xdobj = XDom(obj);
    xdobj.style.left = curleft+'px';
    xdobj.style.width = xdbody.calc.width()-curleft;
  }, 500, function(){ 
    if(XDom('body').calc.width()==XDom('#body_wrapper').calc.width()) XDom('#body_wrapper').style.width = 'auto'; 
  });
  XDom('#xmenu').animate({'left':w+'px'});
  xdSideMenuWrapper.animate({'width':w+'px'});
}

function xsidenav_more_click(obj){
  var xdSideNavTree = XDom(obj).parent('.xsidenav').get('.xsidenav_tree').animate.class('expanded');
}
