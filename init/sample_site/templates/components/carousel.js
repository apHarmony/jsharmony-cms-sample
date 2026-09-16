//Initialize Carousel in Page Preview / Editor
component.onRender = function(element, data, properties) {
  var carousel = new aphCarousel(XDom(element).getChildren('.cmptCarousel'));
}