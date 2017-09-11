! function(a) {
    "function" == typeof define && define.amd ? define(["jquery"], a) : "object" == typeof module && module.exports ? module.exports = function(b, c) {
        return void 0 === c && (c = "undefined" != typeof window ? require("jquery") : require("jquery")(b)), a(c), c
    } : a(jQuery)
}(function(a) {
    "use strict";
    var widthOptions = {};
    for(var op=1; op<=10; op++){
        widthOptions[op] = op;
    }
    a.FroalaEditor.DefineIcon('tableBorderWidth', {NAME: 'minus'});
    a.FroalaEditor.RegisterCommand('tableBorderWidth', {
      title: 'Border Width',
      type: 'dropdown',
      focus: false,
      undo: true,
      refreshAfterCallback: true,
      options: widthOptions,
      callback: function (cmd, val) {
        var tableCells = this.$el.find('.fr-selected-cell').closest('table').find("td");
        var tableHeaders = this.$el.find('.fr-selected-cell').closest('table').find("th");
        tableCells.css("border-width", val + "px");
        tableHeaders.css("border-width", val + "px");
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
