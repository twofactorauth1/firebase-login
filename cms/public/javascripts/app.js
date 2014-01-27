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
}