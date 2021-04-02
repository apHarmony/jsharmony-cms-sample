jsh.App[modelid] = new (function() {

  //Render Inserted Page Content in Item Edit
  this.onRenderDataItemPreview = function(element, data, properties, cms, component) {
    var container = $(element).find('.cmptInsertPage').first();
    if(data && data.item) component.insertPage(container, data.item.page);
  }
})();