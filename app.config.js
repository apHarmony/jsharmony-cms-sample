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
    editor_site_port: 8082,
    publish_preview_site_port: 8083,
    cms_base_url: 'https://localhost:8081',
    editor_site_base_url: 'https://localhost:8082',
  });
  
  jsh.Extensions.image = require('jsharmony-image-sharp');

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
    configCMS.deployment_target_publish_config.copy_folders.push(path.join(path.dirname(module.filename), '/wwwroot'));
    configCMS.defaultEditorConfig = {
      webSnippetsPath: '/templates/websnippets/index.html',
      materialIcons: true
    };
  }

  /**************
  *** ON LOAD ***
  **************/
  config.onServerReady.push(function (cb, servers){
    async.waterfall([

      //Set variables
      function(load_cb){
        configCMS.deployment_target_params.editor_site_base_url = config.app_settings.editor_site_base_url;
        return load_cb();
      },

      //Load Virtual Site as container for Editor - Needed because this test site is not deployed
      function(load_cb){
        if(config.app_settings.editor_site_port === false) return;
        var port = config.app_settings.editor_site_port;
        var https_options = {
          key: fs.readFileSync(config.server.https_key),
          cert: fs.readFileSync(config.server.https_cert),
        };
        if(config.server.https_ca) https_options.ca = fs.readFileSync(config.server.https_ca);
        
        var app = express();
        app.get('/templates/pages/:id.editor.html', function(req, res, next){
          var fpath = path.join(__dirname, 'wwwroot', 'templates', 'pages', req.params.id + '.editor.html');
          fs.exists(fpath, function(exists){
            if(!exists) return next();
            fs.readFile(fpath, 'utf8', function(err, rslt){
              if(err) return next();
              res.send(ejs.render(rslt, { cms_base_url: config.app_settings.cms_base_url }));
            });
          });
        });
        app.use(express.static('wwwroot'));
        app.get('/', function(req, res){
          var hostname = req.headers.host;
          if(hostname.indexOf(':')>=0) hostname = hostname.split(':')[0];
          res.send('This is the editor virtual site.' + (jsh.Servers['default']?'  Please access the CMS at: <a href="'+Helper.escapeHTML(jsh.Servers['default'].getURL(hostname))+'">'+jsh.Servers['default'].getURL(hostname)+'</a>':''));
        });
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
        };
        if(config.server.https_ca) https_options.ca = fs.readFileSync(config.server.https_ca);
        
        var app = express();

        //Handle SSI (Server-side include) via <!--#include virtual="..." -->
        app.get(/^\/(.*(\.html|\/))?$/, function(req, res, next){
          function getPage(page_url, parent_pages, cb){
            if(!page_url) page_url = 'index.html';
            if(page_url[page_url.length-1]=='/') page_url += 'index.html';
            if(_.includes(parent_pages, page_url)) return cb(null, new Error('Server-side include loop'));
            parent_pages.push(page_url);

            var base_path = path.join(__dirname,'data/publish');
            var page_fpath = path.join(base_path,page_url);

            page_fpath = path.normalize(page_fpath);
            if(page_fpath.indexOf(base_path+path.sep) !== 0) return next();

            fs.exists(page_fpath, function(exists){
              if(!exists) return cb(null, new Error('Page not found'));
              fs.readFile(page_fpath, 'utf8', function(err, rslt){
                if(err) return cb(null, err);
                var includes = rslt.split('<!--#include virtual="');
                async.eachOfSeries(includes, function(str, key, str_cb){
                  if(key==0) return str_cb();
                  var endTagIdx = str.indexOf('" -->');
                  if(endTagIdx<0) return str_cb(new Error('No #include terminator found'));
                  var include_url = str.substr(0, endTagIdx);
                  getPage(include_url, parent_pages, function(rslt, err){
                    if(err) return str_cb(err);
                    includes[key] = rslt + str.substr(endTagIdx + 5);
                    return str_cb();
                  });
                }, function(err){
                  if(err) return cb(null, err);
                  return cb(includes.join(''));
                });
              });
            });
          }
          
          getPage(req.params[0], [], function(rslt, err){
            if(err) return next();
            res.end(rslt);
          });
        }); 
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