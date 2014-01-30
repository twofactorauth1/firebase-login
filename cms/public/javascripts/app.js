// Application bootstrapper
App = Ember.Application.createWithMixins(Bootstrap.Register);

Ember.RSVP.configure('onerror', function(e) {
  console.log(e.message); 
  console.log(e.stack);
});

function ev(emberId){
  return Ember.View.views['ember' + emberId];
}
function ec(emberId){
  return ev(emberId).get('controller');
};/*jslint browser: true, jquery: true */ 
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
;App.Media = DS.Model.extend({
  url: DS.attr( 'string' ),
  caption: DS.attr( 'string' )
});

App.Media.FIXTURES = [
  { id: 1, url: 'img/pics-001.jpg', caption: 'Caption one' },
  { id: 2, url: 'img/pics-002.jpg', caption: 'Caption two' },
  { id: 3, url: 'img/pics-003.jpg', caption: 'Caption three' },
  { id: 4, url: 'img/pics-004.jpg', caption: 'Caption four' },
  { id: 5, url: 'img/pics-005.jpg', caption: 'Caption five' },
  { id: 6, url: 'img/pics-006.jpg', caption: 'Caption one' },
];;App.Sections = DS.Model.extend({
  img: DS.attr( 'string' ),
  linkTo: DS.attr( 'string' ),
  title: DS.attr( 'string' ),
  content: DS.attr( 'string' )
});

App.Sections.FIXTURES = [
  { id: 1, type: 'hero-left', img: 'img/top_bg.jpg', title: 'Introducing Indigenous', linkTo: '', content: '<p>Indigenous is a fully integrated business management platform for independent service professionals and small businesses.</p>' },
  { id: 2, type: 'img-right', img: 'img/feature_right.png', title: 'Another feature', linkTo: '', content: '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean dictum at metus sed molestie. Proin auctor facilisis diam sit amet eleifend. Quisque venenatis tellus in nisl lacinia pellentesque. Vivamus consequat ac quam eget fusce consectetur.</p>' },
  { id: 3, type: 'img-left', img: 'img/graph.png', title: 'Another feature', linkTo: '', content: '<ul class="list-wide"><li class="editable"><i class="fa fa-check-circle"></i> Morbi consectetur quam quis nulla tempor malesuada</li><li class="editable"><i class="fa fa-check-circle"></i> Suspendisse lacinia tellus nec eleifend blandit</li><li class="editable"><i class="fa fa-check-circle"></i> Donec dapibus aliquet enim sit amet porttitor</li><li class="editable"><i class="fa fa-check-circle"></i> Proin auctor facilisis diam sit amet eleifend</li></ul>' },
  { id: 4, type: 'triple', img: '', title: '', linkTo: '', content: '' },
  { id: 5, type: 'hero-right', img: '', title: '', linkTo: '', content: '' },
  { id: 6, type: 'img-left', img: '', title: '', linkTo: '', content: '' },
  { id: 6, type: 'gallery', img: '', title: '', linkTo: '', content: '' },
  { id: 6, type: 'form', img: '', title: '', linkTo: '', content: '' },
  { id: 6, type: 'text', img: '', title: '', linkTo: '', content: '' },
  { id: 6, type: 'text', img: '', title: '', linkTo: '', content: '' },
];;App.IndexRoute = Ember.Route.extend({
    renderTemplate: function() {
      this.render();
      this.render('nav', { into: 'application', outlet: 'nav' });
      this.render('section_1', { into: 'application', outlet: 'section_1' });
      //this.render('section_2', { into: 'application', outlet: 'section_2' });
      //this.render('section_3', { into: 'application', outlet: 'section_3' });
      //this.render('section_4', { into: 'application', outlet: 'section_4' });
      this.render('section_5', { into: 'application', outlet: 'section_5' });
      //this.render('section_6', { into: 'application', outlet: 'section_6' });
      this.render('section_7', { into: 'application', outlet: 'section_7' });
      //this.render('section_8', { into: 'application', outlet: 'section_8' });
      this.render('footer', { into: 'application', outlet: 'footer' });

    },
    events: {
        goToLink: function(item, anchor) {
        var target = this.hash;
        $target = $(anchor);
        $('html, body').stop().animate({
          'scrollTop': $target.offset().top
        }, 900, 'swing');
        }
    },
    model: function() {
      return this.store.findAll('media');
    }
  });;App.ApplicationView = Ember.View.extend({

    didInsertElement: function() {
      Ember.run.scheduleOnce('afterRender', this, this.afterRenderEvent);
    },
    afterRenderEvent : function(){

        $('.editable').redactor({
            air: true,
            focus: true,
            //plugins: ['fontsize', 'fontcolor' , 'fontfamily','textdirection', 'emoticons', 'awesome'],
            airButtons: ['formatting', '|', 'bold', 'italic', 'deleted', '|', 'unorderedlist', 'orderedlist', 'outdent', 'indent'],
            'emoticons' : {
                viewType: 'modal',
                items: [{
                    'name': 'Happy',
                    'src' : 'img/face-smile.png',
                    'shortcode' : ':)'
                },
                {
                    'name': 'Sad',
                    'src' : 'img/face-sad.png',
                    'shortcode' : ':('
                }],
                button: {
                  addBefore: 'bold',
                  separatorBefore: true,
                  separatorAfter: true,
                }
            },
            changeCallback: function(html) {
                console.log(html);
            },
        });

        var scrollPos, vid;
        $(window).scroll(function() {
            scrollPos = $(window).scrollTop();
            if (scrollPos >= 5 && !$('.navbar').hasClass('fixed')) {
                $('.navbar').addClass('fixed');
            } else if (scrollPos <= 5 && $('.navbar').hasClass('fixed')) {
                $('.navbar').removeClass('fixed');
            }
        });
    }
});