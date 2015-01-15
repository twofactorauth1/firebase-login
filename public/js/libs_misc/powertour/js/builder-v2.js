$(document).ready(function($){
	// toggle accordions
	$('body').on('click', '.accordion > h5 .toggle', function(e){
		var ac = $(this).closest('.accordion');
		if(ac.hasClass('accordion-closed')){
			ac.removeClass('accordion-closed');
			$(this).html('<i class="fa fa-minus"></i>');		
		}else{
			ac.addClass('accordion-closed');
			$(this).html('<i class="fa fa-plus"></i>');	
		}
	});
	// delete tours
	$('body').on('click', '.accordion > h5 .delete-tour', function(e){
		if($('#tour-stack').find('.tour-wrapper').length != 1){
			var r = confirm("Delete this tour?");
			if(r == true){
				$(this).closest('.tour-wrapper').remove(); 
			}
		}
		setIndexes();
		e.preventDefault();
	});
	// delete steps
	$('body').on('click', '.accordion > h5 .delete-step', function(e){
		if($(this).parents('#step-stack').find('.step-wrapper').length != 1){
			var r = confirm("Delete this step?");
			if(r == true){
				$(this).closest('.step-wrapper').remove(); 
			}
		}
		setIndexes();
		e.preventDefault();
	});

    // update index values
	function setIndexes(){
		$('.tour-wrapper').each(function(i,e){
			$(this).children('h5').children('i').text(i+1);
			
			$(this).find('.step-wrapper').each(function(i,e){
				$(this).children('h5').children('i').text(i+1);
			});
		});
	}

	// clone tour
	$('body').on('click', '.addnewtourtostack', function(e){
		$('.tour-wrapper:last').clone().insertAfter($('#tour-stack').children('.tour-wrapper:last')).find('.step-wrapper').not(':first').remove().parents('.tour-wrapper').show();
		setIndexes();
		e.preventDefault();
	});
		
	// clone step
	$('body').on('click', '.addnewsteptostack', function(e){
		var lastStep = $(this).parents('#step-stack').children('.step-wrapper:last')
		lastStep.clone().insertAfter(lastStep);
		setIndexes();
		e.preventDefault();
	});
	
	// drag builder boxes
	if($('#tour-stack').length > 0){
		$("#tour-stack").sortable({
			items: '.tour-wrapper',
			handle: '.handle-tour',
			axis: 'y',
			opacity: 0.8,
			update:function(ui){
				setIndexes();
			}
			
		});
		$("#step-stack").sortable({
			items: '.step-wrapper',
			handle: '.handle-step',
			axis: 'y',
			opacity: 0.8,
			update:function(ui){
				setIndexes();
			}
		});
	}
	// builder
	$('#generateoutput').click(function(e){
		var output = '';
		var tl     = $('.tour-wrapper').length;
		
		output += "$('body').powerTour({";
		output += '\n';
		output += 'tours: [';
	    output += '\n';
		
		// tours	
		$('.tour-wrapper').each(function(i,e){
			var sl = $(this).find('.step-wrapper').length;
			
			output += '{';
			output += '\n';
			output += 'trigger:"'+$(this).find("[name=trigger-a]").val()+''+$(this).find("[name=trigger-b]").val()+'",\n';
			output += 'startWith:'+$(this).find("[name=startWith]").val()+',\n';
			output += 'easyCancel:'+$(this).find("[name=easyCancel]").val()+',\n';
			output += 'escKeyCancel:'+$(this).find("[name=escKeyCancel]").val()+',\n';
			output += 'scrollDirection:"'+$(this).find("[name=scrollDirection]").val()+'",\n';
			output += 'keyboardNavigation:'+$(this).find("[name=keyboardNavigation]").val()+',\n';
			output += 'loopTour:'+$(this).find("[name=loopTour]").val()+',\n';
			output += 'onStartTour:'+$(this).find("[name=onStartTour]").val()+',\n';
			output += 'onEndTour:'+$(this).find("[name=onStopTour]").val()+',\n';
			output += 'onProgress:'+$(this).find("[name=onProgress]").val()+',\n';
			output += 'steps: [';
			output += '\n';
			
			// steps
			$(this).find('.step-wrapper').each(function(ii,ee){
				output += '{';
				output += '\n';
				output += 'hookTo:"'+$(this).find("[name=hookTo-a]").val()+''+$(this).find("[name=hookTo-b]").val()+'",\n';
				output += 'content:"'+$(this).find("[name=content-a]").val()+''+$(this).find("[name=content-b]").val()+'",\n';
				output += 'width:'+$(this).find("[name=width]").val()+',\n';
				output += 'position:"'+$(this).find("[name=position]").val()+'",\n';
				output += 'offsetY:'+$(this).find("[name=offsetY]").val()+',\n';
				output += 'offsetX:'+$(this).find("[name=offsetX]").val()+',\n';
				output += 'fxIn:"'+$(this).find("[name=fxIn]").val()+'",\n';
				output += 'fxOut:"'+$(this).find("[name=fxOut]").val()+'",\n';
				output += 'showStepDelay:'+$(this).find("[name=showStepDelay]").val()+',\n';
				output += 'center:"'+$(this).find("[name=center]").val()+'",\n';
				output += 'scrollSpeed:'+$(this).find("[name=scrollSpeed]").val()+',\n';
				output += 'scrollEasing:"'+$(this).find("[name=scrollEasing]").val()+'",\n';
				output += 'scrollDelay:'+$(this).find("[name=scrollDelay]").val()+',\n';
				output += 'timer:"'+$(this).find("[name=timer]").val()+'",\n';
				output += 'highlight:"'+$(this).find("[name=highlight]").val()+'",\n';
				output += 'keepHighlighted:"'+$(this).find("[name=keepHighlighted]").val()+'",\n';
				output += 'onShowStep:'+$(this).find("[name=onShowStep]").val()+',\n';
				output += 'onHideStep:'+$(this).find("[name=onHideStep]").val()+'\n';
			
				// end
				if(parseInt(sl - 1) == ii){
					output += '}';
					output += '\n';
				}else{
					output += '},';
					output += '\n';
			
				}
			});
			
			output += '],';
			output += '\n';
			
			output += 'stepDefaults: [';
				output += '\n';
				output += '{';
				output += '\n';			
				output += 'width:'+$(this).find("[name=default-width]").val()+',\n';
				output += 'position:"'+$(this).find("[name=default-position]").val()+'",\n';
				output += 'offsetY:'+$(this).find("[name=default-offsetY]").val()+',\n';
				output += 'offsetX:'+$(this).find("[name=default-offsetX]").val()+',\n';
				output += 'fxIn:"'+$(this).find("[name=default-fxIn]").val()+'",\n';
				output += 'fxOut:"'+$(this).find("[name=default-fxOut]").val()+'",\n';
				output += 'showStepDelay:'+$(this).find("[name=default-showStepDelay]").val()+',\n';
				output += 'center:"'+$(this).find("[name=default-center]").val()+'",\n';
				output += 'scrollSpeed:'+$(this).find("[name=default-scrollSpeed]").val()+',\n';
				output += 'scrollEasing:"'+$(this).find("[name=default-scrollEasing]").val()+'",\n';
				output += 'scrollDelay:'+$(this).find("[name=default-scrollDelay]").val()+',\n';
				output += 'timer:"'+$(this).find("[name=default-timer]").val()+'",\n';
				output += 'highlight:"'+$(this).find("[name=default-highlight]").val()+'",\n';
				output += 'keepHighlighted:"'+$(this).find("[name=default-keepHighlighted]").val()+'",\n';
				output += 'onShowStep:'+$(this).find("[name=default-onShowStep]").val()+',\n';
				output += 'onHideStep:'+$(this).find("[name=default-onHideStep]").val()+'\n';
				output += '}';
				output += '\n';
				output += ']';
				output += '\n';
				
			// end
			if(parseInt(tl - 1) == i){
		
				output += '}';
				output += '\n';
			}else{
				//
				output += '},';
				output += '\n';
			
			}
		});
		output += ']'
		output += '\n';
		output += '});'

		// output 
		$('#outputplugin').html(output);
		e.preventDefault();
	});
});
