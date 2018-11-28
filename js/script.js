$(document).ready(function(){
	var selectedGate = 'or';
	$(document).mousemove(function(event){
		$('mouse-x').text(event.pageX);
		$('mouse-y').text(event.pageY);
	});
	$('#panel .gate-container').click(function(){
		$('.selected').removeClass('selected').addClass('unselected');
		$(this).removeClass('unselected').addClass('selected');
		selectedGate = $(this).attr('gate-type');
	});
	$('#canvas').hover(function(){
		
	});
	$('#canvas').click(function(event){
		var img = d3.select(this).append('image')
			.attr('href', 'img/' + selectedGate + '.png')
			.attr('x', event.pageX - 48)
			.attr('y', event.pageY - 48)
			.attr('width', '96px')
			.attr('height', '96px');
	});
});
