$(document).ready(function() {
  
  $("body").addClass("js");
  
  $("a.scrollto").click(function(e) {
    e.preventDefault();
    var el = $($(this).attr("href"));
    
    $('html, body').animate({
      scrollTop: el.offset().top - 72
    }, 1000);
  });
  
  $("#select-options a").click(function(e) {
    $("#select-options li").removeClass("active");
    $(this).parent().addClass("active");
    $("body").attr("class", "");
    $("body").addClass("fus-" + $(this).attr("href").substring(1));
  });
  
  $(window).scroll(function () {

  		if ($(this).scrollTop() > 695) {
  		  $(".navbar").addClass("fus-navbar-solid");
  		} else {
  			$(".navbar").removeClass("fus-navbar-solid");
  		}

  });
  
  $(".fus-tabs li").hover(function(){
      $(this).addClass("border-active");
  },function(){
      $(this).removeClass("border-active");
  });
  
  $(window).resize(function(){
      updateTabsBorder();
  });
  function updateTabsBorder(){
     var menu_height = $('.fus-tabs').height();
     var menu_top = $('.fus-tabs').css("top");
     var margin_left = $('.container').css("margin-left");
     var margin_right = $('.container').css("margin-right");
     var width = $('.ng-scope').width() - 25;
     $('.border').css("top", menu_top);
     $('.border').css("width", width);
     $('.border').css("margin-left", "-" + margin_left);
     $('.border').css("margin-right", "-" + margin_right);
      
  }
  updateTabsBorder();
});

