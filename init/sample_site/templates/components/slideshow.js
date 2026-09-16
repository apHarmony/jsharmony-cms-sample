//Initialize Slideshow in Page Preview / Editor
component.onRender = function(element, data, properties) {
  var slideshow = new aphSlideshow(XDom(element).getChildren('.cmptSlideshow'), 4000, properties.animation);
}