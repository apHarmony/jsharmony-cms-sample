exports = module.exports = function(appConfig, installerParams, callback){
  require('jsharmony-factory/init/install.app.config.local.js')(appConfig, installerParams, function(err){
    if(err) return callback(err);

    appConfig.body += "\r\n";
    appConfig.body += "  //jsHarmony CMS Sample Site Configuration\r\n";
    appConfig.body += "  //config.app_settings.publish_preview_site_port = 8082;\r\n";

    return callback();
  });
}