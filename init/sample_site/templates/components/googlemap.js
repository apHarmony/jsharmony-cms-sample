var XExt = jsh.XExt;

//Initialize Google Map in Page Preview / Editor
component.onRender = function(element, data, properties) {
  //Dynamically load Google Map in editor, so that it does not conflict with mce-offscreen-selection
  $(element).find('iframe').each(function(){
    var jobj = $(this);
    if(!this.src && jobj.attr('data-src')){
      var component_id = $(this).closest('[data-component-id]').attr('data-component-id');
      var url = jobj.attr('data-src');
      var a = XExt.getURLObj(url);
      var qs = XExt.parseGET(a.search) || {};
      a.search = '';
      var jform = $('<form action="'+a.href+'" style="visibility:hidden;position:absolute;top:0px;left:0px;width:1px;height:1px;overflow:hidden;" method="get" target="'+component_id+'_iframe"></form>');
      for(var key in qs){
        var jinput = $('<input />');
        jinput.attr('name', key);
        jinput.attr('value', qs[key]);
        jform.append(jinput);
      }
      $('body').append(jform);
      jform.submit();
      jform.remove();
    }
  });
}