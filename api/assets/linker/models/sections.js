App.Sections = DS.Model.extend({
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
];