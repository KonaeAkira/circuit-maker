var selectedType = 'none';
var selectedGate = 0;
var globalID = 0;
var modifyFlag = false;

var clicked = false;
var clickY, clickX;

const gateWidth = 62;
const gateHeight = 34;

function selectType(caller){
	$('.gate-container.selected').removeClass('selected').addClass('unselected');
	$(caller).removeClass('unselected').addClass('selected');
	selectedType = $(caller).attr('gate-type');
	console.log('gate-type: ' + selectedType);
}

function clearSelectedType(){
	$('.gate-container.selected').removeClass('selected').addClass('unselected');
	selectedType = 'none';
	$('#canvas .gate-temporary').remove();
}

function connectGates(tx, rx){

	var txID = $(tx).attr('gate-id');
	var txType = $(tx).attr('gate-type');
	var rxID = $(rx).attr('gate-id');
	var rxType = $(rx).attr('gate-type');
	
	var x1 = parseInt($(tx).attr('x')) + gateWidth * 0.9437;
	var y1 = parseInt($(tx).attr('y')) + gateHeight / 2;
	var x2 = parseInt($(rx).attr('x')) + gateWidth * 0.0562;
	var y2 = parseInt($(rx).attr('y')) + gateHeight / 2;
	
	if (rxType == 'inp') {
		alertError('Target gate has no inputs');
		console.log('gate ' + rxID + ' has no inputs');
		return;
	} else if (rxType == 'not' || rxType == 'out') {
		if ($(rx).attr('input-1') != 0) {
			alertError('Target gate has no free inputs');
			console.log('input of gate ' + rxID + ' is full');
			return;
		}
		$(rx).attr('input-1', txID);
	} else {
		if ($(rx).attr('input-1') == 0) {
			$(rx).attr('input-1', txID);
			y2 = parseInt($(rx).attr('y')) + gateHeight * 0.3;
		} else if ($(rx).attr('input-2') == 0) {
			$(rx).attr('input-2', txID);
			y2 = parseInt($(rx).attr('y')) + gateHeight * 0.7;
		} else {
			alertError('Target gate has no free inputs');
			console.log('input of gate ' + rxID + ' is full');
			return;
		}
	}
	
	d3.select('#canvas').append('path')
		.attr('d', 'M ' + x1 + ' ' + y1 + ' H ' + (x1 + x2) / 2 + ' V ' + y2 + ' H ' + x2)
		.attr('stroke', 'black')
		.attr('stroke-width', '1.25')
		.attr('fill', 'none')
		.attr('input', txID)
		.attr('output', rxID);
	console.log('connect ' + txID + '->' + rxID);
	
}

function selectGate(caller){
	$('#canvas .gate.selected').removeClass('selected').addClass('unselected');
	$(caller).removeClass('unselected').addClass('selected');
	selectedGate = $(caller).attr('gate-id');
	console.log('gate-id: ' + selectedGate);
}

function clearSelectedGate(){
	$('#canvas .gate.selected').removeClass('selected').addClass('unselected');
	selectedGate = 0;
}

function toggleGate(caller){
	if ($(caller).attr('gate-type') == 'inp'){
		$(caller).attr('this-state', $(caller).attr('this-state') == 'false');
		$(caller).attr('next-state', $(caller).attr('next-state') == 'false');
		console.log('switched gate ' + $(caller).attr('gate-id') + ' to ' + $(caller).attr('this-state'));
	}
}

function updateScrollPos(event) {
    $('html').css('cursor', 'grabbing');
    $(window).scrollTop($(window).scrollTop() + (clickY - event.pageY));
	$(window).scrollLeft($(window).scrollLeft() + (clickX - event.pageX));
}

$(document).ready(function(){
	
	$(window).scrollTop($('#canvas').height() / 2 - window.innerHeight / 2);
	$(window).scrollLeft($('#canvas').width() / 2 - window.innerWidth / 2);
	
	$('#canvas').on({'mousemove': function(event){ // handle drag-scrolling on the canvas
        clicked && updateScrollPos(event);
    }, 'mousedown': function(event) {
        clicked = true;
        clickY = event.pageY;
		clickX = event.pageX;
    }, 'mouseup': function() {
        clicked = false;
        $('html').css('cursor', 'auto');
    }});
	
	$(window).mousemove(function(event){
		$('mouse-x').text(event.pageX - $('#canvas').width() / 2);
		$('mouse-y').text(event.pageY - $('#canvas').height() / 2);
	});
	
	$('#panel .gate-container').click(function(){
		selectType(this);
	});
    
	// draw a preview of a gate on the canvas
    $('#canvas').mousemove(function(event){
    	if (selectedType != 'none'){ 
    		$('#canvas .gate-temporary').remove();
    		d3.select(this).append('image')
				.attr('class', 'gate-temporary')
				.attr('href', 'img/' + selectedType + '.svg')
				.attr('x', parseInt(event.pageX / 8) * 8 - 35)
				.attr('y', parseInt(event.pageY / 8) * 8 - 16)
				.attr('width', '62px')
				.attr('height', '34px');
    	}
    });
    
	// draw a new gate on the canvas
	$('#canvas').click(function(event){
		if (selectedType != 'none'){
			var gate = d3.select(this).append('image')
				.attr('href', 'img/' + selectedType + '.svg')
				.attr('class', 'gate unselected no-contextmenu')
				.attr('x', parseInt(event.pageX / 8) * 8 - 35)
				.attr('y', parseInt(event.pageY / 8) * 8 - 16)
				.attr('width', '62px')
				.attr('height', '34px')
				.attr('gate-type', selectedType)
				.attr('gate-id', ++globalID)
				.attr('input-1', 0)
				.attr('input-2', 0)
				.attr('this-state', false)
				.attr('next-state', false);
		}
	});
	
	// prevent dragging
	$('*').on('dragstart', function(event){
		event.preventDefault();
	});
	
	// prevent context menu
	$('*').on('contextmenu', function(event) {
		event.preventDefault();
	});
	
	// clear selected type events
	$(document).keydown(function(event){
     	if (event.key == 'Escape'){
        	clearSelectedType();
        }
    });
	
	// clear selected gate events
	$('#canvas #background').click(function(){ // clear selected gate when clicking on the background
		clearSelectedGate();
	});
	$('*').on('contextmenu', function(event) {
		clearSelectedType();
	});
	
	// modifier key events
	$(document).keydown(function(event){
     	if (event.key == 'Shift'){
        	modifyFlag = true;
        }
    });
    $(document).keyup(function(event){
    	if (event.key == 'Shift'){
    		modifyFlag = false;
    	}
    });
	
	// mouse events for gates on canvas
	$('#canvas').on('mousedown', 'image', function(event){
		switch (event.which) {
			case 1: // left mouse
				if (selectedType == 'none'){
					if (modifyFlag == true){ // shift + left mouse --> remove gate
						var ID = $(this).attr('gate-id');
						$('#canvas path').each(function(index){
							var inputID = $(this).attr('input');
							var outputID = $(this).attr('output');
							if (inputID == ID || outputID == ID) {
								var target = $('#canvas .gate[gate-id="' + outputID + '"]');
								if ($(target).attr('input-1') == inputID){
									$(target).attr('input-1', 0);
								}
								if ($(target).attr('input-2') == inputID){
									$(target).attr('input-2', 0);
								}
								$(this).remove();
							}
						});
						$(this).remove();
					} else if (selectedGate == 0){ // no gate is selected --> select gate for wiring
						selectGate(this);
					} else { // there is already a selected gate --> connect that gate(tx) to this gate(rx)
						connectGates($('#canvas .gate[gate-id="' + selectedGate + '"]'), this);
						clearSelectedGate();
					}
				}
				break;
			case 3: // right mouse --> toggle gate
				toggleGate(this);
				break;
		}
	});
	
	// scanner control ui updater
	$('#refresh-rate-display').text($('#refresh-rate').val() + 'Hz');
	$('#refresh-rate').on('input', function(){
		$('#refresh-rate-display').text(this.value + 'Hz');
	});
	
});
