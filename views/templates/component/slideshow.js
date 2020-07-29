component.onRender = function(element, data, properties) {
  var slideshow = new aphSlideshow($(element).children('.cmptSlideshow'), 4000, properties.animation);
}