/*global  mainApp,self ,document , setTimeout */
mainApp.service('anchorSmoothScroll', function () {
	'use strict';
	this.scrollTo = function (eID) {
		// This scrolling function
		// is from http://www.itnewb.com/tutorial/Creating-the-Smooth-Scroll-Effect-with-JavaScript
		function currentYPosition() {
			// Firefox, Chrome, Opera, Safari
			if (self.pageYOffset) {
				return self.pageYOffset;
			}
			// Internet Explorer 6 - standards mode
			if (document.documentElement && document.documentElement.scrollTop) {
				return document.documentElement.scrollTop;
			}
			// Internet Explorer 6, 7 and 8
			if (document.body.scrollTop) {
				return document.body.scrollTop;
			}
			return 0;
		}

		function elmYPosition(eID) {
			var elm = document.getElementById(eID), y = elm.offsetTop, node = elm;
			while (node.offsetParent && node.offsetParent != document.body) {
				node = node.offsetParent;
				y += node.offsetTop;
			}
			return y;
		}
		var startY = currentYPosition(),
			stopY = elmYPosition(eID),
			distance = stopY > startY ? stopY - startY : startY - stopY,
			i;
		if (distance < 100) {
			this.scrollTo(0, stopY);
			return;
		}
		var speed = Math.round(distance / 100),
			step = Math.round(distance / 25),
			leapY,
			timer = 0;
		if (speed >= 20) {
			speed = 20;
		}
		leapY = stopY > startY ? startY + step : startY - step;
		if (stopY > startY) {
			for (i = startY; i < stopY; i += step) {
				setTimeout("window.scrollTo(0, " + leapY + ")", timer * speed);
				leapY += step;
				if (leapY > stopY) {
					leapY = stopY;
				}
				timer++;
			}
			return;
		}
		for (i = startY; i > stopY; i -= step) {
			setTimeout("window.scrollTo(0, " + leapY + ")", timer * speed);
			leapY -= step;
			if (leapY < stopY) {
				leapY = stopY;
			}
			timer++;
		}



	};

});
