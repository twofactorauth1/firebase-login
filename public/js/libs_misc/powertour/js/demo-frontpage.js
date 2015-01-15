$(document).ready(function($){
	$('body').powerTour({
		tours:[
				{
					trigger            : '#starttour-1',
					startWith          : 1,
					easyCancel         : true,
					escKeyCancel       : true,
					scrollHorizontal   : false,
					keyboardNavigation : true,
					loopTour           : false,
					onStartTour        : function(ui){ 
						
						// show bottom bar
						$('#demo-bar-footer').animate({bottom: 0},1000);	
													
					},
					onEndTour          : function(ui){
						
						// animate back to the top
						$('html, body').animate({scrollTop:0}, 1000, 'swing');	
						//$('html, body').animate({scrollLeft:0}, 1000, 'swing');	
						
						// progress meter hide and reset
						$('#progressmeter').children('#progressmeter-bar').width(0).next().text();
						
						// hide bottom bar
						$('#demo-bar-footer').animate({bottom: '-70px'},1000);	
						
					},	
					onProgress         : function(ui){ 

						// ui.stepInex returns a zero based number!
						var i       = (ui.stepIndex + 1);
						var total   = ui.totalSteps;
						var barSize = 100 / total * i+'%';

						// progress meter
						$('#progressmeter-text').html('<span>'+i+'</span> / '+total+'').prev('#progressmeter-bar').animate({width: barSize},400);
						
					},
					steps:[
							{
								hookTo          : '',//not needed
								content         : '#step-one',
								width           : 350,
								position        : 'str',
								offsetY         : -80,
								offsetX         : -50,
								fxIn            : 'lightSpeedIn',
								fxOut           : 'bounceOutLeft',
								showStepDelay   : 0,
								center          : 'step',
								scrollSpeed     : 400,
								scrollEasing    : 'swing',
								scrollDelay     : 0,
								timer           : '00:20',
								highlight       : false,
								keepHighlighted : false,
								onShowStep      : function(ui){	},
								onHideStep      : function(ui){ }
							},
							{
								hookTo          : '#hook-two',
								content         : '#step-two',
								width           : 435,
								position        : 'br',
								offsetY         : 80,
								offsetX         : 0,
								fxIn            : 'flipInX',
								fxOut           : 'flipOutY',
								showStepDelay   : 1000,
								center          : 'step',
								scrollSpeed     : 400,
								scrollEasing    : 'swing',
								scrollDelay     : 0,
								timer           : '00:00',
								highlight       : false,
								keepHighlighted : false,
								onShowStep      : function(ui){ 
									
									// fadd fx class to buy button
									$('#hook-two > .btn').addClass('colorfadingbutton');
									
								},
								onHideStep      : function(ui){

									// remove fx class from buy button
									$('#hook-two > .btn').removeClass('colorfadingbutton');	
									
								}
							},
							{
								hookTo          : '#fixed-social-bar',
								content         : '#step-three',
								width           : 360,
								position        : 'lt',
								offsetY         : 0,
								offsetX         : 20,
								fxIn            : 'slideInDown',
								fxOut           : 'slideOutUp',
								showStepDelay   : 500,
								center          : 'step',
								scrollSpeed     : 400,
								scrollEasing    : 'swing',
								scrollDelay     : 500,
								timer           : '00:30',
								highlight       : true,
								keepHighlighted : false,
								onShowStep      : function(ui){ },
								onHideStep      : function(ui){ }
							},
							{
								hookTo          : '#hook-four',
								content         : '#step-four',
								width           : 600,
								position        : 'rt',
								offsetY         : 80,
								offsetX         : 0,
								fxIn            : 'fadeInDown',
								fxOut           : 'fadeOut',
								showStepDelay   : 2000,
								center          : 'step',
								scrollSpeed     : 2000,
								scrollEasing    : 'swing',
								scrollDelay     : 1000,
								timer           : '00:00',
								highlight       : true,
								keepHighlighted : false,
								onShowStep      : function(ui){
									
									//show the helper images(demo so not needed)
									$('#highlightstep').delay(1000).fadeIn(500);
									$('#anycontent').delay(1500).fadeIn(500);
									$('#controls2').delay(2500).fadeIn(500);
									$('#highlighthook').delay(3000).fadeIn(500);
										
								},
								onHideStep      : function(ui){
									
									//hide the helper images(demo so not needed)
									$('#highlightstep, #anycontent, #highlighthook, #controls2').fadeOut(500);
									
								}
							},
							{
								hookTo          : '#hook-five',
								content         : '#step-five',
								width           : 500,
								position        : 'tm',
								offsetY         : 30,
								offsetX         : 0,
								fxIn            : 'fadeInUp',
								fxOut           : 'flipOutX',
								showStepDelay   : 500,
								center          : 'step',
								scrollSpeed     : 400,
								scrollEasing    : 'swing',
								scrollDelay     : 0,
								timer           : '00:00',
								highlight       : false,
								keepHighlighted : false,
								onShowStep      : function(ui){
								
									//$('#hook-four').delay(1000).fadeTo(500, 0.5);
									
									//show the helper images(demo so not needed)
									$('#connectors1').delay(1000).fadeIn(500);
									$('#connectors2').delay(1500).fadeIn(500);
									$('#controls1').delay(2000).fadeIn(500);
									
								},
								onHideStep      : function(ui){
	
									//hide the helper images(demo so not needed)
									$('#connectors1, #controls1, #connectors2').fadeOut(500);
				
								}
							},
							{
								hookTo          : '#hook-six',
								content         : '#step-six',
								width           : 360,
								position        : 'rt',
								offsetY         : 40,
								offsetX         : 40,
								fxIn            : 'bounceInRight',
								fxOut           : 'fadeOut',
								showStepDelay   : 500,
								center          : 'step',
								scrollSpeed     : 400,
								scrollEasing    : 'swing',
								scrollDelay     : 0,
								timer           : '00:00',
								highlight       : false,
								keepHighlighted : false,
								onShowStep      : function(ui){ 

									// button variable
									var nextBtn = ui.currentStep.find('[data-powertour-action=next]');
									
									// disable the next button at default
									$('body').attr('data-powertour-disable-next', true);
									
									// add a visual class to the button at default
									nextBtn.addClass('btn-disabled');
									
									// validate the input
									$('#step-validation-input-1').keyup(function(e){
										if($(this).val().length > 3){
											
											// enable the next button 
											$('body').removeAttr('data-powertour-disable-next');

											// remove the visual class from the button
											nextBtn.removeClass('btn-disabled');
											
											// add a visual class to the input
											$(this).addClass('input-valid');
									
										}
									});

								},
								onHideStep      : function(ui){

									// remove the next button again
									$('body').removeAttr('data-powertour-disable-next');
									
									// remove class and clear the input after
									$('#step-validation-input-1').removeClass('input-valid').val('');
										
								}
							},
							{
								hookTo          : '#hook-seven',
								content         : '#step-seven',
								width           : 405,
								position        : 'lm',
								offsetY         : 50,
								offsetX         : 0,
								fxIn            : 'fadeIn',
								fxOut           : 'fadeOut',
								showStepDelay   : 500,
								center          : 'step',
								scrollSpeed     : 400,
								scrollEasing    : 'swing',
								scrollDelay     : 0,
								timer           : '00:00',
								highlight       : false,
								keepHighlighted : false,
								onShowStep      : function(ui){
									
									// load the content with AJAX and update position
									$('#step-seven').load('AJAX/ajaxcontent.html',function(){ 
										$('body').powerTour('update', '#step-seven');
									});

								},
								onHideStep      : function(ui){ }
							},
							{
								hookTo          : '#hook-eight',
								content         : '#step-eight',
								width           : 400,
								position        : 'sc',
								offsetY         : 50,
								offsetX         : 0,
								fxIn            : 'fadeIn',
								fxOut           : 'fadeOut',
								showStepDelay   : 500,
								center          : 'step',
								scrollSpeed     : 400,
								scrollEasing    : 'swing',
								scrollDelay     : 0,
								timer           : '00:00',
								highlight       : true,
								keepHighlighted : true,
								onShowStep      : function(ui){	},
								onHideStep      : function(ui){ }
							},
							{
								hookTo          : '',
								content         : '#step-nine',
								width           : 405,
								position        : 'sc',
								offsetY         : 50,
								offsetX         : 0,
								fxIn            : 'fadeIn',
								fxOut           : 'fadeOut',
								showStepDelay   : 500,
								center          : 'step',
								scrollSpeed     : 400,
								scrollEasing    : 'swing',
								scrollDelay     : 0,
								timer           : '00:10',
								highlight       : true,
								keepHighlighted : true,
								onShowStep      : function(ui){	},
								onHideStep      : function(ui){ }
							}	
					],
					stepDefaults:[
							{
								width           : 300,
								position        : 'tr',
								offsetY         : 0,
								offsetX         : 0,
								fxIn            : 'fadeIn',
								fxOut           : 'fadeOut',
								showStepDelay   : 0,
								center          : 'step',
								scrollSpeed     : 400,
								scrollEasing    : 'swing',
								scrollDelay     : 0,
								timer           : '00:00',
								highlight       : true,
								keepHighlighted : false,
								onShowStep      : function(ui){ },
								onHideStep      : function(ui){ }
							}
					]
				},
				{
					trigger            : '#starttour-2',
					startWith          : 1,
					easyCancel         : true,
					escKeyCancel       : true,
					scrollHorizontal   : false,
					keyboardNavigation : true,
					loopTour           : false,
					onStartTour        : function(ui){ },
					onEndTour          : function(){

						// animate back to the top
						$('html, body').animate({scrollTop:0}, 1000, 'swing');	
						//$('html, body').animate({scrollLeft:0}, 1000, 'swing');	
						
					},	
					onProgress         : function(ui){ },
					steps:[
							{
								hookTo          : '',//not needed
								content         : '#step-1',
								width           : 400,
								position        : 'sc',
								offsetY         : 0,
								offsetX         : 0,
								fxIn            : 'fadeIn',
								fxOut           : 'bounceOutUp',
								showStepDelay   : 500,
								center          : 'step',
								scrollSpeed     : 400,
								scrollEasing    : 'swing',
								scrollDelay     : 0,
								timer           : '00:00',
								highlight       : true,
								keepHighlighted : true,
								onShowStep      : function(ui){ },
								onHideStep      : function(ui){ }
							},
							{
								hookTo          : '',//not needed
								content         : '#step-2',
								width           : 400,
								position        : 'sc',
								offsetY         : 0,
								offsetX         : 0,
								fxIn            : 'fadeIn',
								fxOut           : 'bounceOutLeft',
								showStepDelay   : 1000,
								center          : 'step',
								scrollSpeed     : 400,
								scrollEasing    : 'swing',
								scrollDelay     : 0,
								timer           : '00:00',
								highlight       : true,
								keepHighlighted : true,
								onShowStep      : function(ui){ },
								onHideStep      : function(ui){ }
							},
							{
								hookTo          : '',//not needed
								content         : '#step-3',
								width           : 400,
								position        : 'sc',
								offsetY         : 0,
								offsetX         : 0,
								fxIn            : 'fadeIn',
								fxOut           : 'bounceOutRight',
								showStepDelay   : 1000,
								center          : 'step',
								scrollSpeed     : 400,
								scrollEasing    : 'swing',
								scrollDelay     : 0,
								timer           : '00:00',
								highlight       : true,
								keepHighlighted : true,
								onShowStep      : function(ui){ },
								onHideStep      : function(ui){ }
							}
					],
					stepDefaults:[
							{
								width           : 500,
								position        : 'tr',
								offsetY         : 0,
								offsetX         : 0,
								fxIn            : '',
								fxOut           : '',
								showStepDelay   : 0,
								center          : 'step',
								scrollSpeed     : 200,
								scrollEasing    : 'swing',
								scrollDelay     : 0,
								timer           : '00:00',
								highlight       : true,
								keepHighlighted : false,
								onShowStep      : function(){ },
								onHideStep      : function(){ }
							}
					]
				}
			]
	});
});
