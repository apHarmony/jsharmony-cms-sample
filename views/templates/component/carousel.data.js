
jsh.App[modelid] = new (function() {

  this.onRenderDataItemPreview = function(element, data, properties) {
    var carousel = new aphCarousel($(element));
  }

  this.onRenderGridRow = function(element, data, properties) {
    var carousel = new aphCarousel($(element));
  }
})();