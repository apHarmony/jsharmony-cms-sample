/*
Copyright 2020 apHarmony

This file is part of jsHarmony CMS.

jsHarmony CMS is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

jsHarmony CMS is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with this package.  If not, see <http://www.gnu.org/licenses/>.
*/

/****************/
/* aphSlideshow */
/****************/
function aphSlideshow(_jobj, _duration, _effect){
  //jobj: Container
  //duration: Amount of time between slide change, 0 for no slide change
  //effect: ZOOM, or <none>
  this.jobj = _jobj;
  this.slideDuration = _duration || 4000;
  this.effect = _effect;
  this.slideLastTime = new Date();
  this.curSlide = 0;
  this.lastSlide = 0;
  this.isChanging = false;
  this.animationFrame = null;
  this.timer = null;
  
  var _this = this;
  
  $(document).ready(function(){
    if(!_this.slideDuration) return;

    _this.animationFrame = $('<div style="left:0px;position:absolute;"></div>');
    _this.jobj.append(_this.animationFrame);

    var slides = _this.getSlides();
    if(slides.length > 1){
      _this.jobj.children('[data-slidebutton=prev]').click(function(e){ e.preventDefault(); e.stopImmediatePropagation(); e.stopPropagation(); _this.prevSlide(); });
      _this.jobj.children('[data-slidebutton=next]').click(function(e){ e.preventDefault(); e.stopImmediatePropagation(); e.stopPropagation(); _this.nextSlide(); });
      _this.jobj.hover(function(){ _this.jobj.children('[data-slidebutton]').fadeIn(100); },function(){ _this.jobj.children('[data-slidebutton]').fadeOut(100); });
      _this.animateStart(slides.filter('[data-slide='+_this.curSlide+']'));
      _this.timer = window.setTimeout(function(){ _this.onTimer(); },1500);
    }
    else {
      _this.jobj.children('[data-slidebutton=next]').hide();
    }
  });
}
aphSlideshow.prototype.destroy = function(){
  window.clearTimeout(this.timer);
}
aphSlideshow.prototype.onTimer = function(){
  var _this = this;
  _this.timerSlide();
  _this.timer = window.setTimeout(function(){ _this.onTimer(); }, 500);
}
aphSlideshow.prototype.getSlides = function(){
  return this.jobj.children('[data-slide]:visible');
}
aphSlideshow.prototype.escapeHTML = function (val) {
  var entityMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': '&quot;',
    "'": '&#39;',
    "/": '&#x2F;',
    '\u00A0':'&#xa0;'
  };
  
  return String(val).replace(/[\u00A0&<>"'\/]/g, function (s) {
    return entityMap[s];
  });
}
aphSlideshow.prototype.timerSlide = function(){
  var curTime = new Date();
  if((curTime.getTime() - this.slideLastTime.getTime()) > this.slideDuration){
    this.nextSlide();
  }
};
aphSlideshow.prototype.changeSlide = function(newSlide){
  var _this = this;
  var slides = this.getSlides();
  this.slideLastTime = new Date();
  this.isChanging = true;
  
  //Stop any animation
  slides.stop(true);

  //Change the slide
  var jnewSlide = slides.filter('[data-slide='+newSlide+']');
  var joldSlide = slides.filter('[data-slide='+this.curSlide+']');
  this.animateEnd(joldSlide);

  //Hide new slide
  jnewSlide.css({ opacity:0, display:'block','z-index': 3 });

  //Put old slide on top
  joldSlide.css({ opacity:1, display:'block','z-index': 2 });

  jnewSlide.animate({opacity: 1}, 1000, function(){ _this.isChanging = false; });
  slides.not(jnewSlide).not(joldSlide).css('z-index', 1);
  this.lastSlide = this.curSlide;
  this.curSlide = newSlide;
  this.animateStart(jnewSlide);
}
aphSlideshow.prototype.animateStart = function(jslide){
  if(this.effect=='ZOOM'){
    var animationDuration = this.slideDuration - 1000;
    if(animationDuration < 0) return;

    var jbackground = jslide.find('[data-slide-background]');
    var jimage = jslide.find('[data-slide-image]');

    var srcWidth = 0;
    var srcHeight = 0;

    function step(pct){
      //Get source image dimensions
      if(!srcWidth || !srcHeight){
        if(jimage.length){
          srcWidth = jimage[0].naturalWidth;
          srcHeight = jimage[0].naturalHeight;
        }
      }
      if(srcWidth && srcHeight){
        //Determine whether background needs to be scaled
        var bgWidth = jbackground.width();
        var bgHeight = jbackground.height();
        if(bgWidth && bgHeight){
          var bgScale = Math.round((100 + pct*10) * 10000) / 10000;
          if((bgWidth / srcWidth) > (bgHeight / srcHeight)){
            //Width = Cropped
            jbackground.css('background-size',bgScale+'% auto');
          }
          else {
            //Height = Cropped
            jbackground.css('background-size','auto '+bgScale+'%');
          }
        }
      }
      else jbackground.css('background-size', 'cover')
    }

    step(0);
    this.animationFrame.stop(true);
    this.animationFrame.css({ 'left': '0px' });
    this.animationFrame.delay(500).animate({ 'left':'100px' },{ 
      duration: animationDuration, step: function(val){
        var pct = val / 100;
        step(pct);
      }
    });
  }
}
aphSlideshow.prototype.animateEnd = function(jslide){
  jslide.stop(true);
}
aphSlideshow.prototype.nextSlide = function(){
  if(this.isChanging) return;
  var slides = this.getSlides();
  if(!slides.length){ this.destroy(); return; }
  var nextSlide = this.curSlide + 1;
  if(nextSlide >= slides.length) nextSlide = 0;
  this.changeSlide(nextSlide);
}
aphSlideshow.prototype.prevSlide = function(){
  if(this.isChanging) return;
  var slides = this.getSlides();
  if(!slides.length){ this.destroy(); return; }
  var nextSlide = this.curSlide - 1;
  if(nextSlide < 0) nextSlide = slides.length - 1;
  this.changeSlide(nextSlide);
}


/***************/
/* aphCarousel */
/***************/
function aphCarousel(_jobj){
  this.jobj = _jobj;
  this.curLeftTile = 0;
  this.inAnimation = false;
  this.animationSpeed = 1000;
  this.animationDirection = 0;
  this.visibleTiles = 0;
  this.ignoreNextClick = false;

  this.dragStart = null;
  this.dragPos = null;
  this.dragStartTime = null;
  this.dragContainerOffset = null;
  
  var _this = this;

  //Clean up text nodes from carousel
  var ocontainer = this.jobj.children('[data-carouselwrapper]')[0];
  if(!ocontainer) return;
  for(var i=0;i<ocontainer.childNodes.length;i++){
    var otile = ocontainer.childNodes[i];
    if(otile.nodeType != Node.ELEMENT_NODE){
      if ('remove' in Element.prototype) otile.remove();
      else ocontainer.removeChild(otile);
      i--;
    }
  }
  
  $(document).ready(function(){
    if(window['aphCarousel_onInit']) window.aphCarousel_onInit(_this.jobj);
    _this.render();
  });
  $(window).resize(function(){ _this.render(); });

  function getTouchPos(e){
    if(e.originalEvent && e.originalEvent.touches && e.originalEvent.touches.length) return [e.originalEvent.touches[0].pageX, e.originalEvent.touches[0].pageY];
    return null;
  }
  if(!$('body').hasClass('jsharmony_cms_editor')){
    this.jobj.on('touchstart', function(e){ _this.ignoreNextClick = false; _this.onDragStart(getTouchPos(e)); });
    this.jobj.on('touchmove', function(e){ if(_this.dragStart) _this.onDrag(getTouchPos(e)); });
    this.jobj.on('touchend', function(e){ if(_this.dragStart) _this.onDragEnd(e); });

    this.jobj.on('mousedown', function(e){ _this.ignoreNextClick = false; _this.onDragStart([e.pageX, e.pageY]); });
    this.jobj.on('mousemove', function(e){
      if(!_this.dragStart) return;
      if(!e.buttons){ _this.onDragEnd(); }
      else _this.onDrag([e.pageX, e.pageY]); 
    });
    this.jobj.on('mouseup', function(e){ if(_this.dragStart) _this.onDragEnd(e); });
    this.jobj.find('[data-tile]').on('dragstart', function(e){ e.preventDefault(); });
    this.jobj.on('click', function(e){ if(_this.ignoreNextClick) e.preventDefault();  });
  }
  this.jobj.children('[data-carouselbutton=prev]').on('click', function(e){ _this.prev(e) });
  this.jobj.children('[data-carouselbutton=next]').on('click', function(e){ _this.next(e) });
}
aphCarousel.prototype.updateTileWidth = function(jtiles){
  var _this = this;
  var tilesPerRow = parseInt(_this.jobj.attr('data-tiles_per_row'));
  if(tilesPerRow){
    var cw = _this.jobj.outerWidth();

    var orgTilesPerRow = tilesPerRow;
    if(cw <= 1037){
      if(orgTilesPerRow==4) tilesPerRow = 2;
      if(orgTilesPerRow==6) tilesPerRow = 3;
      if(orgTilesPerRow==8) tilesPerRow = 4;
    }
    if(cw <= 687){
      if(orgTilesPerRow==2) tilesPerRow = 1;
      if(orgTilesPerRow==3) tilesPerRow = 1;
      if(orgTilesPerRow==4) tilesPerRow = 1;
    }
    if(cw <= 633){
      if(orgTilesPerRow==6) tilesPerRow = 1;
      if(orgTilesPerRow==8) tilesPerRow = 2;
    }
    
    var w = 0;
    if(tilesPerRow==1) w = (cw - 122);
    else if(tilesPerRow==2) w = (cw - 122) / 2;
    else if(tilesPerRow==3) w = (cw - 122) / 3;
    else if(tilesPerRow==4) w = (cw - 122) / 4;
    else if(tilesPerRow==6) w = (cw - 122) / 6;
    else if(tilesPerRow==8) w = (cw - 122) / 8;

    jtiles.css('width',Math.round(w*100)/100+'px');
  }
}
aphCarousel.prototype.getTiles = function(){
  return this.jobj.children('[data-carouselwrapper]').children('[data-tile]');
}
aphCarousel.prototype.onDragStart = function(pos){
  if(this.visibleTiles >= this.getTiles().length) return;
  if(this.xmouse_within(this.jobj.children('[data-carouselbutton=prev]'), pos[0], pos[1])) return;
  if(this.xmouse_within(this.jobj.children('[data-carouselbutton=next]'), pos[0], pos[1])) return;
  var _this = this;
  _this.dragStart = pos;
  _this.dragPos = pos;
  _this.dragStartTime = new Date().getTime();
  if(!pos) return;
}
aphCarousel.prototype.onDrag = function(pos){

  var _this = this;
  if(!_this.dragStart) return;
  _this.dragPos = pos;
  var dragDiff = ([_this.dragPos[0]-_this.dragStart[0], _this.dragPos[1]-_this.dragStart[1]]);

  if(_this.inAnimation){ _this.stopAnimation(); }
  if(_this.dragContainerOffset === null){
    _this.render({ drag: pos[0] });
  }
  this.jobj.children('[data-carouselwrapper]').css('margin-left', this.dragContainerOffset + dragDiff[0]);
}
aphCarousel.prototype.onDragEnd = function(e){
  var _this = this;
  if(!_this.dragStart) return;
  var dragDiff = ([_this.dragPos[0]-_this.dragStart[0], _this.dragPos[1]-_this.dragStart[1]]);
  var numTiles = Math.ceil(Math.abs(parseFloat(dragDiff[0]) / _this.jobj.find('[data-carouselwrapper]').children().first().width()));
  if(dragDiff[0] < -20){  _this.ignoreNextClick = true; _this.next(null, { keepOffset: dragDiff[0], num: numTiles }); }
  else if(dragDiff[0] > 20){  _this.ignoreNextClick = true; _this.prev(null, { keepOffset: dragDiff[0], num: numTiles }); }
  else{ _this.ignoreNextClick = false; _this.render(); }
  var endTime = new Date().getTime();
  if((endTime - _this.dragStartTime) > 500) _this.ignoreNextClick = true;

  _this.dragPos = null;
  _this.dragStart = null;
  _this.dragStartTime = null;
  _this.dragContainerOffset = null;

}
aphCarousel.prototype.xmouse_within = function(elem, mouseX, mouseY) {
  return this.xpoint_within(elem, mouseX, mouseY);
}

aphCarousel.prototype.xpoint_within = function(elem, x, y) {
  var jobj = $(elem);
  var joff = jobj.offset();
  var w = jobj.outerWidth(false);
  var h = jobj.outerHeight(false);
  if (x < joff.left) return false;
  if (x > (joff.left + w)) return false;
  if (y < joff.top) return false;
  if (y > (joff.top + h)) return false;
  return true;
}
aphCarousel.prototype.escapeHTML = function (val) {
  var entityMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': '&quot;',
    "'": '&#39;',
    "/": '&#x2F;',
    '\u00A0':'&#xa0;'
  };
  
  return String(val).replace(/[\u00A0&<>"'\/]/g, function (s) {
    return entityMap[s];
  });
}
aphCarousel.prototype.render = function(options){
  if(!options) options = {};
  if(!('direction' in options)) options.direction = false;
  if(!('drag' in options)) options.drag = false;
  if(!('keepOffset' in options)) options.keepOffset = false;

  var jtiles = this.getTiles();
  this.updateTileWidth(jtiles);

  var jobj = this.jobj;
  var leftTile = this.curLeftTile;
  var carouselWidth = jobj.outerWidth();
  var _this = this;

  var startTime = new Date().getTime();
  var cntTiles = jtiles.length;

  var prevArrow = jobj.children('[data-carouselbutton=prev]');
  var nextArrow = jobj.children('[data-carouselbutton=next]');
  
  if(!cntTiles){
    prevArrow.hide();
    nextArrow.hide();
    _this.visibleTiles = 0;
    return;
  }

  var ocontainer = jobj.children('[data-carouselwrapper]')[0];
  var jcontainer = $(ocontainer);

  var otiles = [];
  var contentWidth = 0;
  var tileWidths = [];
  for(var i=0;i<ocontainer.childNodes.length;i++){
    var otile = ocontainer.childNodes[i];
    if(otile.nodeType != Node.ELEMENT_NODE) continue;
    var idx = parseInt(otile.getAttribute('data-tile'));
    otiles[idx] = otile;
    tileWidths[idx] = $(otile).outerWidth();
    contentWidth += tileWidths[idx];
  }

  var showArrows = (contentWidth > carouselWidth);
  prevArrow.toggle(showArrows);
  nextArrow.toggle(showArrows);

  var leftPad = (showArrows ? parseInt(prevArrow.css('min-width')) : 0);
  var rightPad = (showArrows ? parseInt(nextArrow.css('min-width')) : 0);

  //Set leftTile to front
  var i = 0;
  var tgtTile = leftTile;
  var canDragBack = (cntTiles >= (_this.visibleTiles + 2));
  if((options.direction==1) || ((options.drag !== false) && canDragBack)){
    tgtTile = leftTile - 1;
    if(tgtTile < 0) tgtTile = cntTiles - 1;
  }
  var pxRemoved = 0;
  while(true){
    var otile = ocontainer.childNodes[0];
    var curTile = parseInt(otile.getAttribute('data-tile'));
    if(curTile==tgtTile) break;
    ocontainer.insertBefore(otile, null);
    pxRemoved += tileWidths[curTile];
    i++;
    if(i >= cntTiles) break;
  }

  //Sort tiles by leftTile
  for(var i=0; i<leftTile; i++){
    if(i >= cntTiles) break;
    otiles.push(otiles.shift());
  }

  this.stopAnimation();

  //Order items based on carousel
  var remaining = carouselWidth - leftPad - rightPad;
  var idx = 0;
  _this.visibleTiles = 0;
  for(idx=0;idx<otiles.length;idx++){
    var otile = otiles[idx];
    var curw = tileWidths[idx];
    if((idx > 0) && ((remaining - curw) < 0)) break;
    remaining -= curw;
    _this.visibleTiles++;
    $(otile).addClass('visible');
  }

  var animationSpeed = this.animationSpeed;
  if(options.keepOffset){
    var factor = Math.abs((tileWidths[0] - Math.abs(options.keepOffset||0)) / tileWidths[0]);
    if(factor > 1) factor = 1;
    else if(!factor) factor = 1;
    animationSpeed = Math.round(animationSpeed * factor);
  }

  var tgtFadeAnimation = -1, tgtNewAnimation = -1;
  if(options.direction == 1){ tgtFadeAnimation = otiles.length - 1; tgtNewAnimation = _this.visibleTiles - 1; }
  if(options.direction == -1){ tgtFadeAnimation = _this.visibleTiles; tgtNewAnimation = 0; }
  for(;idx<otiles.length;idx++){
    var otile = otiles[idx];
    if(options.drag !== false) $(otile).addClass('visible');
    else $(otile).removeClass('visible');
  }
  var numAnimations = 0;
  var numAnimationsDone = 0;
  function onAnimationsDone(){
    numAnimationsDone++;
    if(numAnimations == numAnimationsDone){
      _this.render();
      _this.inAnimation = false;
    }
  }
  if(options.direction == 1){
    if(!options.keepOffset){
      jcontainer.css('margin-left', 0);
      $(otiles[tgtFadeAnimation]).css('opacity', 1);
      $(otiles[tgtNewAnimation]).css('opacity', 0);
    }
    else {
      var curLeft = parseInt(jcontainer.css('margin-left'));
      if(canDragBack) jcontainer.css('margin-left', curLeft  + pxRemoved);
    }
    numAnimations++;
    jcontainer.animate({ 'margin-left': -1 * tileWidths[tgtFadeAnimation] }, animationSpeed, onAnimationsDone);
  }
  else if(options.direction == -1){
    if(!options.keepOffset){
      jcontainer.css('margin-left', -1 * tileWidths[tgtNewAnimation]);
      $(otiles[tgtFadeAnimation]).css('opacity', 1);
      $(otiles[tgtNewAnimation]).css('opacity', 0);
    }
    else {
      var curLeft = parseInt(jcontainer.css('margin-left'));
      if(!canDragBack) jcontainer.css('margin-left', curLeft  - 1 * tileWidths[otiles.length - 1]);
    }
    numAnimations++;
    jcontainer.animate({ 'margin-left': 0 }, animationSpeed, onAnimationsDone);
  }
  else if(options.drag !== false){
    var dragStartPos = canDragBack ? -1 * tileWidths[otiles.length - 1] : 0;
    _this.dragContainerOffset = dragStartPos;
    jcontainer.css('margin-left', dragStartPos + options.drag);
  }
  else if(!options.direction){
    jcontainer.css('margin-left', 0);
  }
  if(options.direction){
    $(otiles).filter('.visible').animate({'opacity': 1}, animationSpeed, onAnimationsDone).each(function(){ numAnimations++; });
    $(otiles).not('.visible').animate({'opacity': 0}, animationSpeed, onAnimationsDone).each(function(){ numAnimations++; });
  }
  else {
    $(otiles).filter('.visible').css({'opacity': 1});
    $(otiles).not('.visible').css({'opacity': 0});
  }
  if(options.direction){
    _this.inAnimation = true;
  }

  var newPad = Math.floor(remaining/2);
  jobj.css('padding-left', leftPad+newPad+'px');
  prevArrow.css('width',leftPad+newPad+'px');
  nextArrow.css('width',rightPad+newPad+'px');

  var imgHeight = $(otiles[0]).find('[data-carouselimage]').height();
  if(imgHeight) jobj.children('[data-carouselbutton]').css('height',imgHeight+'px');
  else {
    var jimg = $(otiles[0]).find('[data-carouselimage]');
    if(jimg.length){
      jimg.off('load.aphCarousel').on('load.aphCarousel', function(){ _this.render(); });
    }
  }

  var endTime = new Date().getTime();
}
aphCarousel.prototype.stopAnimation = function(){
  var jobj = this.jobj;
  jobj.children('[data-carouselwrapper]').stop(true);
  jobj.children('[data-carouselwrapper]').children('[data-tile]').stop(true);
  this.inAnimation = false;
}
aphCarousel.prototype.normalizeIndex = function(num){
  var cntTiles = this.getTiles().length;
  while(num < 0) num += cntTiles;
  while(num >= cntTiles) num -= cntTiles;
  return num;
}
aphCarousel.prototype.next = function(e, options){
  if(!options) options = { keepOffset: false, num: 1 };
  if(!('num' in options)) options.num = 1;
  if(e){
    e.preventDefault();
    e.stopPropagation();
  }
  if(this.inAnimation) return;
  var newLeftTile = this.normalizeIndex(this.curLeftTile + options.num);
  this.curLeftTile = newLeftTile;
  this.render({ direction: 1, keepOffset: options.keepOffset });
}
aphCarousel.prototype.prev = function(e, options){
  if(!options) options = { keepOffset: false, num: 1 };
  options.num = 1;
  if(e){
    e.preventDefault();
    e.stopPropagation();
  }
  if(this.inAnimation) return;
  var newLeftTile = this.normalizeIndex(this.curLeftTile - options.num);
  this.curLeftTile = newLeftTile;
  this.render({ direction: -1, keepOffset: options.keepOffset });
}