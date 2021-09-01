(function(jsh){
  var $ = jsh.$;

  $(document).ready(function(){
    if(!$('.xtoplinks').is(':visible')) return;
    var demoMessage = $('<div class="demo_message">* Demo Site is Read-Only *</div>');
    demoMessage.css({
      backgroundColor: '#00ff00',
      position: 'absolute',
      top: '25px',
      right: '3px',
      zIndex: 9,
      padding: '1px 20px',
      opacity: 0.75,
      borderRadius: '15px',
      cursor: 'default',
    });
    demoMessage.appendTo('body');
  });

})(window.{req.jshsite.instance});