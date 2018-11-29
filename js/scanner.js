var scannerInterval;
var scannerRunning = false;

function startScanner(){
	if (scannerRunning == false){
		scannerRunning = true;
		var refreshRate = $('#refresh-rate').val();
		$('#refresh-rate').attr('disabled','disabled');
		scannerInterval = setInterval(scan, 1000 / refreshRate);
		alertMessage('Scanner is now running');
	}
}

function stopScanner(){
	clearInterval(scannerInterval);
	$('#refresh-rate').removeAttr('disabled');
	scannerRunning = false;
	alertMessage('Scanner has stopped');
}

function probe(gateID){ // get current output of gate
	if (gateID == 0) {
		return false;
	} else {
		return $('#canvas .gate[gate-id="' + gateID + '"]').attr('this-state') == 'true';
	}
}

function scan(){ // go one iteration forward in the simulation
	$('#canvas .gate').each(function(index){
		var type = $(this).attr('gate-type');
		var ID = $(this).attr('gate-id');
		var inputOne = $(this).attr('input-1');
		var inputTwo = $(this).attr('input-2');
		if (type == 'or'){
			$(this).attr('next-state', probe(inputOne) | probe(inputTwo));
		} else if (type == 'nor'){
			$(this).attr('next-state', !probe(inputOne) & !probe(inputTwo));
		} else if (type == 'and'){
			$(this).attr('next-state', probe(inputOne) & probe(inputTwo));
		} else if (type == 'nand'){
			$(this).attr('next-state', !(probe(inputOne) & probe(inputTwo)));
		} else if (type == 'xor'){
			$(this).attr('next-state', probe(inputOne) ^ probe(inputTwo));
		} else if (type == 'xnor'){
			$(this).attr('next-state', !probe(inputOne) ^ probe(inputTwo));
		} else if (type == 'not'){
			$(this).attr('next-state', !probe(inputOne));
		} else if (type == 'out'){
			$(this).attr('next-state', probe(inputOne));
		}
	});
	$('#canvas .gate').each(function(index){
		if ($(this).attr('gate-type') != 'inp'){
			$(this).attr('this-state', $(this).attr('next-state') == '1' || $(this).attr('next-state') == 'true');
		}
	});
	$('#canvas path').each(function(index){
		if (probe($(this).attr('input'))){
			$(this).addClass('active');
		} else {
			$(this).removeClass('active');
		}
	});
}