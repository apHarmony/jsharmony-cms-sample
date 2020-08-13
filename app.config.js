var _ = require('lodash');
var async = require('async');
var path = require('path');
var fs = require('fs');
var https = require('https');
var sqliteDBDriver = require('jsharmony-db-sqlite');
var express = require('jsharmony/lib/express');
var Helper = require('jsharmony/Helper');

exports = module.exports = function(jsh, config, dbconfig){

  config.app_name = 'jsHarmony CMS'; //REQUIRED

  config.app_settings = _.extend(config.app_settings, {
    editor_site_port: 8082,
    publish_preview_site_port: 8083,
  });

  //Database Configuration
  dbconfig['default'] = { _driver: new sqliteDBDriver(), database: "data/db/project.db"};

  //Server Settings
  config.server.http_port = 8080;
  config.server.http_ip = '0.0.0.0';
  config.server.https_port = 8081;
  config.server.https_ip = '0.0.0.0';
  config.server.https_key = path.dirname(module.filename) + '/cert/localhost.key';
  config.server.https_cert = path.dirname(module.filename) + '/cert/localhost.crt';
  config.server.request_timeout = 60*60*1000;
  
  //jsHarmony Factory Configuration
  var configFactory = config.modules['jsHarmonyFactory'];
  configFactory.JobCheckDelay = 5000;

  //CMS Configuration
  var configCMS = config.modules['jsHarmonyCMS'];
  if(configCMS){
    configCMS.git.enabled = true;
    //On publish, copy files from wwwroot to publish folder
    configCMS.deployment_target_params.copy_folders.push(path.join(path.dirname(module.filename), '/wwwroot'));
    configCMS.defaultEditorConfig = {
      webSnippets: '/templates/websnippet/index.html',
      materialIcons: true
    };
  }

  /**************
  *** ON LOAD ***
  **************/
  config.onServerReady.push(function (cb, servers){
    async.waterfall([

      //Load Virtual Site as container for Editor - Needed because this test site is not deployed
      function(load_cb){
        if(config.app_settings.editor_site_port === false) return;
        var port = config.app_settings.editor_site_port;
        var https_options = {
          key: fs.readFileSync(config.server.https_key),
          cert: fs.readFileSync(config.server.https_cert),
          //ca: ....
        };
        
        var app = express();
        app.use(express.static('wwwroot'));
        app.get('/', function(req, res){ res.send('This is the editor virtual site.' + (jsh.Servers['default']?'  Please access the CMS at: <a href="'+Helper.escapeHTML(jsh.Servers['default'].getURL())+'">'+jsh.Servers['default'].getURL()+'</a>':'')); });
        var server = https.createServer(https_options, app);
        server.on('listening',function(){
          jsh.Log.info(`Editor site listening on https://localhost:${port}`);
          return load_cb();
        });
        server.listen(port, config.server.https_ip);
      },

      //Sample Test Site - Serves the published static files on port 8083
      function(load_cb){
        if(config.app_settings.publish_preview_site_port === false) return;
        var port = config.app_settings.publish_preview_site_port;
        var https_options = {
          key: fs.readFileSync(config.server.https_key),
          cert: fs.readFileSync(config.server.https_cert),
          //ca: ....
        };
        
        var app = express();
        app.use(express.static('data/publish'));
        app.get('/', function(req, res){ res.send('This is the publish preview site.  No index.html file found.' + (jsh.Servers['default']?'  Please publish from the CMS at: <a href="'+Helper.escapeHTML(jsh.Servers['default'].getURL())+'">'+jsh.Servers['default'].getURL()+'</a>':'')); });
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