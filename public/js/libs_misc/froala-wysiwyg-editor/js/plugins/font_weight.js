! function(a) {
    "function" == typeof define && define.amd ? define(["jquery"], a) : "object" == typeof module && module.exports ? module.exports = function(b, c) {
        return void 0 === c && (c = "undefined" != typeof window ? require("jquery") : require("jquery")(b)), a(c), c
    } : a(jQuery)
}(function(a) {
    "use strict";
    a.FroalaEditor.DefineIcon('fontWeight', {NAME: 'text-width'});
    a.FroalaEditor.RegisterCommand('fontWeight', {
      title: 'Font Weight',
      type: 'dropdown',
      focus: false,
      undo: true,
      refreshAfterCallback: true,
      options: {
            "200":"Light",
            "400":"Normal",
            "700":"Bold",
      },
      callback: function (cmd, val) {
          var nearestAnchor = $(this.selection.element().closest('a'));
          var selection = $(this.selection.element());
          if(nearestAnchor.hasClass('ssb-theme-btn-active-element')) {
              if(selection.is('span')){
                  selection.removeAttr('class');
                  selection.attr('class', 'fontWeight_'+val);

              }else if(selection.parent('span').hasClass() &&  selection.parent('span').attr('class').indexOf('fontWeight_') > -1){
                  selection.parent('span').removeAttr('class');
                  selection.parent('span').attr('class', 'fontWeight_'+val);
              }else {
                  this.format.apply('span', {
                      class:'fontWeight_'+val
                  });
              }
          }else {
              $("span.custom-span [class*='fontWeight_']").removeAttr('class'); 
              if(selection.is('span') && $(selection[0], "span[class*='fontWeight_']")) {
                  $(selection[0], "span[class*='fontWeight_']").removeAttr('class');
                  selection.attr('class', 'fontWeight_'+val); 
                  this.format.apply('span', {
                      class:'fontWeight_'+val
                  });
              }else if (this.format.is('span', {class: 'fontWeight_' + val})) {
                  this.format.remove('span', {
                      class: 'fontWeight_' + val
                  });
              }else {
                  this.format.apply('span', {
                      class: 'fontWeight_' + val
                  });
              }
              $("span.custom-span").removeClass("custom-span");
          }
      },
      // Callback on refresh.
      refresh: function ($btn) {
        //console.log ('do refresh');
      },
      // Callback on dropdown show.
      refreshOnShow: function ($btn, $dropdown) {
       // console.log ('do refresh when show');
      }
    });

});
