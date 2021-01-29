
jsh.App[modelid] = new (function() {

  this.onRenderDataItemPreview = function(element, data, properties) {
    var slideshow = new aphSlideshow($(element), 0);
  }

  this.onRenderGridRow = function(element, data, properties) {
    var slideshow = new aphSlideshow($(element), 0);
  }
})();