var scannerInterval;
var scannerRunning = false;

function startScanner(){
	if (scannerRunning == false){
		scannerRunning = true;
		var refreshRate = $('#refresh-rate').val();
		$('#refresh-rate').attr('disabled','disabled');
		scannerInterval = setInterval(scan, 1000 / refreshRate);
		alertMessage('Scanner is <b>running</b>');
	}
}

function stopScanner(){
	clearInterval(scannerInterval);
	$('#refresh-rate').removeAttr('disabled');
	scannerRunning = false;
	alertMessage('Scanner has <b>stopped</b>');
}

function toggleScanner() {
	if (scannerRunning == false) {
		startScanner();
	} else {
		stopScanner();
	}
}

function probe(gateID){ // get current output of gate
	if (gateID == 0) {
		return false;
	} else {
		return $('#canvas .gate[gate-id="' + gateID + '"]').attr('state') == 'true';
	}
}

function scan() { // go one iteration forward in the simulation
	$('#canvas .gate').each(function(index){
		var type = $(this).attr('gate-type');
		var ID = $(this).attr('gate-id');
		var inputOne = $(this).attr('inp-1');
		var inputTwo = $(this).attr('inp-2');
		if (type == 'or'){
			$(this).attr('buffer', probe(inputOne) | probe(inputTwo));
		} else if (type == 'nor'){
			$(this).attr('buffer', !probe(inputOne) & !probe(inputTwo));
		} else if (type == 'and'){
			$(this).attr('buffer', probe(inputOne) & probe(inputTwo));
		} else if (type == 'nand'){
			$(this).attr('buffer', !(probe(inputOne) & probe(inputTwo)));
		} else if (type == 'xor'){
			$(this).attr('buffer', probe(inputOne) ^ probe(inputTwo));
		} else if (type == 'xnor'){
			$(this).attr('buffer', !probe(inputOne) ^ probe(inputTwo));
		} else if (type == 'not'){
			$(this).attr('buffer', !probe(inputOne));
		} else if (type == 'out'){
			$(this).attr('buffer', probe(inputOne));
		}
	});
	$('#canvas .gate').each(function(index){
		if ($(this).attr('gate-type') != 'inp'){
			$(this).attr('state', $(this).attr('buffer') == '1' || $(this).attr('buffer') == 'true');
		}
	});
	$('#canvas path').each(function(index){
		if (probe($(this).attr('inp'))){
			$(this).addClass('active');
		} else {
			$(this).removeClass('active');
		}
	});
}