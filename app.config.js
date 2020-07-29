var _ = require('lodash');
var async = require('async');
var path = require('path');
var fs = require('fs');
var https = require('https');
var sqliteDBDriver = require('jsharmony-db-sqlite');
var express = require('jsharmony/lib/express');

exports = module.exports = function(jsh, config, dbconfig){

  config.app_name = 'jsHarmony CMS'; //REQUIRED

  config.app_settings = _.extend(config.app_settings, {
    virtual_site_port: 8082,
  });

  //Database Configuration
  dbconfig['default'] = { _driver: new sqliteDBDriver(), database: "data/db/project.db"};

  //Server Settings
  config.server.http_port = 8080;
  config.server.http_ip = '0.0.0.0';
  config.server.https_port = 8081;
  config.server.https_ip = '0.0.0.0';
  config.server.https_key = path.dirname(module.filename) + '/cert/localhost-key.pem';
  config.server.https_cert = path.dirname(module.filename) + '/cert/localhost-cert.pem';
  config.server.request_timeout = 60*60*1000;
  config.frontsalt = "A?Mrcpw*33*m-@{H.S4_Om#U<G1ud~|D)=<IpAx{u5EFIcj~qdzV(#yGAyJc";
  
  //jsHarmony Factory Configuration
  var configFactory = config.modules['jsHarmonyFactory'];

  configFactory.clientsalt = "5WsL7XrZq(RQVZx$3JlX+G_2-J>q7&|g@wk.LK6ieEMAUXt[fkecq>wU~qA[";
  configFactory.clientcookiesalt = "}CG{C&xKy]C.=c1eTR,HB=9noc6kjgHLUEWg5xfHb+t_x_Z%Vnv(B]2rJwLh";
  configFactory.mainsalt = "C4|Pz_qTo>PUPCcW^WTcQh{Q>&MuSw,5X{zDIig#GT&uKaxJ[qF(PH1t[ta)";
  configFactory.maincookiesalt = "GtzRV{5|(ud3c?J?BW5z9}w2PPfMnf]Nb._OUvAHgOd%%3&ry2yN8}CzM+y@";

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
        var port = config.app_settings.virtual_site_port;
        var https_options = {
          key: fs.readFileSync(config.server.https_key),
          cert: fs.readFileSync(config.server.https_cert),
          //ca: ....
        };
        
        var app = express();
        app.use(express.static('wwwroot'));
        var server = https.createServer(https_options, app);
        server.on('listening',function(){
          jsh.Log.info(`Virtual site listening on https://localhost:${port}`);
          return load_cb();
        });
        server.listen(port, config.server.https_ip);
      },

      //Sample Test Site - Serves the published static files on port 8083
      /*
      function(load_cb){
        var port = 8083;
        var https_options = {
          key: fs.readFileSync(config.server.https_key),
          cert: fs.readFileSync(config.server.https_cert),
          //ca: ....
        };
        
        var app = express();
        app.use(express.static('data/publish'));
        var server = https.createServer(https_options, app);
        server.on('listening',function(){
          jsh.Log.info(`Test site listening on https://localhost:${port}`);
          return load_cb();
        });
        server.listen(port, config.server.https_ip);
      },
      //*/
    ], cb);
  });
}