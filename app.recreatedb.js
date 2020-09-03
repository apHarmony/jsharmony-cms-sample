var jsHarmonyCMS = require('jsharmony-cms');
var HelperFS = require('jsharmony/HelperFS');
var async = require('async');
var path = require('path');
var _ = require('lodash');
var fs = require('fs');

//return; //Uncomment to prevent recreating database

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
  var config = jsh.Config;

  var dbconfig = jsh.DBConfig[dbid];
  if(dbconfig.admin_user){
    dbconfig = _.extend({}, dbconfig);
    dbconfig.user = dbconfig.admin_user;
    dbconfig.password = dbconfig.admin_password;
  }

  var rnd_pass = '';
  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for(var i=0;i<16;i++) rnd_pass += chars.charAt(Math.floor(Math.random()*chars.length));

  var admindbconfig = _.extend({}, dbconfig);
  var sqlFuncs  = [];
  sqlFuncs['INIT_DB'] = dbconfig.database;
  sqlFuncs['INIT_DB_LCASE'] = dbconfig.database.toLowerCase();
  sqlFuncs['INIT_DB_USER'] = dbconfig.user;
  sqlFuncs['INIT_DB_PASS'] = dbconfig.password;
  sqlFuncs['INIT_DB_HASH_MAIN'] = config.modules['jsHarmonyFactory'].mainsalt;
  sqlFuncs['INIT_DB_HASH_CLIENT'] = config.modules['jsHarmonyFactory'].clientsalt;
  sqlFuncs['INIT_DB_ADMIN_EMAIL'] = 'admin@jsharmony.com';
  sqlFuncs['INIT_DB_ADMIN_PASS'] = rnd_pass;
  sqlFuncs['DB'] = dbconfig.database;
  sqlFuncs['DB_LCASE'] = dbconfig.database.toLowerCase();

  async.waterfall([
    function(cb){
      console.log('Clearing data files and database, if they exist');
      var dbFile = path.join(jsh.Config.datadir,'db','project.db');
      if(fs.existsSync(dbFile)) fs.unlinkSync(dbFile);
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
      console.log('Creating new database...');
      jsh.DB['default'].RunScripts(jsh, ['*','init','core','create'], { dbconfig: admindbconfig, sqlFuncs: sqlFuncs }, function(err, rslt){
        if(err){ console.log('Error creating database'); console.log(err); return; }
        //Set database to target now that it has been created
        admindbconfig.database = dbconfig.database;
        return cb();
      });
    },
    function(cb){
      jsh.DB['default'].Close(function(){
        console.log('Initializing database...');
        return cb();
      });
    },
    function(cb){
      jsh.DB['default'].RunScripts(jsh, ['*','init','core','init'], { dbconfig: admindbconfig, sqlFuncs: sqlFuncs }, function(err, rslt){
        if(err){ console.log('Error creating database'); console.log(err); return; }
        console.log('Restructuring database...');
        return cb();
      });
    },
    function(cb){
      jsh.DB['default'].RunScripts(jsh, ['*','restructure','core'], { dbconfig: admindbconfig, sqlFuncs: sqlFuncs }, function(err, rslt){
        if(err){ console.log('Error restructuring database'); console.log(err); return; }
        console.log('Initializing data...');
        return cb();
      });
    },
    function(cb){
      jsh.DB['default'].RunScripts(jsh, ['*','init_data','core'], { dbconfig: admindbconfig, sqlFuncs: sqlFuncs }, function(err, rslt){
        if(err){ console.log('Error initializing data'); console.log(err); return; }
        return cb();
      });
    },
    function(cb){
      console.log('Initializing CMS Database Objects');
      jsh.DB['default'].RunScripts(jsh, ['jsHarmonyCMS','init'], { dbconfig: admindbconfig, sqlFuncs: sqlFuncs }, function(err, rslt){
        if(err){ return cb(new Error('Error initializing database')); }
        return cb();
      });
    },
    function(cb){
      console.log('Initializing CMS Triggers');
      jsh.DB['default'].RunScripts(jsh, ['jsHarmonyCMS','restructure'], { dbconfig: admindbconfig, sqlFuncs: sqlFuncs }, function(err, rslt){
        if(err){ return cb(new Error('Error initializing database')); }
        return cb();
      });
    },
    function(cb){
      console.log('Initializing CMS Data');
      jsh.DB['default'].RunScripts(jsh, ['jsHarmonyCMS','init_data'], { dbconfig: admindbconfig, sqlFuncs: sqlFuncs }, function(err, rslt){
        if(err){ return cb(new Error('Error initializing database')); }
        return cb();
      });
    },
    function(cb){
      jsh.DB['default'].RunScripts(jsh, ['application','sample_data'], { dbconfig: admindbconfig, sqlFuncs: sqlFuncs }, function(err, rslt){
        if(err){ return cb(new Error('Error initializing database')); }
        return cb();
      });
    },
    function(cb){
      jsh.DB['default'].RunScripts(jsh, ['application','demo','data'], { dbconfig: admindbconfig, sqlFuncs: sqlFuncs }, function(err, rslt){
        if(err){ return cb(new Error('Error initializing database')); }
        return cb();
      });
    },
    function(cb){
      jsh.DB['default'].RunScripts(jsh, ['application','sample_data_post_processing'], { dbconfig: admindbconfig, sqlFuncs: sqlFuncs, context: 'S2' }, function(err, rslt){
        if(err){ return cb(new Error('Error initializing database')); }
        return cb();
      });
    },
    function(cb){
      jsh.DB['default'].RunScripts(jsh, ['application','demo','deployment'], { dbconfig: admindbconfig, sqlFuncs: sqlFuncs, context: 'S2' }, function(err, rslt){
        if(err){ return cb(new Error('Error initializing database')); }
        return cb();
      });
    },
  ], function(err){
    if(err) console.log(err);
    process.exit(0);
  });
});