/*
 * ************************************************************* *
 * Name       : Power Tour                                       *
 * Date       : June 2012                                        *
 * Owner      : CreativeMilk                                     *
 * Url        : www.creativemilk.net                             *
 * Version    : 1.7                                              *
 * Updated    : 2013-12-16 21:15:54 UTC+02:00                    *
 * Developer  : Mark                                             *
 * Dependency :                                                  *
 * Lib        : jQuery 1.7+                                      *
 * Licence    : NOT free                                         *
 * http://codecanyon.net/item/power-tour-powerfull-creative-jquery-tour-plugin/3246071
 * ************************************************************* *
 */

;(function($, window, document, undefined){
	
	//"use strict"; // jshint ;_;
	
	var pluginName = 'powerTour';
	
	function Plugin(element, options){
		
		/**
		* Variables.
		**/	
		this.obj         = $(element);		
		this.o           = $.extend({}, $.fn[pluginName].defaults, options);
		this.arrowSize   = 8;
		this.timeouts    = [];
		this.totalSteps  = this.o.step.length;
		this.customClass = '';
		this.tid         = '';
		this.id          = 1;
	    this.screenPos   = new Array('sc','stl','stm','str','srm','sbr','sbm','sbl','slm');
		
		this.init();
	};

	Plugin.prototype = {
								
		/**	
		* Code that we run at the start. 
		* 
		* @param:
		**/	
		init: function(){
			
			var self = this;
						
			/**
			* Check for touch support and set right click events.
			**/
			if(('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch){
				clickEvent = 'touchstart';
			}else{
				clickEvent = 'click';
			}

			/**
			* Set parameter values.
			**/	
			$('body').attr('data-tour-pause', 'no').attr('data-tour-active','no').attr('data-tour-cur',-1);
			
			//*****************************************************************//
			/////////////////////// CREATE ALL STEPS LOOP ///////////////////////
			//*****************************************************************//
			
				/**
				* Create all steps with a loop.
				**/	
				$.each(self.o.step, function(i, value){										

					/**
					* Check for screen postions, they should 
					* not use an hook, so append to body instead.
					**/					
					if($.inArray(value.arrowPosition, self.screenPos) == -1){
						
						var theHook = $(value.hookTo);
						
						/**
						* Add a relitive class for the highlight function.
						**/	
						theHook.addClass('powertour-hook-relative').attr('data-tour-id', self.o.tourId);
						
					}else{
						
						/**
						* Attach to body(dummy).
						**/
						var theHook = $('body');								
					}

					/**
					* Set the styling class.
					**/	
					if($.trim(value.customClassStep)){
						var stylingClass = value.customClassStep;		
					}else{
						    stylingClass = '';
					}
					
					/**
					* savety width.
					**/	
					if(value.width){
						var sWidht = value.width;
					}else{
						    sWidht = 300;
					}
					
					/**
					* Build the powerTour template.
					* We need to build it inside the loop
					* this because of the dataset step.
					**/
					var tourTemp = '<div class="powertour powertour-style-basic '+stylingClass+'" style="display:none;" data-tour-id="'+self.o.tourId+'" data-tour-step="'+i+'">'+
									'<span></span>'+
									'<div class="powertour-inner">'+
									'<div class="powertour-content">No content found, check your settings!</div>'+
									'<footer class="powertour-footer"></footer>'+
									'</div>'+
									'</div>';
						
					/**
					* Create the single step of the tour.
					**/	
					theHook
					.append(tourTemp)
					.children('[data-tour-id="'+self.o.tourId+'"][data-tour-step="'+i+'"]')
					.css({width: sWidht})
					.find('.powertour-content')
					.html($(value.content))
					.children()
					.css({width: sWidht - 30})
					.show();
					
					/**
					* Set the main variable.
					**/	
					var step       = $('[data-tour-id="'+self.o.tourId+'"][data-tour-step="'+i+'"]');
					var tourFooter = step.find('.powertour-footer');
						
					/**
					* Append the prev/stop/next buttons to the footer.
					* If the tour type is 'showAll' remove the footer and dont use the buttons.
					**/	
					if(self.o.tourType != 'tooltip'){

						/**
						* Allow only buttons with text.
						**/
						if(value.prevLabel && self.o.tourType != 'showAll' && i != 0){
							var pBtn =  '<a href="javascript:void(0);" class="powertour-btn-prev"><span>'+value.prevLabel+'</span></a>';
						}else{
							var pBtn = '';
						}
						if(value.nextLabel && self.o.tourType != 'showAll' && self.totalSteps != (i+1)){
							var nBtn = '<a href="javascript:void(0);" class="powertour-btn-next"><span>'+value.nextLabel+'</span></a>';	
						}else{
							var nBtn = '';
						}
						if(value.stopLabel){
							var sBtn = '<a href="javascript:void(0);" class="powertour-btn-stop"><span>'+value.stopLabel+'</span></a>';	
						}else{
							var sBtn = '';
						}
						
						/**
						* Set the buttons order.
						**/
						var formatButtons = self.o.stepButtonOrder.replace(/%prev%/g, pBtn).replace(/%next%/g, nBtn).replace(/%stop%/g, sBtn);

						/**
						* Add the buttons to the footer, if present.
						**/
						if($.trim(formatButtons)){
							tourFooter.append('<div>'+formatButtons+'</div>');	
						}else{
							tourFooter.remove();	
						}
					
					}else{
						
						/**
						* The type 'all' doesn't need a footer, so lets remove it.
						**/
						tourFooter.remove();	
					}
					
					/**
					* Getting width and height from the hook and step.
					**/	
					var hookWidth  = theHook.outerWidth();
					var hookHeight = theHook.outerHeight();	
					var stepWidth  = step.outerWidth();
					var stepHeight = step.outerHeight();
					
					/**
					* Remove the arrow, let the step float(if the option is set to false). 
					* Add the right arrow class.
					**/	
					if(value.showArrow != true || $.inArray(value.arrowPosition, self.screenPos) != -1){
						step.children('span').remove();	
						var newArrowSize = 0;	
					}else{
						step.children('span').addClass('powertour-arrow-'+value.arrowPosition);
						newArrowSize = self.arrowSize;							
					}
						
					/**
					* Setting the offset top.
					**/	
					if(value.offsetY){
						var offsetY = value.offsetY;
					}else{
							offsetY = 0;
					}
									
					/**
					* Setting the offset left.
					**/	
					if(value.offsetX){
						var offsetX = value.offsetX;
					}else{
							offsetX = 0;
					}
											
					/**
					* Settings per arrow position.
					**/	
					switch(value.arrowPosition){
						// top left
						case 'tl':
							step.css({left: offsetX , top: -stepHeight - newArrowSize - offsetY});					
						break;
						// top middle
						case 'tm':
							step.css({left: '50%', marginLeft: -((stepWidth/2) - offsetX), top: -stepHeight - newArrowSize - offsetY});					
						break;
						// top right
						case 'tr':
							step.css({right: offsetX , top: -stepHeight - newArrowSize - offsetY});					
						break;

						// right top
						case 'rt':
							step.css({left: (hookWidth + offsetX + newArrowSize), top: offsetY});
						break;
						// right middle
						case 'rm':
							step.css({left: (hookWidth + offsetX + newArrowSize), top: '50%', marginTop: -((stepHeight/2) - offsetY)});						
						break;						
						// right bottom
						case 'rb':
							step.css({left: (hookWidth + offsetX + newArrowSize), bottom: offsetY});						
						break;
						
						// bottom left
						case 'bl':
							step.css({left: offsetX , bottom: -stepHeight - newArrowSize - offsetY});					
						break;
						// bottom middle
						case 'bm':
							step.css({left: '50%', marginLeft: -((stepWidth/2) - offsetX), bottom: -stepHeight - newArrowSize - offsetY});					
						break;
						// bottom right
						case 'br':
							step.css({right: offsetX , bottom: -stepHeight - newArrowSize - offsetY});					
						break;

						// left top
						case 'lt':
							step.css({right: (hookWidth + offsetX + newArrowSize), top: offsetY});
						break;
						// left middle
						case 'lm':
							step.css({right: (hookWidth + offsetX + newArrowSize), top: '50%', marginTop: -((stepHeight/2) - offsetY)});						
						break;						
						// left bottom
						case 'lb':
							step.css({right: (hookWidth + offsetX + newArrowSize), bottom: offsetY});						
						break;

						// screen center
						case 'sc':
							step.css({left: '50%', top: '50%', marginLeft: -((sWidht/2) - offsetX), marginTop: -((stepHeight/2) - offsetY), position: 'fixed'});						
						break;						
								
						// screen top left
						case 'stl':
							step.css({left: (20 - offsetX), top: (20 - offsetY), position: 'fixed'});						
						break;
						// screen top middle
						case 'stm':
							step.css({left: '50%', marginLeft: -((sWidht/2) - offsetX), top: (20 - offsetY), position: 'fixed'});						
						break;							
						// screen top right
						case 'str':
							step.css({right: (20 - offsetX), top: (20 - offsetY), position: 'fixed'});						
						break;
						// screen right mid
						case 'srm':
							step.css({right: (20 - offsetX), top: '50%', marginTop: -((stepHeight/2) - offsetY), position: 'fixed'});						
						break;							
						// screen bottom right
						case 'sbr':
							step.css({right: (20 - offsetX), bottom: (20 - offsetY), position: 'fixed'});						
						break;
						// screen top middle
						case 'sbm':
							step.css({left: '50%', bottom: (20 - offsetY), marginLeft: -((sWidht/2) - offsetX), position: 'fixed'});						
						break;
						// screen bottom left
						case 'sbl':
							step.css({left: (20 - offsetX), bottom: (20 - offsetY), position: 'fixed'});						
						break;																
						// screen left mid
						case 'slm':
							step.css({left: (20 - offsetX), top: '50%', marginTop: -((stepHeight/2) - offsetY), position: 'fixed'});						
						break;								

						// right top
						default:
							step.css({right: (hookWidth + offsetX + newArrowSize), top: offsetY});
						break;																																				
					};
					
					/**
					* Clone the step.
					**/	
					if(value.cloneTo && $.inArray(value.arrowPosition, self.screenPos) == -1){							
						$(value.cloneTo)
						.addClass('powertour-hook-relative')
						.append( $('[data-tour-id="'+self.o.tourId+'"][data-tour-step="'+i+'"]').clone() )
						.children('[data-tour-id="'+self.o.tourId+'"][data-tour-step="'+i+'"]')
						.attr('data-tour-step-clone', i)	
					}
					
					/**
					* Add a tooltip class.
					**/	
					if(self.o.tourType == 'tooltip'){
						theHook.addClass('powertour-tooltip');
					}
					
				});
				
			//*****************************************************************//
			/////////////////////// SET TRIGGER ID(S) ///////////////////////////
			//*****************************************************************//
			
				/**
				* Give every trigger link an id.
				**/	
				self.obj.attr('data-tour-trigger-id',self.o.tourId);
			
			//*****************************************************************//
			/////////////////////// SET AUTO CONTROLS ///////////////////////////
			//*****************************************************************//
			
				if(self.o.tourType == 'auto'){
										
					if(self.o.showTimeControls === true){
						
						/**
						* Set the buttons order.
						**/
						var formatButtons = self.o.timeButtonOrder.replace(/%prev%/g, '<a href="#" class="powertour-time-prev"></a>')
															      .replace(/%stop%/g, '<a href="#" class="powertour-time-stop"></a>')
															      .replace(/%pause%/g,'<a href="#" class="powertour-time-pause"></a>')
															      .replace(/%play%/g, '<a href="#" class="powertour-time-play"></a>')
															      .replace(/%next%/g, '<a href="#" class="powertour-time-next"></a>');
														
						/**
						* Append the time controls.
						**/	
						$('body').append('<div class="powertour-time-ctrls" data-tour-id="'+self.o.tourId+'" id="powertour-time-ctrls-'+self.o.tourId+'">'+formatButtons+'</div>');
					}

					/**
					* Add a time placeholder to the body.
					**/	
					if(self.o.showTimer === true){					
						 $('body').append('<div class="powertour-time-timer" data-tour-id="'+self.o.tourId+'" id="powertour-time-timer-'+self.o.tourId+'">'+self.o.timerLabel+'<b>'+self.o.step[0].time+'</b></div>');
					}

				}

			//*****************************************************************//
			/////////////////////// ACTIVE TOUR FUNCTION ////////////////////////
			//*****************************************************************//
			
				/**
				* Used as an savety check, once the tour runs it will 
				* add a indicator dataset to the body.
				*
				* @param: active | boolean | Tour is active or not.
				**/
				function tourActive(active){
					if(active === true){
						$('body').attr('data-tour-active','yes');
					}else{
						$('body').attr('data-tour-active','no');
					}
				}
				
			//*****************************************************************//
			////////////////////// HIGHTLIGHT TOUR FUNCTION /////////////////////
			//*****************************************************************//
			
				/**	
				* Append the overlay to the body. 
				**/
				if(!$('#powertour-overlay').length){	
					$('body').append('<div id="powertour-overlay"></div>');
				}
				
				/**	
				* Highlight tour function. 
				* 
				* @param: i   | integer | Number of the step.
				* @param: end | boolean | Ends the tour(remove overlay).
				**/	
				function highlightTour(i, end){
					
					/**
					* Set the main variable(s).
					**/	
					var value  = self.o.step[i];
					var set    = value.highlight;
					var elm    = value.highlightElements;
					var tourId = $('body').attr('data-tour-id');
					
					if(set === true && end != true){
						
						/**	
						* Reset all zindex classes.
						**/							
						$('.powertour-hook-zindex').removeClass('powertour-hook-zindex');
						
						/**	
						* Set zindex class.
						**/	
						if($.inArray(value.arrowPosition, self.screenPos) == -1){
							$('[data-tour-id="'+tourId+'"][data-tour-step="'+i+'"]').parent().addClass('powertour-hook-zindex');
						}
						
						/**	
						* Set zindex class for extra elements.
						**/	
						if($.trim(elm) && $(elm).length){
							$(elm).addClass('powertour-hook-zindex powertour-hook-relative');
						}
					
						/**	 
						* Show overlay.
						**/	
						$('#powertour-overlay').fadeTo(self.o.effectSpeed, self.o.overlayOpacity);

					}
					if(end === true || set === false){
						
						/**	
						* Hide the overlay.
						**/	
						$('#powertour-overlay').fadeOut(self.o.effectSpeed);	
						
						/**	
						* Reset all zindex classes.
						**/							
						$('.powertour-hook-zindex').removeClass('powertour-hook-zindex');					
						
					}
				}
				
			//*****************************************************************//
			//////////////////// SCROLL TO TARGET FUNCTION //////////////////////
			//*****************************************************************//
			
				/**
				* Scroll to the target(hook or step) or reset and 
				* go back to the top. Notice that if the hook is bigger
				* than the window it will use the step as center.
				*
				* @param: i   | integer | The number of the step.
				* @param: end | boolean | Go to the top at the end of the tour.
				**/	
				function scrollToTarget(i, end){
				
					if(self.o.animated == true){

						/**
						* Set the main variable(s).
						**/	
						var value     = self.o.step[i];
						var hook      = value.hookTo;
						var center    = value.center;
						var ap        = value.arrowPosition;
						var tourId    = $('body').attr('data-tour-id');
						var winHeight = $(window).height();
						
						/**
						* Check and set the type of center.
						**/	
						if($.inArray(ap, self.screenPos) == -1){		
									
							var step = $(hook).find('.powertour[data-tour-id="'+tourId+'"][data-tour-step="'+i+'"]');
							
							if(center == 'step' || $(hook).outerHeight() >= winHeight){ 
								// notice the show(), this is because position does not work on hidden elements
								var centerTo = step.show().offset().top - (winHeight/2) + (step.outerHeight()/2);
							}else{
									centerTo = $(hook).offset().top - (winHeight/2) + ($(hook).outerHeight()/2); 
									
							}
							
							/**
							* Animate me baby....
							**/	
							$('html, body').animate({scrollTop:centerTo}, self.o.travelSpeed, self.o.easingEffect);
						}
						
						/**
						* At the end we go to the top.
						**/	
						if(end === true && self.o.animatedOnEnd === true){
							$('html, body').animate({scrollTop:0}, self.o.travelSpeed, self.o.easingEffect);
						}
					}
				}	
				
			//*****************************************************************//
			////////////////////////// CONVERT TIME /////////////////////////////
			//*****************************************************************//
			
				/**
				* Convert the time 
				*
				* @param: time | integer(time) | The time value.
				**/	
				function convertTime(time){
					
					/**
					* Prevent an empty time value.
					**/	
					if($.trim(time)){
						
						/**
						* Check for the right time format and convert time 
						* in to millieseconds.
						**/	
						if(time.indexOf(':') == -1){
							alert('Please use the right time format (mm:ss)')
						}
						var nTime    = time.split(":").reverse();
							endTime  = parseInt(((nTime[0]) * 1000 ) + (nTime[1] * 60000));
					}else{
							endTime = 60000;
					}
					
					return endTime;
				}
				
			//*****************************************************************//
			///////////////////////////// TIMER /////////////////////////////////
			//*****************************************************************//
			
				/**
				* Simple countdown function used for the 'auto' type.
				* The interval will reset if a new step will run.
				*
				* @param: time | integer | Time until end.
				* @param: id   | integer | Put the time in the right place.
				**/	
				function countdownTimer(time, id){
				   
					/**	
					* Converting to milliseconds. 
					**/						   
					convertTime(time);
					
					function timer(){
						
						var tourId = $('body').attr('data-tour-id');	
														
						//day = calc(t,216000000,24);
						//hours = calc(t,3600000,60);
						mins = calc(endTime,60000,60);
						secs = calc(endTime,1000,60);
						
						/**
						* Always display 2 numbers.
						**/	
						function calc(secs, num1, num2) {
							var s = ((Math.floor(secs/num1))%num2).toString();
							if (s.length < 2){
								var s = "0" + s;
							}
							return s;
						}	
													
						/**
						* Show the timer.
						**/
						$('.powertour-time-timer[data-tour-id='+tourId+'] b').html(mins+':'+secs);
						
					}
					window.cInter = setInterval(function(){
						if(endTime != 0){
							endTime -= 1000;
							timer();
						}
					},1000);
				}
				
			//*****************************************************************//
			/////////////////////// PAUSE TIMER FUNCTION ////////////////////////
			//*****************************************************************//
			
				/**
				* Pause or play timer.
				* Reset the timer.
				*
				* @param: pause | boolean | Pause button.
				* @param: rst   | boolean | Reset time.
				**/
				function pauseTimer(pause, rst){
					
					var tourId = $('body').attr('data-tour-id');	

					/**
					* if: Reset the display timer.
					* else: Pause/play the timer display.
					**/	
					if(rst === true){
						clearInterval(window.cInter);
						$('.powertour-time-timer[data-tour-id='+tourId+'] b').html(self.o.step[0].time);	
					}else{
						if(pause === true){
							$('body').attr('data-tour-pause', 'yes');
							var secsLeft = $('.powertour-time-timer[data-tour-id='+tourId+'] b').text();	
							$('.powertour-time-timer[data-tour-id='+tourId+'] b').replaceWith('<span>'+secsLeft+'</span>');
						}else{
							$('body').attr('data-tour-pause', 'no');
							var secsLeft = $('.powertour-time-timer[data-tour-id='+tourId+'] span').text();	
							$('.powertour-time-timer[data-tour-id='+tourId+'] span').replaceWith('<b>'+secsLeft+'</b>');	
						}
					}

				}
				
			//*****************************************************************//
			//////////////////// SET CURRENT STEP FUNCTION /////////////////////
			//*****************************************************************//

				/**
				* Add a custom class to the hook.
				*
				* @param: dir | string | Go to the next or prev.
				**/
				function currentStep(dir){
					var gVal = parseInt($('body').attr('data-tour-cur'));
	
					if(dir == 'next'){
						var sVal = gVal +1; 	
					}else if(dir = 'prev'){
						var sVal = gVal - 1 
					}
					
					$('body').attr('data-tour-cur',sVal);
				}
				
			//*****************************************************************//
			//////////////////// CUSTOM CLASS HOOK FUNCTION /////////////////////
			//*****************************************************************//

				/**
				* Add a custom class to the hook.
				*
				* @param: i | integer | Index.
				**/
				function customClassHook(i){

					/**
					* Set the main variable(s).
					**/	
					var value     = self.o.step[i];
					var hook      = value.hookTo;
					var cloneTo   = value.cloneTo;
					var classHook = value.customClassHook;
					var ap        = value.arrowPosition;

					/**	
					* Remove all custom classes. 
					**/
					$.each(self.o.step,function(i,value){
						var customClass = value.customClassHook;
						if($.trim(customClass)){
							$('.'+customClass).removeClass(customClass);	
						}
					});

					/**	
					* Add the custom class to the hook. 
					**/
					if($.trim(classHook) && $.inArray(ap, self.screenPos) == -1 && $.trim(hook)){
						$(hook).addClass(classHook);
					}
					
					/**	
					* Add the custom class to the cloned hook(id). 
					**/
					if($.trim(classHook) && $.trim(cloneTo) && $.inArray(ap, self.screenPos) == -1){
						$(cloneTo).addClass(classHook);
					}
				}

			//*****************************************************************//
			///////////////////////// END TOUR FUNCTION /////////////////////////
			//*****************************************************************//

				/**	
				* This function runs when a tour gets canceled, stop button gets pressed
				* or on tour completion.
				**/
				function endTour(val){
					
					var tourId = $('body').attr('data-tour-id');	
					
					/**	
					* Reset current value.
					**/	
					$('body').attr('data-tour-cur',-1);		
					
					if(self.o.tourType == 'auto'){	
						
						/**	
						* Reset all timeouts. 
						**/	
						clearTimeout(tid);
										
						/**	
						* Hide the time controls + timer. 
						**/	
						$('.powertour-time-ctrls, .powertour-time-timer').hide();
						
						/**	
						* Reset pause state 
						**/	
						$('.powertour-time-timer').find('span').replaceWith('<b></b>')
												
					}
					
					/**	
					* Hide all steps. 
					**/	
					$('.powertour').fadeOut(self.o.effectSpeed);
												
					/**	
					* Custom class hook function.
					**/	
					customClassHook(0);
				
					/**	
					* Scroll to target function. 
					**/	
					scrollToTarget(0, true);
				
					/**	
					* Focus on tour function. 
					**/		
					highlightTour(0, true);

					/**	
					* Run the callback function.
					**/	
				    if(val == 0){
						var newVal = val;
					}else{
						var newVal = val -1
					}
					if(self.o.tourType == 'auto' || self.o.tourType == 'step' && val != undefined && typeof self.o.step[newVal].onHideStep == 'function'){
						self.o.step[newVal].onHideStep.call(this);
					}
					
					/**	
					* Tour active function. 
					**/
					tourActive(false);
						
					/**	
					* Remove tour id from body and remove the tour 
					* 'tour-disabled' class from the trigger.
					**/
					$('body').find('[data-tour-trigger-id="'+tourId+'"]').removeClass('tour-disabled');
					
				}
			
			//*****************************************************************//
			///////////////////////// AUTO TOUR FUNCTION ////////////////////////
			//*****************************************************************//
			
				/**
				* The type 'auto' function.
				**/							
				function autoTour(prev){
					
					var tourId = $('body').attr('data-tour-id');

					/**	
					* Current step function.
					**/	
					if(prev === true){
						currentStep('prev');
					}else{
						currentStep('next');
					}
						
					var curn = parseInt($('body').attr('data-tour-cur'));
			
					/**	
					* if:   reset and go back to the beginning.
					* else: run the tourtype 'auto' code.
					**/	
					if(curn == self.totalSteps){
						
						/**	
						* Exit url function.
						**/	
						exitUrl();

						/**	
						* End tour function.
						**/	
						endTour(curn);
						
						/**	
						* Run the callback function.
						**/	
						if(typeof self.o.onFinish == 'function'){
							self.o.onFinish.call(this);
						}	
						
					}else{
						
						/**
						* Set variable for step back and step forward(used for hideonstep hook).
						**/	
						if(prev === true){
							var i = curn + 1;
						}else{
								i = curn - 1; 
						}

						/**
						* Set the main variable(s).
						**/	
						var value     = self.o.step[curn];					
						var valuePrev = self.o.step[parseInt(i)];
						var step      = $('.powertour[data-tour-id="'+tourId+'"][data-tour-step="'+curn+'"]');					
						
						/**	
						* Run the callback function.
						**/	
						if(valuePrev != undefined && typeof valuePrev.onHideStep == 'function'){
							valuePrev.onHideStep.call(this);
						}	

						/**	
						* Show time controls + timer. 
						**/	
						$('.powertour-time-ctrls[data-tour-id='+tourId+'], .powertour-time-timer[data-tour-id='+tourId+']').fadeIn(self.o.effectSpeed);

						/**
						* Scroll to target function. 
						**/	
						scrollToTarget(curn, false);
						
						/**	
						* Converting to milliseconds. 
						**/	
						convertTime(value.time);
						
						/**	
						* Focus on tour function. 
						**/		
						highlightTour(curn, false);
						
						/**
						* Show countdown time.
						* Reset the countdown timer.
						**/	
						if(self.o.showTimer === true){
							clearInterval(window.cInter);
							countdownTimer(value.time, tourId);
						}
						
						/**
						* Remove all open steps.
						**/	
						$('.powertour').not(step).fadeOut(self.o.effectSpeed);
						
						/**
						* Show the active step.
						**/	
						step.fadeIn(self.o.effectSpeed);
													
						/**	
						* Run the callback function.
						**/	
						if(typeof value.onShowStep == 'function'){
							value.onShowStep.call(this);
						}

						/**	
						* Custom class hook function.
						**/	
						customClassHook(curn);

						/**	
						* Loop with the delays.
						**/	
						tid = setTimeout(autoTour, endTime);

					}
				}
				
			//*****************************************************************//
			////////////////////// GO TO STEP FUNCTION //////////////////////////
			//*****************************************************************//

				/**
				* Tour type 'step' next function.
				*
				* @param: i    | integer | Index.
				* @param: id   | integer | Tour id.
				* @param: prev | boolean | Check is step is prev.
				**/
				function goToStep(i,id,prev){
					
					/**
					* Set variable for step back and step forward(used for hideonstep hook).
					**/	
					if(prev === true){
						var val  = i + 1;
						
						/**	
						* Current step function.
						**/	
						currentStep('prev');
					}else{
						val  = i - 1;
							
						/**	
						* Current step function.
						**/	
						currentStep('next');
					}
				
					/**
					* Set the main variable(s).
					**/	
					var value     = self.o.step[i];				
					var valuePrev = self.o.step[parseInt(val)];		
					
					/**	
					* Run the callback function.
					**/	
					if(valuePrev != undefined && typeof valuePrev.onHideStep == 'function'){
						valuePrev.onHideStep.call(this);
					}	
					
					/**
					* Scroll to target function.
					**/	
					scrollToTarget(i, false);
											
					/**	
					* Focus on tour function. 
					**/		
					highlightTour(i, false);

					/**	
					* Custom class hook function.
					**/	
					customClassHook(i);

					/**
					* Hide all open steps.
					**/	
					$('.powertour[data-tour-id="'+id+'"]:not([data-tour-step="'+i+'"])').fadeOut(self.o.effectSpeed)
					
					/**
					* Show the next step.
					**/	
					$('.powertour[data-tour-id="'+id+'"][data-tour-step="'+i+'"]').fadeIn(self.o.effectSpeed);
					
					/**	
					* Run the callback function.
					**/	
					if(typeof value.onShowStep == 'function'){
						value.onShowStep.call(this);
					}
					
				}

			//*****************************************************************//
			/////////////////////////// START THE TOUR //////////////////////////
			//*****************************************************************//

				/**
				* Start the tour with a click.
				**/	
				self.obj.on(clickEvent, function(e){
					
					/**	
					* Stop tour if destroyed method has been called or
					* if the tour type is 'tooltip'. 
					**/
					if(!$(this).hasClass('tour-disabled') && self.o.tourType != 'tooltip'){
						
						/**
						* Prevent clicking the trigger.
						**/	
						$(this).addClass('tour-disabled');
																					
						/**	
						* Add the running tour ID to the body. 
						**/
						var tourId = $(this).data('tour-trigger-id');
						$('body').attr('data-tour-id',tourId);
	
						/**	
						* Tour active function. 
						**/
						tourActive(true);
	
						/**	
						* Run the callback function.
						**/	
						if(typeof self.o.onStart == 'function'){
							self.o.onStart.call(this);
						}
							
						/**
						* If the option type is set to "auto" it will
						* loop on it self, once done it will close.
						**/	
						if(self.o.tourType == 'auto'){
													
							/**
							* The auto tour function.
							**/	
							autoTour();
									
						}else if(self.o.tourType == 'showAll'){
	
							/**	
							* Show all steps at once if the type is set to 'all'.
							**/	
							$('.powertour[data-tour-id="'+tourId+'"]').fadeIn(self.o.effectSpeed);	
							
						}else if(self.o.tourType == 'step'){
							
							/**	
							* Go to step function.
							**/					
							goToStep(0, tourId);
								
						}
					}
					
					e.preventDefault();
				});

				/**	
				* Run on load or if parameter is present.
				**/	
				if(self.o.runOnLoad === true || decodeURIComponent((location.search.match(RegExp("[?|&]tour=(.+?)(&|$)"))||[,null])[1]) == 'true'){
					setTimeout(function(){
						
						/**	
						* Tour active function. 
						**/
						tourActive(true);

						/**
						* Prevent clicking the trigger.
						**/	
						self.obj.addClass('tour-disabled');
																					
						/**	
						* Add the running tour ID to the body. 
						**/
						var tourId = self.obj.data('tour-trigger-id');
						$('body').attr('data-tour-id',tourId);
							
						/**	
						* Run the callback function.
						**/	
						if(typeof self.o.onStart == 'function'){
							self.o.onStart.call(this);
						}
							
						/**
						* If the option type is set to "auto" it will
						* loop on it self, once done it will close.
						**/	
						if(self.o.tourType == 'auto'){
							
							/**
							* The auto tour function.
							**/	
							autoTour();
									
						}else if(self.o.tourType == 'showAll'){

							/**	
							* Show all steps at once if the type is set to 'all'.
							**/	
							$('[data-tour-id="'+tourId+'"]').fadeIn(o.effectSpeed);	
							
						}else if(self.o.tourType == 'step'){

							/**	
							* Go to step function.
							**/					
							goToStep(0,tourId);
								
						}
					},self.o.runOnLoadDelay);
				}
				
			//*****************************************************************//
			/////////////////////////// TYPE TOOLTIP ////////////////////////////
			//*****************************************************************//
			
				if(self.o.tourType == 'tooltip'){
					
					/**	
					* Fade in and out.
					**/					
					$('.powertour-tooltip').hover(function(){					

						/**
						* Get the number of the open step.
						**/	
						var i = $(this).children('[data-tour-id="'+self.o.tourId+'"]').data('tour-step');
						
						/**
						* Show the tooltip.
						**/	
						$(this).children('[data-tour-id="'+self.o.tourId+'"]').stop(true, true).fadeIn(self.o.effectSpeed);
						
						/**
						* Show the tooltip clone.
						**/	
						$('.powertour[data-tour-id="'+self.o.tourId+'"][data-tour-step-clone="'+i+'"]').stop(true, true).fadeIn(self.o.effectSpeed);	
							
					},function(){
						$('.powertour[data-tour-id="'+self.o.tourId+'"]').stop(true, true).fadeOut(self.o.effectSpeed);
					});
											
				}
					
			//*****************************************************************//
			///////////////////////// PREV/NEXT BUTTONS /////////////////////////
			//*****************************************************************//

				/**	
				* Run prev/next.
				**/
				$('body').off(clickEvent, '.powertour-btn-prev, .powertour-btn-next').on(clickEvent, '.powertour-btn-prev, .powertour-btn-next', function(e){

					var tourId   = $('body').attr('data-tour-id');
					var thisStep = parseInt($('body').attr('data-tour-cur'));		

					if(self.o.tourType == 'step'){
						
						/**
						* Prev button.
						**/	
						if($(e.target).parents().hasClass('powertour-btn-prev')){
							
							/**	
							* Go to step function.
							**/	
							goToStep((thisStep -1), tourId, true);
	
						}
						
						/**
						* Prev button.
						**/	
						if($(e.target).parents().hasClass('powertour-btn-next')){
							
							/**	
							* Go to step function.
							**/	
							goToStep((thisStep +1), tourId);	

						}
						
					}else if(self.o.tourType == 'auto'){
						
						/**
						* Prev button.
						**/	
						if($(e.target).parents().hasClass('powertour-btn-prev')){
														
							/**	
							* Reset all timeouts. 
							**/	
							clearTimeout(tid);	
						
							/**
							* The auto tour function.
							**/	
							autoTour(true);

						}
						
						/**
						* Next button.
						**/	
						if($(e.target).parents().hasClass('powertour-btn-next')){
							
							/**	
							* Reset all timeouts. 
							**/	
							clearTimeout(tid);	
						
							/**
							* The auto tour function.
							**/	
							autoTour();
							
						}

					}
					
					e.preventDefault();	
					
				});	

			//*****************************************************************//
			////////////////////// TIME CONTROL BUTTONS /////////////////////////
			//*****************************************************************//
			
				$('body').off(clickEvent, '.powertour-time-stop, .powertour-time-next, .powertour-time-prev, .powertour-time-play, .powertour-time-pause')
				.on(clickEvent, '.powertour-time-stop, .powertour-time-next, .powertour-time-prev, .powertour-time-play, .powertour-time-pause', function(e){
					
					var tourId  = $('body').attr('data-tour-id');	
					var curStep = parseInt($('body').attr('data-tour-cur'));

					/**	
					* Stop button.
					**/
					if($(e.target).is($('.powertour-time-stop'))){
						
						/**	
						* Tour active function. 
						**/
						tourActive(false);

						/**	
						* End tour function.
						**/	
						endTour(curStep);

						if(self.o.tourType == 'auto'){
							
							/**	
							* Pause timer function. 
							**/	
							pauseTimer(false, true);
						}
									
						/**	
						* Run the callback function.
						**/	
						if(typeof self.o.onStop == 'function'){
							self.o.onStop.call(this);
	
						}
						
					}
					
					/**	
					* Next button.
					**/
					if($(e.target).is($('.powertour-time-next')) && $('body').attr('data-tour-pause') == 'no'){
						
						if(self.o.tourType == 'auto'){
							
							/**	
							* Reset all timeouts. 
							**/	
							clearTimeout(tid);	
							
							/**
							* The auto tour function.
							**/	
							autoTour();
							
						}
					}
						
					/**	
					* Prev button.
					**/
					if($(e.target).is($('.powertour-time-prev')) && $('body').attr('data-tour-pause') == 'no'){

						if(curStep > 0 && self.o.tourType == 'auto'){
							
							/**	
							* Reset all timeouts. 
							**/	
							clearTimeout(tid);	
							
							/**
							* The auto tour function.
							**/	
							autoTour(true);
						}
					
					}
					
					/**	
					* Pause button.
					**/
					if($(e.target).is($('.powertour-time-pause')) && $('body').attr('data-tour-pause') == 'no'){
						
						/**	
						* Pause timer function. 
						**/	
						pauseTimer(true, false);
						
						/**	
						* Reset all timeouts. 
						**/	
						clearTimeout(tid);
						
					}
					
					/**	
					* Play button.
					**/
					if($(e.target).is($('.powertour-time-play')) && $('body').attr('data-tour-pause') == 'yes'){
						
						/**	
						* Get the remaining time. 
						**/	
						var secsLeft = $('.powertour-time-timer span').text();	
						
						/**	
						* Pause timer function. 
						**/	
						pauseTimer(false, false);

						/**	
						* Convert to milliseconds function. 
						**/	
						convertTime(secsLeft)
													
						/**	
						* Start the loop again.
						**/	
						tid = setTimeout(autoTour, endTime);

					}
					
					e.preventDefault();
				});

			//*****************************************************************//
			/////////////////////////// EASY CANCEL /////////////////////////////
			//*****************************************************************//
				
				/**	
				* Cancel the type 'step' if a user clicks outside the 
				* step or hook, but only with the type 'step'.
				**/
				if(self.o.easyCancel === true){
					$(document).on(clickEvent, this, function(e){
						var tourId = $('body').attr('data-tour-id');

						if($('body').attr('data-tour-active') == 'yes' &&// notice the 'attr' instead of the 'data', the 'data' will not return the present/correct value!
						   !$(e.target).is($(' *', '.powertour[data-tour-id="'+tourId+'"]')) && 
						   !$(e.target).is($(' *', '[data-tour-trigger-id]')) && 
						   !$(e.target).is($('[data-tour-trigger-id]')) &&
						   !$(e.target).is($('.powertour-time-timer, .powertour-time-timer *')) &&
						   !$(e.target).is($('.powertour-time-ctrls, .powertour-time-ctrls *')) &&    
						   !$(e.target).is($('.powertour-hook-relative, .powertour-hook-relative *'))){							

							/**	
							* Tour active function. 
							**/
							tourActive(false);
						   
							var curStep = parseInt($('body').attr('data-tour-cur'));

							/**	
							* End tour function.
							**/	
							endTour(curStep + 1);
								
							if(self.o.tourType == 'auto'){

								/**	
								* Pause timer function. 
								**/	
								pauseTimer(false, true);
					
							 }
							
							 /**	
							 * Run the callback function.
							 **/	
							 if(typeof self.o.onCancel == 'function'){
								self.o.onCancel.call(this);
							 }
							 																	
						}
					});
				}
				
			//*****************************************************************//
			//////////////////////// TYPE STEP END BUTTON ///////////////////////
			//*****************************************************************//
			
				$('body').off(clickEvent, '.powertour-btn-stop').on(clickEvent, '.powertour-btn-stop', function(e){

					var curStep = parseInt($('body').attr('data-tour-cur'));
					
					/**	
					* Tour active function. 
					**/
					tourActive(false);

					/**	
					* End tour function.
					**/	
					endTour(curStep + 1);
				
					/**	
					* Run on the last step. 
					**/
					if((curStep +1) == self.totalSteps){
						
						/**	
						* Run the callback function.
						**/	
						if(typeof self.o.onFinish == 'function'){
							self.o.onFinish.call(this);
						}	
						
						/**	
						* Exit url function.
						**/	
						exitUrl();
						
					}else{
													
						/**	
						* Run the callback function.
						**/	
						if(typeof self.o.onStop == 'function'){
							self.o.onStop.call(this);
						}
						
					}
																					
					e.preventDefault();
				});
				
			//*****************************************************************//
			////////////////////////// KEYBOARD EVENTS //////////////////////////
			//*****************************************************************//
				
				/**	
				* ESC key needs to be keyup. 
				**/
				if(self.o.keyboardNavigation === true){
					$(document).unbind('keyup').keyup(function(e){
				
						var tourId  = $('body').attr('data-tour-id');
						var curStep = parseInt($('body').attr('data-tour-cur'));
						
						/**	
						* ESC key.
						**/								
						if(e.keyCode == 27 && $('body').attr('data-tour-active') == 'yes'){
	
							/**	
							* Tour active function. 
							**/
							tourActive(false);
							
							/**	
							* End tour function.
							**/	
							endTour(curStep + 1);

							if(self.o.tourType == 'auto'){

								/**	
								* Pause timer function. 
								**/	
								pauseTimer(false, true);
					
							 }
								
							/**	
							* Run the callback function.
							**/	
							if(typeof self.o.onCancel == 'function'){
								self.o.onCancel.call(this);
							}
							
						}
					});
					
					/**	
					* Space key needs to be keydown. 
					**/
					$(document).unbind('keydown').on('keydown', this, function(e){
						
						var tourId   = $('body').attr('data-tour-id');
						var thisStep = parseInt($('body').attr('data-tour-cur'));
						
						/**	
						* Space key.
						**/	
						if(e.keyCode == 32 && $('body').attr('data-tour-active') == 'yes' && self.o.tourType == 'auto'){ 
							e.preventDefault();
						
							/**	
							* Use the space key as play and pause function. 
							**/	
							if($('body').attr('data-tour-pause') == 'yes'){ 
							
								/**	
								* Get the remaining time. 
								**/	
								var secsLeft = $('.powertour-time-timer span').text();	
								
								/**	
								* Pause timer function. 
								**/	
								pauseTimer(false, false);
		
								/**	
								* Convert to milliseconds function. 
								**/	
								convertTime(secsLeft)
															
								/**	
								* Start the loop again.
								**/	
								tid = setTimeout(autoTour, endTime);
						
							}else{
								
								/**	
								* Pause timer function. 
								**/	
								pauseTimer(true, false);
								
								/**	
								* Reset all timeouts. 
								**/	
								clearTimeout(tid);
									
							}						
						}
	
						/**	
						* Arrow left key.
						**/								
						if(e.keyCode == 37 && $('body').attr('data-tour-pause') == 'no' && $('body').attr('data-tour-active') == 'yes'){

							if(self.o.tourType == 'auto' && thisStep > 1){
															
								/**	
								* Reset all timeouts. 
								**/	
								clearTimeout(tid);	
								
								/**
								* The auto tour function.
								**/	
								autoTour(true);	
								
							}
							
							if(self.o.tourType == 'step' && thisStep > 0){
							
								var i = thisStep - 1; 
								
								/**	
								* Go to step function.
								**/					
								goToStep(i, tourId, true);
							
							}
						}
	
						/**	
						* Arrow right key.
						**/								
						if(e.keyCode == 39 && $('body').attr('data-tour-pause') == 'no' && $('body').attr('data-tour-active') == 'yes'){							
							if(thisStep < (self.totalSteps - 1)){
								if(self.o.tourType == 'auto'){	
					
									/**	
									* Reset all timeouts. 
									**/	
									clearTimeout(tid);	
						
									/**
									* The auto tour function.
									**/	
									autoTour();

								}
								
								if(self.o.tourType == 'step'){	
		
									var i = thisStep + 1; 
									
									/**	
									* Go to step function.
									**/					
									goToStep(i,tourId);	
									
								}
							}
						}				
					});
				}		
			
			//*****************************************************************//
			/////////////////////////////// EXIT ////////////////////////////////
			//*****************************************************************//	
	
				/**	
				* This function runs after the last step if there 
				* is an exit url present
				**/
				function exitUrl(){
					if($.trim(self.o.exitUrl).length > 1){
						if (self.o.exitUrl.indexOf("?") != -1) {
							top.location.href = self.o.exitUrl+'&tour=true';		
						}else{
							top.location.href = self.o.exitUrl+'?tour=true';	
						}
					}
				}
	
		},		

		/**
		* Update...
		*
		* @param:
		**/
		update: function(param){ var self = this; },
				
		/**
		* Destroy...
		*
		* @param:
		**/
		destroy: function(param){ 
		
			var self = this; 
			
			/**	
			* Disable the trigger
			**/
			self.obj.addClass('tour-disabled');
			
			/**	
			* Remove the tour on ID.
			**/
			$('body')
			.find('.powertour-hook-relative[data-tour-id="'+self.o.tourId+'"]')
			.removeClass('powertour-hook-relative')
			.end()
			.find('.powertour[data-tour-id="'+self.o.tourId+'"], .powertour-time-ctrls[data-tour-id="'+self.o.tourId+'"], .powertour-time-timer[data-tour-id="'+self.o.tourId+'"]')
			.remove();
			
			self.obj.removeData(pluginName);
		}
		
	};

	$.fn[pluginName] = function(option, param) {
  		return this.each(function() {
			var $this   = $(this);
            var data    = $this.data(pluginName);
            var options = typeof option == 'object' && option;
			if (!data){ 
			  $this.data(pluginName, (data = new Plugin(this, options)))
			}
			if (typeof option == 'string'){
				 data[option](param);
			}
		});
	};
	
	/**
	* Default settings(dont change).
	* You can globally override these options
	* by using $.fn.pluginName.key = 'value';
	**/
	$.fn[pluginName].defaults = {
		tourId: Math.floor(Math.random()*1111),
		tourType: 'step',
		overlayOpacity: 0.5,
		showTimeControls: true,
		showTimer: true,
		timeButtonOrder: '%prev% %stop% %pause% %play% %next%',
		stepButtonOrder: '%prev% %next% %stop%',
		timerLabel: 'Next step in: ',			                    
		effectSpeed: 200,
		travelSpeed: 400,
		easingEffect: 'linear',
		easyCancel: true,
		animated: true,
		animatedOnEnd:true, 
		keyboardNavigation: true,
		runOnLoad: false,
		runOnLoadDelay: 2000,
		exitUrl: '',
		onStart: function(){},
		onFinish: function(){},
		onStop: function(){},	
		onCancel: function(){},
		step:[
			{
				hookTo: '',
				content: '',
				cloneTo: '',
				width: 300,
				arrowPosition: 'rt',
				showArrow: true,
				offsetY: 0,
				offsetX: 0,
				prevLabel: 'Prev',
				nextLabel: 'Next',
				stopLabel: 'Stop',
				center: 'hook',
				customClassStep: '',
				customClassHook: '',
				highlight: true,
				highlightElements: '',
				time: '01:00',
				onShowStep: function(){},
				onHideStep: function(){}
			}
		]
	};
		
})(jQuery, window, document);
