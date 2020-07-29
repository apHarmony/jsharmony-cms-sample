var jsHarmonyCMS = require('jsharmony-cms');
var HelperFS = require('jsharmony/HelperFS');
var async = require('async');
var path = require('path');
var _ = require('lodash');

var jsh = new jsHarmonyCMS.Application();
jsh.Config.appbasepath = process.cwd();
jsh.Config.silentStart = true;
jsh.Config.interactive = true;
jsh.Config.onConfigLoaded.push(function(cb){
  jsh.Config.system_settings.automatic_schema = false;
  return cb();
});
jsh.Init(function(){

  var dbid = 'default';
  var db = jsh.DB[dbid];

  var dbconfig = jsh.DBConfig[dbid];
  if(dbconfig.admin_user){
    dbconfig = _.extend({}, dbconfig);
    dbconfig.user = dbconfig.admin_user;
    dbconfig.password = dbconfig.admin_password;
  }

  async.waterfall([
    function(cb){ setTimeout(cb, 3000); },
    function(cb){
      console.log('Dropping CMS Database Objects');
      db.RunScripts(jsh, ['jsHarmonyCMS','drop'], { dbconfig: dbconfig }, function(err, rslt){
        if(err){ console.log('Error dropping CMS database objects'); console.log(err); return; }
        return cb();
      });
    },
    function(cb){
      console.log('Clearing Data Files');
      HelperFS.clearFiles(path.join(jsh.Config.datadir,'media'),0,0,cb);
    },
    function(cb){
      HelperFS.clearFiles(path.join(jsh.Config.datadir,'page'),0,0,cb);
    },
    function(cb){
      HelperFS.clearFiles(path.join(jsh.Config.datadir,'menu'),0,0,cb);
    },
    function(cb){
      HelperFS.clearFiles(path.join(jsh.Config.datadir,'sitemap'),0,0,cb);
    },
    function(cb){
      HelperFS.clearFiles(path.join(jsh.Config.datadir,'ecatalog_content'),0,0,cb);
    },
    function(cb){
      HelperFS.clearFiles(path.join(jsh.Config.datadir,'publish_log'),0,0,cb);
    },
    function(cb){
      console.log('Initializing CMS Database Objects');
      db.RunScripts(jsh, ['jsHarmonyCMS','init'], { dbconfig: dbconfig }, function(err, rslt){
        if(err){ console.log('Error initializing database'); console.log(err); return; }
        return cb();
      });
    },
    function(cb){
      console.log('Initializing CMS Triggers');
      db.RunScripts(jsh, ['jsHarmonyCMS','restructure'], { dbconfig: dbconfig }, function(err, rslt){
        if(err){ console.log('Error initializing database'); console.log(err); return; }
        return cb();
      });
    },
    function(cb){
      console.log('Initializing CMS Data');
      db.RunScripts(jsh, ['jsHarmonyCMS','init_data'], { dbconfig: dbconfig }, function(err, rslt){
        if(err){ console.log('Error initializing database'); console.log(err); return; }
        return cb();
      });
    },
    function(cb){
      db.RunScripts(jsh, ['application','sample_data'], { dbconfig: dbconfig }, function(err, rslt){
        if(err){ console.log('Error initializing database'); console.log(err); return; }
        return cb();
      });
    },
    function(cb){
      db.RunScripts(jsh, ['application','sample_data_post_processing'], { dbconfig: dbconfig, context: 'S1' }, function(err, rslt){
        if(err){ console.log('Error initializing database'); console.log(err); return; }
        return cb();
      });
    },
    function(cb){
      console.log('CMS Database Init Complete');
      db.Close();
      return cb();
    },
  ], function(err){
    if(err) console.log(err);
  });
});