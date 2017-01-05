// Add Copyright


// Conditionally load jQuery, invoke sb_init
//  src: https://css-tricks.com/snippets/jquery/load-jquery-only-if-not-present/

if (typeof jQuery == 'undefined') {
  function getScript(url, success) {
    var script = document.createElement('script');
    script.src = url;

    var head = document.getElementsByTagName('head')[0],
    done = false;

    script.onload = script.onreadystatechange = function() {
      if (!done && (!this.readyState || this.readyState == 'loaded' || this.readyState == 'complete')) {
        done = true;
        success();
        script.onload = script.onreadystatechange = null;
        head.removeChild(script);
      };
    };

    head.appendChild(script);
  };

  getScript('https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js', function() {
    if (typeof jQuery=='undefined') {
      // No-op. No share bar.
    } else {
      sb_init();
    }
  });

// jQuery already Loaded - run
} else {
  sb_init();
};


function sb_init() {
  var cssLink, where;
  var encodedLocation = encodeURIComponent(window.location.href);
  var ogTitle = $('meta[property="og:title"]').attr('content')
  //var ogImage = $('meta[property="og:image"]').attr('content')
  //var ogDescription = $('meta[property="og:description"]').attr('content')
  var encodedTitle;

  // OG if avail, title if not, default otherwise
  if (typeof ogTitle !== "undefined") {
    encodedTitle = encodeURIComponent(ogTitle);
  } else if ($('title').is(':empty')) {
    encodedTitle = encodeURIComponent($('title'));
  } else {
    encodedTitle = encodeURIComponent('This page has no title');
  }

  // Insert LIs - Facebook, Twitter, LinkedIn, Pinterest, G+, Mail.
  var facebookLink  = 'https://www.facebook.com/sharer/sharer.php';
      facebookLink += '?u=' + encodedLocation;

  var twitterLink  = 'http://twitter.com/intent/tweet?';
      twitterLink += 'original_referer=' + encodedLocation + '&amp;';
      twitterLink += 'ref_src=twsrc%5Etfw&amp;';
      twitterLink += 'text=' + encodedTitle + '&amp;';
      twitterLink += 'tw_p=tweetbutton&amp;';
      twitterLink += 'url=' + encodedLocation + '&amp';
      twitterLink += 'via=indigenous';

  var linkedInLink  = 'https://www.linkedin.com/shareArticle?mini=true&amp;';
      linkedInLink += 'url=' + encodedLocation + '&amp';
      linkedInLink += 'title=' + encodedTitle;

  var pinterestLink  = 'http://pinterest.com/pin/create/button/?';
      pinterestLink += 'url=' + encodedLocation + '&amp';
      pinterestLink += 'is_video=false&amp;';
      pinterestLink += 'description=' + encodedTitle;

  var googleLink  = 'https://plus.google.com/share?';
      googleLink += 'url=' + encodedLocation;

  var mailLink  = 'mailto:your@emailhere.com?';
      mailLink += 'subject=' + encodedTitle +'&';
      mailLink += 'body=Link%3A%20' + encodedLocation;

  var this_script = $('script[src*=sharebar]');    

  var toolbar  = '<ul class="social-sidebar">';
  var dataClass = this_script.attr('data-class');

  if (typeof dataClass !== "undefined" ) {
    toolbar  = '<ul class="social-sidebar '+ dataClass +'" >';
  }
  // loop ?
  toolbar += '<li><a href="' + facebookLink + '" target="_blank">';
  toolbar += '<span class="icon icon-facebook"></span></a></li>';

  toolbar += '<li><a href="' + twitterLink + '" target="_blank">';
  toolbar += '<span class="icon icon-twitter"></span></a></li>';

  toolbar += '<li><a href="' + linkedInLink + '" target="_blank">';
  toolbar += '<span class="icon icon-linkedin"></span></a></li>';

  toolbar += '<li><a href="' + pinterestLink + '" target="_blank">';
  toolbar += '<span class="icon icon-pinterest"></span></a></li>';

  toolbar += '<li><a href="' + googleLink + '" target="_blank">';
  toolbar += '<span class="icon icon-google-plus"></span></a></li>';

  toolbar += '<li><a href="' + mailLink + '" target="_blank">';
  toolbar += '<span class="icon icon-email"></span></a></li>';

  toolbar += '</ul>';


  // Script can be conditioned w/ attr data-target to specify where bar appears
  
  var target = this_script.attr('data-target');
  if (typeof target === "undefined" ) {
    cssLink = '<link rel="stylesheet" type="text/css" href="/js/scripts/sharebar/sharebar-fixed.css">';
    where = $('body');
  } else {
    cssLink = '<link rel="stylesheet" type="text/css" href="/js/scripts/sharebar/sharebar-relative.css">';
    where = $(target);
  }

  $('head').append(cssLink);

  //Only insert sidebar once
  if($(target).find('.social-sidebar').length === 0) {
    where.append(toolbar);
  }
}
