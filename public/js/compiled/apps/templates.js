define(['handlebars'], function(Handlebars) {

this["hbs"] = this["hbs"] || {};
this["hbs"]["apps"] = this["hbs"]["apps"] || {};
this["hbs"]["apps"]["apps"] = this["hbs"]["apps"]["apps"] || {};
this["hbs"]["apps"]["apps"]["apps-template"] = this["hbs"]["apps"]["apps"]["apps-template"] || {};

this["hbs"] = this["hbs"] || {};
this["hbs"]["apps"] = this["hbs"]["apps"] || {};
this["hbs"]["apps"]["myApp"] = this["hbs"]["apps"]["myApp"] || {};
this["hbs"]["apps"]["myApp"]["myapps"] = this["hbs"]["apps"]["myApp"]["myapps"] || {};
this["hbs"]["apps"]["myApp"]["myapps"]["my-app-template"] = this["hbs"]["apps"]["myApp"]["myapps"]["my-app-template"] || {};

this["hbs"]["apps"]["apps"]["apps-template"]["hbs"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "\n    This is my apps template\n";
  });

this["hbs"]["apps"]["myApp"]["myapps"]["my-app-template"]["hbs"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "\n    My App Template\n";
  });

return this["hbs"]["apps"]["myApp"]["myapps"]["my-app-template"];

});