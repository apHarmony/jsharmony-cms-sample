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
function aphSlideshow(_xdobj, _duration, _effect){
  //xdobj: Container
  //duration: Amount of time between slide change, 0 for no slide change
  //effect: ZOOM, or <none>
  this.xdobj = _xdobj;
  this.slideDuration = _duration || 4000;
  this.effect = _effect;
  this.slideLastTime = new Date();
  this.curSlide = 0;
  this.lastSlide = 0;
  this.isChanging = false;
  this.animationFrame = null;
  this.timer = null;
  
  var _this = this;
  
  XDom.onPageLoad(function(){
    if(!_this.slideDuration) return;

    _this.animationFrame = XDom(XDom.render('<div style="left:0px;position:absolute;"></div>'));
    _this.xdobj.append(_this.animationFrame);

    var slides = _this.getSlides();
    if(slides.length > 1){
      _this.xdobj.getChildren('[data-slidebutton=prev]').on('click', function(e){ e.preventDefault(); e.stopImmediatePropagation(); e.stopPropagation(); _this.prevSlide(); });
      _this.xdobj.getChildren('[data-slidebutton=next]').on('click', function(e){ e.preventDefault(); e.stopImmediatePropagation(); e.stopPropagation(); _this.nextSlide(); });
      _this.xdobj.on('mouseenter', function(){ _this.xdobj.getChildren('[data-slidebutton]').animate.opacity(true, null, 100); });
      _this.xdobj.on('mouseleave', function(){ _this.xdobj.getChildren('[data-slidebutton]').animate.opacity(false, null, 100); });
      _this.animateStart(slides.filter('[data-slide="'+_this.curSlide+'"]'));
      _this.timer = window.setTimeout(function(){ _this.onTimer(); },1500);
    }
    else {
      _this.xdobj.getChildren('[data-slidebutton=next]').style.display = false;
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
  return this.xdobj.getChildren('[data-slide]').filter(XDom.isVisible);
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
  slides.stop();

  //Change the slide
  var xdnewSlide = slides.filter('[data-slide="'+newSlide+'"]');
  var xdoldSlide = slides.filter('[data-slide="'+this.curSlide+'"]');
  this.animateEnd(xdoldSlide);

  //Hide new slide
  xdnewSlide.style.set({ opacity:0, display:'block', zIndex: 3 });

  //Put old slide on top
  xdoldSlide.style.set({ opacity:1, display:'block', zIndex: 2 });

  xdnewSlide.animate({opacity: 1}, 1000, function(){ _this.isChanging = false; });
  slides.omit(xdnewSlide.elements).omit(xdoldSlide.elements).style.zIndex = 1;
  this.lastSlide = this.curSlide;
  this.curSlide = newSlide;
  this.animateStart(xdnewSlide);
}
aphSlideshow.prototype.animateStart = function(xdslide){
  if(this.effect=='ZOOM'){
    var animationDuration = this.slideDuration - 1000;
    if(animationDuration < 0) return;

    var xdbackground = xdslide.get('[data-slide-background]');
    var xdimage = xdslide.get('[data-slide-image]');

    var srcWidth = 0;
    var srcHeight = 0;

    function step(pct){
      //Get source image dimensions
      if(!srcWidth || !srcHeight){
        if(xdimage.length){
          srcWidth = xdimage.element.naturalWidth;
          srcHeight = xdimage.element.naturalHeight;
        }
      }
      if(srcWidth && srcHeight){
        //Determine whether background needs to be scaled
        var bgWidth = xdbackground.calc.width();
        var bgHeight = xdbackground.calc.height();
        if(bgWidth && bgHeight){
          var bgScale = Math.round((100 + pct*10) * 10000) / 10000;
          if((bgWidth / srcWidth) > (bgHeight / srcHeight)){
            //Width = Cropped
            xdbackground.style.backgroundSize = bgScale+'% auto';
          }
          else {
            //Height = Cropped
            xdbackground.stye.backgroundSize = 'auto '+bgScale+'%';
          }
        }
      }
      else xdbackground.style.backgroundSize = 'cover';
    }

    step(0);
    this.animationFrame.stop();
    this.animationFrame.style.left = '0px';
    setTimeout(function(){
      this.animationFrame.animate(function(obj, pct){
        XDom(obj).style.left = (100*pct) + 'px';
        step(pct);
      }, animationDuration);
    }, 500);
  }
}
aphSlideshow.prototype.animateEnd = function(xdslide){
  xdslide.stop();
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
function aphCarousel(_xdobj){
  this.xdobj = _xdobj;
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
  var ocontainer = this.xdobj.getChildren('[data-carouselwrapper]').element;
  if(!ocontainer) return;
  for(var i=0;i<ocontainer.childNodes.length;i++){
    var otile = ocontainer.childNodes[i];
    if(otile.nodeType != Node.ELEMENT_NODE){
      if ('remove' in Element.prototype) otile.remove();
      else ocontainer.removeChild(otile);
      i--;
    }
  }
  
  XDom.onPageLoad(function(){
    if(window['aphCarousel_onInit']) window.aphCarousel_onInit(_this.jobj);
    _this.render();
  });
  XDom(window).on('resize', function(){ _this.render(); });

  function getTouchPos(e){
    if(e.originalEvent && e.originalEvent.touches && e.originalEvent.touches.length) return [e.originalEvent.touches[0].pageX, e.originalEvent.touches[0].pageY];
    return null;
  }
  if(!XDom('body').class.contains('jsharmony_cms_editor')){
    this.xdobj.on('touchstart', function(e){ _this.ignoreNextClick = false; _this.onDragStart(getTouchPos(e)); });
    this.xdobj.on('touchmove', function(e){ if(_this.dragStart) _this.onDrag(getTouchPos(e)); });
    this.xdobj.on('touchend', function(e){ if(_this.dragStart) _this.onDragEnd(e); });

    this.xdobj.on('mousedown', function(e){ _this.ignoreNextClick = false; _this.onDragStart([e.pageX, e.pageY]); });
    this.xdobj.on('mousemove', function(e){
      if(!_this.dragStart) return;
      if(!e.buttons){ _this.onDragEnd(); }
      else _this.onDrag([e.pageX, e.pageY]); 
    });
    this.xdobj.on('mouseup', function(e){ if(_this.dragStart) _this.onDragEnd(e); });
    this.xdobj.get('[data-tile]').on('dragstart', function(e){ e.preventDefault(); });
    this.xdobj.on('click', function(e){ if(_this.ignoreNextClick) e.preventDefault();  });
  }
  this.xdobj.getChildren('[data-carouselbutton=prev]').on('click', function(e){ _this.prev(e) });
  this.xdobj.getChildren('[data-carouselbutton=next]').on('click', function(e){ _this.next(e) });
}
aphCarousel.prototype.updateTileWidth = function(xdtiles){
  var _this = this;
  var tilesPerRow = parseInt(XDom.getAttribute(_this.xdobj, 'data-tiles_per_row'));
  if(tilesPerRow){
    var cw = _this.xdobj.calc.widthToBorder();

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

    xdtiles.style.width = Math.round(w*100)/100+'px';
  }
}
aphCarousel.prototype.getTiles = function(){
  return this.xdobj.getChildren('[data-carouselwrapper]').getChildren('[data-tile]');
}
aphCarousel.prototype.onDragStart = function(pos){
  if(this.visibleTiles >= this.getTiles().length) return;
  if(this.xmouse_within(this.xdobj.getChildren('[data-carouselbutton=prev]'), pos[0], pos[1])) return;
  if(this.xmouse_within(this.xdobj.getChildren('[data-carouselbutton=next]'), pos[0], pos[1])) return;
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
  this.xdobj.getChildren('[data-carouselwrapper]').style.marginLeft = this.dragContainerOffset + dragDiff[0]+'px';
}
aphCarousel.prototype.onDragEnd = function(e){
  var _this = this;
  if(!_this.dragStart) return;
  var dragDiff = ([_this.dragPos[0]-_this.dragStart[0], _this.dragPos[1]-_this.dragStart[1]]);
  var numTiles = Math.ceil(Math.abs(parseFloat(dragDiff[0]) / _this.xdobj.get('[data-carouselwrapper]').children.first().calc.width()));
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
  var xdobj = XDom(elem);
  var offsetLeft = xdobj.calc.left();
  var offsetTop = xdobj.calc.top();
  var w = xdobj.calc.widthToBorder();
  var h = xdobj.calc.heightToBorder();
  if (x < offsetLeft) return false;
  if (x > (offsetLeft + w)) return false;
  if (y < offsetTop) return false;
  if (y > (offsetTop + h)) return false;
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

  var xdtiles = this.getTiles();
  this.updateTileWidth(xdtiles);

  var xdobj = this.xdobj;
  var leftTile = this.curLeftTile;
  var carouselWidth = xdobj.calc.widthToBorder();
  var _this = this;

  var startTime = new Date().getTime();
  var cntTiles = xdtiles.length;

  var prevArrow = xdobj.getChildren('[data-carouselbutton=prev]');
  var nextArrow = xdobj.getChildren('[data-carouselbutton=next]');
  
  if(!cntTiles){
    prevArrow.style.display = false;
    nextArrow.style.display = false;
    _this.visibleTiles = 0;
    return;
  }

  var ocontainer = xdobj.getChildren('[data-carouselwrapper]').element;
  var xdcontainer = XDom(ocontainer);

  var otiles = [];
  var contentWidth = 0;
  var tileWidths = [];
  for(var i=0;i<ocontainer.childNodes.length;i++){
    var otile = ocontainer.childNodes[i];
    if(otile.nodeType != Node.ELEMENT_NODE) continue;
    var idx = parseInt(otile.getAttribute('data-tile'));
    otiles[idx] = otile;
    tileWidths[idx] = XDom(otile).calc.widthToBorder();
    contentWidth += tileWidths[idx];
  }

  var showArrows = (contentWidth > carouselWidth);
  prevArrow.animate.display(showArrows);
  nextArrow.animate.display(showArrows);

  var leftPad = (showArrows ? parseInt(prevArrow.style.calc.minWidth) : 0);
  var rightPad = (showArrows ? parseInt(nextArrow.style.calc.minWidth) : 0);

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
    XDom(otile).class.add('visible');
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
    if(options.drag !== false) XDom(otile).class.add('visible');
    else XDom(otile).class.remove('visible');
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
      xdcontainer.style.marginLeft = 0+'px';
      XDom(otiles[tgtFadeAnimation]).style.opacity = 1;
      XDom(otiles[tgtNewAnimation]).style.opacity = 0;
    }
    else {
      var curLeft = parseInt(xdcontainer.style.calc.marginLeft);
      if(canDragBack) xdcontainer.style.marginLeft = curLeft  + pxRemoved+'px';
    }
    numAnimations++;
    xdcontainer.animate({ 'margin-left': -1 * tileWidths[tgtFadeAnimation]+'px' }, animationSpeed, onAnimationsDone);
  }
  else if(options.direction == -1){
    if(!options.keepOffset){
      xdcontainer.style.marginLeft = -1 * tileWidths[tgtNewAnimation]+'px';
      XDom(otiles[tgtFadeAnimation]).style.opacity = 1;
      XDom(otiles[tgtNewAnimation]).style.opacity = 0;
    }
    else {
      var curLeft = parseInt(xdcontainer.style.calc.marginLeft);
      if(!canDragBack) xdcontainer.style.marginLeft = curLeft  - 1 * tileWidths[otiles.length - 1]+'px';
    }
    numAnimations++;
    xdcontainer.animate({ 'margin-left': 0 +'px'}, animationSpeed, onAnimationsDone);
  }
  else if(options.drag !== false){
    var dragStartPos = canDragBack ? -1 * tileWidths[otiles.length - 1] : 0;
    _this.dragContainerOffset = dragStartPos;
    xdcontainer.style.marginLeft = dragStartPos + options.drag+'px';
  }
  else if(!options.direction){
    xdcontainer.style.marginLeft = 0+'px';
  }
  if(options.direction){
    var xdotiles_isvis = XDom(otiles).filter('.visible');
    xdotiles_isvis.animate({'opacity': 1}, animationSpeed, onAnimationsDone);
    xdotiles_isvis.elements.forEach(function(){ numAnimations++; });
    var xdotiles_novis = XDom(otiles).omit('.visible');
    xdotiles_novis.animate({'opacity': 0}, animationSpeed, onAnimationsDone);
    xdotiles_novis.elements.forEach(function(){ numAnimations++; });
  }
  else {
    XDom(otiles).filter('.visible').style.opacity = 1;
    XDom(otiles).omit('.visible').style.opacity = 0;
  }
  if(options.direction){
    _this.inAnimation = true;
  }

  var newPad = Math.floor(remaining/2);
  xdobj.style.paddingLeft = leftPad+newPad+'px';
  prevArrow.style.width = leftPad+newPad+'px';
  nextArrow.style.width = rightPad+newPad+'px';

  var imgHeight = XDom(otiles[0]).get('[data-carouselimage]').calc.height();
  if(imgHeight) xdobj.getChildren('[data-carouselbutton]').style.height = imgHeight+'px';
  else {
    var xdimg = XDom(otiles[0]).get('[data-carouselimage]');
    if(xdimg.length){
      xdimg.off('load.IMG');
      xdimg.on('load.IMG', function(){ _this.render(); });
    }
  }

  var endTime = new Date().getTime();
}
aphCarousel.prototype.stopAnimation = function(){
  var xdobj = this.xdobj;
  xdobj.getChildren('[data-carouselwrapper]').stop();
  xdobj.getChildren('[data-carouselwrapper]').getChildren('[data-tile]').stop();
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