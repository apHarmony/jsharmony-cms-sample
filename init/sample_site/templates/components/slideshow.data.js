
jsh.App[modelid] = new (function() {

  //Initialize Slideshow in Grid Listing
  this.onRenderGridRow = function(element, data, properties) {
    var slideshow = new aphSlideshow($(element), 0);
  }

  //Initialize Slideshow in Item Edit
  this.onRenderDataItemPreview = function(element, data, properties) {
    var slideshow = new aphSlideshow($(element), 0);
  }

})();