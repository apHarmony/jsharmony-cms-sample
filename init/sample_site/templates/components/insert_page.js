//Initialize "Insert Page" component in Page Preview / Editor
component.onRender = function(element, data, properties, cms, component) {
  var container = $(element).find('.cmptInsertPage').first();
  if(data && data.item) this.insertPage(container, data.item.page);
}

//Load Page from Server and inject into Page Preview / Editor
component.insertPage = function(jcontainer, pageUrl){
  if(!pageUrl) return;
  if(!cms.App.externalPageCache) cms.App.externalPageCache = {};
  XExt.execif(!(pageUrl in cms.App.externalPageCache),
    function(f){ //Load Page Content from Server
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
    function(){ //Inject Page Content into Preview
      jcontainer.html(cms.App.externalPageCache[pageUrl]+'<div style="clear:both;"></div>');
    }
  );
}