App.Media = DS.Model.extend({
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
];