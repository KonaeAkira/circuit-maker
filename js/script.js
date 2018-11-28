var selectedType = 'none';
var selectedGate = 0;
var globalID = 0;
var modifyFlag = false;

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
		console.log('gate ' + rxID + ' has no inputs');
		return;
	} else if (rxType == 'not' || rxType == 'out') {
		if ($(rx).attr('input-1') != 0) {
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

function clickGate(caller){
	if (selectedType == 'none'){
		if (modifyFlag == true){
			toggleGate(caller);
		} else if (selectedGate == 0){
			selectGate(caller);
		} else {
			connectGates($('#canvas .gate[gate-id="' + selectedGate + '"]'), caller);
			clearSelectedGate();
		}
	}
}

$(document).ready(function(){
	
	$(document).mousemove(function(event){
		$('mouse-x').text(event.pageX);
		$('mouse-y').text(event.pageY);
	});
	
	$('#panel .gate-container').click(function(){
		selectType(this);
	});
	
	$(document).keydown(function(event){
     	if (event.key == 'Escape'){
        	clearSelectedType();
        } else if (event.key == 'Shift'){
        	modifyFlag = true;
        }
    });
    
    $(document).keyup(function(event){
    	if (event.key == 'Shift'){
    		modifyFlag = false;
    	}
    });
    
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
    
	$('#canvas').click(function(event){
		if (selectedType != 'none'){
			d3.select(this).append('image')
				.attr('href', 'img/' + selectedType + '.svg')
				.attr('class', 'gate unselected')
				.attr('x', parseInt(event.pageX / 8) * 8 - 35)
				.attr('y', parseInt(event.pageY / 8) * 8 - 16)
				.attr('width', '62px')
				.attr('height', '34px')
				.attr('gate-type', selectedType)
				.attr('gate-id', ++globalID)
				.attr('input-1', 0)
				.attr('input-2', 0)
				.attr('this-state', false)
				.attr('next-state', false)
				.attr('onclick', 'clickGate(this)');
		}
	});
	
	$('#canvas').on('dragstart', function(event){
		event.preventDefault();
	});
	
	$('#canvas #background').click(function(){
		clearSelectedGate();
	});
	
});
