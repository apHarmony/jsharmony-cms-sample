var jsHarmonyCMS = require('jsharmony-cms');

require('jsharmony/WebConnect').xlib.runNodeScript(require('path').join(__dirname, 'app.recreatedb.js'), {}, {}, function(err){
  var jsh = new jsHarmonyCMS.Application();
  jsh.Run();
});
