/*jslint browser: true, jquery: true */ 
/*global App: true, require: false, Ember: false, module: false*/

// ===== Namespace =====


// ===== Router =====
App.Router.map(function() {
	this.resource('index', { path: '/' });
});

// ===== Routes =====

//require ('routes/index');

// ===== Store =====
App.Store = DS.Store.extend({
  revision: 13,
  adapter: DS.FixtureAdapter
});

// ===== Models =====

//require ('models/media');

// ===== Views =====

//require ('views/application');

// ===== Controllers =====


// ===== Template Helpers =====


// ===== Templates =====
// require ('templates/application');
// require ('templates/nav');
// require ('templates/section_1');
// require ('templates/section_2');
// require ('templates/section_3');
// require ('templates/section_4');
// require ('templates/section_5');
// require ('templates/section_6');
// require ('templates/section_7');
// require ('templates/section_8');
// require ('templates/footer');
