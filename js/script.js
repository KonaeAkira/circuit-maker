var selectedType = 'none';
var selectedGate = 0;
var globalID = 0;

function selectType(caller){
	$('.gate-container.selected').removeClass('selected').addClass('unselected');
	$(caller).removeClass('unselected').addClass('selected');
	selectedType = $(caller).attr('gate-type');
	console.log('gate-type: ' + selectedType);
}

function clearSelectedType(){
	$('.gate-container.selected').removeClass('selected').addClass('unselected');
	selectedType = 'none';
}

function connectGates(tx, rx){
	var txID = $(tx).attr('gate-id');
	var rxID = $(rx).attr('gate-id');
	var x1 = parseInt($(tx).attr('x')) + 60.5;
	var y1 = parseInt($(tx).attr('y')) + 16;
	var x2 = parseInt($(rx).attr('x')) + 3.5;
	var y2 = 0;
	if ($(rx).attr('input-1') == 0){
		$(rx).attr('input-1', txID);
		if ($(rx).attr('gate-type') != 'not') {
			y2 = parseInt($(rx).attr('y')) + 9.65;
		} else {
			y2 = parseInt($(rx).attr('y')) + 16;
		}
	} else if ($(rx).attr('input-2') == 0 && $(rx).attr('gate-type') != 'not') {
		$(rx).attr('input-2', txID);
		y2 = parseInt($(rx).attr('y')) + 22.25;
	} else {
		console.log('input of gate ' + rxID + ' is full');
		return;
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
	if (selectedType == 'none') {
		if (selectedGate == 0) {
			$('#canvas .gate.selected').removeClass('selected').addClass('unselected');
			$(caller).removeClass('unselected').addClass('selected');
			selectedGate = $(caller).attr('gate-id');
			console.log('gate-id: ' + selectedGate);
		} else {
			connectGates($('#canvas .gate[gate-id="' + selectedGate + '"]'), caller);
			clearSelectedGate();
		}
	}
}

function clearSelectedGate(){
	$('#canvas .gate.selected').removeClass('selected').addClass('unselected');
	selectedGate = 0;
}

$(document).ready(function(){
	
	$(document).mousemove(function(event){
		$('mouse-x').text(event.pageX);
		$('mouse-y').text(event.pageY);
	});
	
	$('#panel .gate-container').click(function(){
		selectType(this);
	});
	
	$(document).keyup(function(event){
     	if (event.key == 'Escape'){
        	clearSelectedType();
        }
    });
    
	$('#canvas').click(function(event){
		if (selectedType != 'none'){
			d3.select(this).append('image')
				.attr('href', 'img/' + selectedType + '.svg')
				.attr('class', 'gate unselected')
				.attr('x', event.pageX - 32)
				.attr('y', event.pageY - 16)
				.attr('width', '64px')
				.attr('height', '32px')
				.attr('gate-type', selectedType)
				.attr('gate-id', ++globalID)
				.attr('input-1', 0)
				.attr('input-2', 0)
				.attr('this-state', 0)
				.attr('next-state', 0)
				.attr('onclick', 'selectGate(this)');
			}
	});
	
	$('#canvas').on('dragstart', function(event){
		event.preventDefault();
	});
	
	$('#canvas #background').click(function(){
		clearSelectedGate();
	});
	
});
