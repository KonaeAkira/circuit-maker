var alertTimeout;

function alertError(message){
	clearTimeout(alertTimeout);
	$('#alert-box').attr('class', 'error-box');
	$('#alert-box').html('<b>Error:</b> ' + message);
	$('#alert-box').css('display', 'block');
	alertTimeout = setTimeout(function(){
		$('#alert-box').css('display', 'none');
	}, 3000);
}

function alertMessage(message){
	clearTimeout(alertTimeout);
	$('#alert-box').attr('class', 'message-box');
	$('#alert-box').html('<b>Note:</b> ' + message);
	$('#alert-box').css('display', 'block');
	alertTimeout = setTimeout(function(){
		$('#alert-box').css('display', 'none');
	}, 3000);
}