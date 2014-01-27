App.IndexRoute = Ember.Route.extend({
    renderTemplate: function() {
      this.render();
      this.render('nav', { into: 'application', outlet: 'nav' });
      this.render('section_1', { into: 'application', outlet: 'section_1' });
      this.render('section_2', { into: 'application', outlet: 'section_2' });
      this.render('section_3', { into: 'application', outlet: 'section_3' });
      this.render('section_4', { into: 'application', outlet: 'section_4' });
      this.render('section_5', { into: 'application', outlet: 'section_5' });
      this.render('section_6', { into: 'application', outlet: 'section_6' });
      this.render('section_7', { into: 'application', outlet: 'section_7' });
      this.render('section_8', { into: 'application', outlet: 'section_8' });
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
  });