var _ = require('lodash');
var async = require('async');
var path = require('path');
var fs = require('fs');
var https = require('https');
var express = require('jsharmony/lib/express');
var Helper = require('jsharmony/Helper');
var ejs = require('jsharmony/lib/ejs');

exports = module.exports = function(jsh, config, dbconfig){

  config.app_name = 'jsHarmony CMS'; //REQUIRED

  config.app_settings = _.extend(config.app_settings, {
    publish_preview_site_port: 8082,
  });
  
  jsh.Extensions.image = require('jsharmony-image-sharp');

  //Default Server Settings (Can be changed in app.config.local.js)
  config.server.http_port = 8080;  //Default HTTP Port
  config.server.http_ip = '0.0.0.0';
  config.server.https_port = 8081;  //Default HTTPS Port
  config.server.https_ip = '0.0.0.0';
  config.server.request_timeout = 60*60*1000;
  
  //jsHarmony Factory Configuration
  var configFactory = config.modules['jsHarmonyFactory'];
  configFactory.JobCheckDelay = 5000;

  //CMS Configuration
  var configCMS = config.modules['jsHarmonyCMS'];
  if(configCMS){
    configCMS.preview_server.enabled = true;
    configCMS.preview_server.serverPort = 8082;
    configCMS.git.enabled = true;
  }

  /**************
  *** ON LOAD ***
  **************/
  config.onServerReady.push(function (cb, servers){
    async.waterfall([

      //Sample Test Site - Serves the published static files on port 8083
      function(load_cb){
        if(config.app_settings.publish_preview_site_port === false) return;
        var port = config.app_settings.publish_preview_site_port;
        var https_options = {
          key: fs.readFileSync(config.server.https_key),
          cert: fs.readFileSync(config.server.https_cert),
        };
        if(config.server.https_ca) https_options.ca = fs.readFileSync(config.server.https_ca);
        
        var app = express();
        app.use(express.static('data/publish'));
        app.get('/', function(req, res){
          var hostname = req.headers.host;
          if(hostname.indexOf(':')>=0) hostname = hostname.split(':')[0];
          res.send('This is the publish preview site.  No index.html file found.' + (jsh.Servers['default']?'  Please publish from the CMS at: <a href="'+Helper.escapeHTML(jsh.Servers['default'].getURL(hostname))+'">'+jsh.Servers['default'].getURL(hostname)+'</a>':''));
        });
        var server = https.createServer(https_options, app);
        server.on('listening',function(){
          jsh.Log.info(`Publish preview site listening on https://localhost:${port}`);
          return load_cb();
        });
        server.listen(port, config.server.https_ip);
      },
    ], cb);
  });
}