$(document).ready(function(){
  //Click on overlay behind sidebar menu
  $('#content_block').click(function(){ xmore_click(); });
  
  //Initialize Slideshow Components
  $('.cmptSlideshow').each(function(){
    var animation = $(this).attr('data-animation');
    var slideshow = new aphSlideshow($(this), 4000, animation);
  });

  //Initialize Carousel Components
  $('.cmptCarousel').each(function(){
    var carousel = new aphCarousel($(this));
  });
});

//Hide Popup Menus when user clicks outside
$(document).click(function(e){
  if(e.target){
    if($(e.target).hasClass('nav_button_container')) return;
    if($(e.target).closest('.nav_button_container').length) return;
  }
});

function side_menu_click(obj){
  var jobj = $(obj);
  var menu_item_id = jobj.data('id');
  if(!menu_item_id) return true;
  var secondary_panel = $('#side_menu_'+menu_item_id);
  if(!secondary_panel.length) return true;
  secondary_panel.fadeIn();
  return false;
}

function side_menu_back(obj){
  var jpane = $(obj).closest('.side_menu_pane');
  //Clear all secondary panes
  if(!jpane.length){
    $('.side_menu_pane_secondary').fadeOut();
    return;
  }
  //Clear current pane
  jpane.fadeOut();
}

var side_menu_expanded = false;
var _SIDE_MENU_WIDTH = 250;
var menu_base_width = 0;
var menu_base_width_checks = 0;

$(document).ready(function(){ xupdate_layout(); });
$(window).resize(function(){ xupdate_layout(); });
window.setInterval(function(){ xupdate_layout(); }, 500);

var xupdate_layout_times = [];

function xupdate_layout(source){
  var wbody = $('body').width();
  $('#body_inner').width(wbody);

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
  if($('#body_wrapper').length){
    var wsidemenu = wbody - $('#body_wrapper').width();
    if(wsidemenu > _SIDE_MENU_WIDTH) wsidemenu = _SIDE_MENU_WIDTH; 
    if(wsidemenu>0){
      $('#body_wrapper').width(wbody - wsidemenu);
    }
  }

  //Get sum of menu item widths
  var old_menu_base_width = menu_base_width;
  if($('#xnav').is(':visible')){
    menu_base_width = 0;
    var num_items = 0;
    $('#xnav').children('.nav_button_container').each(function(){ num_items++; menu_base_width += $(this).outerWidth(); });
    menu_base_width += (num_items-1)*65;
    $('#xnav').css('max-width', menu_base_width + 'px');
    menu_base_width_checks++;
    if(old_menu_base_width != menu_base_width) menu_base_width_checks = 1;
  }

  //Switch to widehead (nav with text), if it will fit on the scren
  var widehead = false;
  var widehead_width = menu_base_width + 315;
  if(wbody > widehead_width){
    widehead = true;
  }

  $('body').toggleClass('widehead', widehead);

  if(widehead && $('#xnav').is(':visible') && (menu_base_width_checks < 2)){ xupdate_layout('second_pass'); }
}

function xmore_click(){
  var w = _SIDE_MENU_WIDTH;
  side_menu_expanded = true;
  if($('#side_menu_wrapper').width() > 0){
    $('#content_block').hide();
    w = 0;
  }
  else {
    $('#content_block').show();
  }
  $('#xmenu_solidbg').animate({'left':w+'px'});
  $('#body_wrapper').animate({'left':w+'px'}, { 
    step:function(cleft){ $('#body_wrapper').width($('body').width()-cleft); } ,
    done:function(){ if($('body').width()==$('#body_wrapper').width()) $('#body_wrapper').css('width','auto'); },
    queue: false
  });
  $('#xmenu').animate({'left':w+'px'});
  $('#side_menu_wrapper').animate({'width':w+'px'});
}

function xsidenav_more_click(obj){
  $(obj).closest('.xsidenav').find('.xsidenav_tree').toggleClass('expanded');
}
