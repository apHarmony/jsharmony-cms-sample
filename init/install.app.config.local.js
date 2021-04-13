exports = module.exports = function(appConfig, installerParams, callback){
  if(!appConfig.params.jsharmony) appConfig.params.jsharmony = {};
  appConfig.params.jsharmony.https_cert = "path.dirname(module.filename) + '/cert/localhost.crt'";
  appConfig.params.jsharmony.https_key = "path.dirname(module.filename) + '/cert/localhost.key'";
  require('jsharmony-cms/init/install.app.config.local.js')(appConfig, installerParams, function(err){
    if(err) return callback(err);

    appConfig.body += "\r\n";
    appConfig.body += "  //jsHarmony CMS Sample Site Configuration\r\n";

    appConfig.body += "  //Publish Preview Server - Used to view site published to local folder\r\n";
    appConfig.body += "  //config.app_settings.publish_preview_site_port = 8082;\r\n";

    return callback();
  });
}