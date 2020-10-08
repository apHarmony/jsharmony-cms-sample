component.onRender = function(element, data, properties, cms, component) {
  var container = $(element).find('.cmptInsertPage').first();
  if(data && data.item) this.insertPage(container, data.item.page);
}
component.insertPage = function(jcontainer, pageUrl){
  if(!pageUrl) return;
  if(!cms.App.externalPageCache) cms.App.externalPageCache = {};
  XExt.execif(!(pageUrl in cms.App.externalPageCache),
    function(f){
      var errorTemplate = '<div style="background-color:red;color:white;font-weight:bold;padding:20px;text-align:center;">*** ERROR LOADING INSERTED PAGE *** %%%ERRMSG%%%</div>';;
      jsh.XForm.RequestSync(pageUrl,{},
        function(rslt){ //onComplete
          if(rslt && rslt.page && rslt.page.content){
            cms.App.externalPageCache[pageUrl] = (rslt.page.content.body || '');
            return f();
          }
          cms.App.externalPageCache[pageUrl] = XExt.ReplaceAll(errorTemplate, '%%%ERRMSG%%%', 'PAGE BODY NOT RETURNED');
          return f();
        },
        function(err){ //onFail
          var errmsg = '';
          if(!err){}
          else if(err.statusText) errmsg = err.statusText;
          else if(err.Message) errmsg = err.Message;
          else errmsg = err.toString();
          cms.App.externalPageCache[pageUrl] = XExt.ReplaceAll(errorTemplate, '%%%ERRMSG%%%', XExt.escapeHTML(errmsg));
          f();
          return true;
        }
      );
    },
    function(){
      //this.id = jsharmony_cms_component_2
      //1. Synchronous Get Request to data.item.page
      //2. Parse JSON, get page.content.body
      //3. Inject page.content.body into jcontent
      //4. Add caching for synchronous requests - clear after save
      jcontainer.html(cms.App.externalPageCache[pageUrl]+'<div style="clear:both;"></div>');
    }
  );
}