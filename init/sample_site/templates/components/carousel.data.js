
jsh.App[modelid] = new (function() {

  //Initialize Carousel in Grid Listing
  this.onRenderGridRow = function(element, data, properties) {
    var carousel = new aphCarousel($(element));
  }

  //Initialize Carousel in Item Edit
  this.onRenderDataItemPreview = function(element, data, properties) {
    var carousel = new aphCarousel($(element));
  }

})();