var XExt = jsh.XExt;

//Initialize Google Map in Page Preview / Editor
component.onRender = function(element, data, properties) {
  //Dynamically load Google Map in editor, so that it does not conflict with mce-offscreen-selection
  XDom(element).get('iframe').elements.forEach(function(obj){
    if(!obj.src && XDom.getAttribute(obj, 'data-src')){
      var component_id = XDom.getAttribute(XDom(obj).parent('[data-component-id]'), 'data-component-id');
      var url = XDom.getAttribute(obj, 'data-src');
      var a = XExt.getURLObj(url);
      var qs = XExt.parseGET(a.search) || {};
      a.search = '';
      var xdform = XDom(XDom.render.ejs('<form action="<#=a.href#>" style="visibility:hidden;position:absolute;top:0px;left:0px;width:1px;height:1px;overflow:hidden;" method="get" target="<#=component_id#>_iframe"><# for(var key in qs) { #><input name="<#=key#>" value="<#=qs[key]#>"/><# } #></form>', {a: a, component_id: component_id, qs: qs}));
      XDom('body').append(xdform);
      xdform.emit('submit');
      xdform.remove();
    }
  });
}