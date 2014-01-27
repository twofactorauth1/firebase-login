App.ApplicationView = Ember.View.extend({

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