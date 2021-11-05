(function(jsh){
  var $ = jsh.$;

  $(document).ready(function(){
    if(!$('.xtoplinks').is(':visible')) return;
    var demoMessage = $('<div class="demo_message">* Demo Site is Read-Only *</div>');
    demoMessage.appendTo('.xhead');
  });

})(window.{req.jshsite.instance});