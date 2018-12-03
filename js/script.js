const gateWidth = 72;
const gateHeight = 40;

var globalID = 0;

function clearEvents() {
	updateStorage()
	// typeSelect
	$('#canvas').off('mousemove');
	$('.gate-container.selected')
        .removeClass('selected')
        .addClass('unselected');
	$('#canvas .gate-temp').remove();
	$('#canvas').off('click');
	// drawLine
	$('#canvas #background').off('click');
	$('#canvas .wire-current').remove();
	$('#canvas').off('mouseup', '.gate');
	$('#canvas').on('mouseup', '.gate', gateClick);
	$('#canvas .wire-temp').remove();
	// re-add lost default events
	$('#canvas').on({
		'mousemove': function (event) {
			clicked && updateScrollPos(event);
		},
		'mousedown': function (event) {
			clicked = true;
			clickY = event.pageY;
			clickX = event.pageX;
		},
		'mouseup': function () {
			clicked = false;
			$('html').css('cursor', 'auto');
		}
	});
	$(window).mousemove(function (event) {
		$('mouse-x').text(event.pageX - $('#canvas').width() / 2);
		$('mouse-y').text(event.pageY - $('#canvas').height() / 2);
	});
}

function snap(value) {
	return parseInt(value / 8) * 8;
}

function typeSelect(event) {
	clearEvents();
	$('.gate-container.selected')
        .removeClass('selected')
        .addClass('unselected');
	$(event.currentTarget)
        .removeClass('unselected')
        .addClass('selected');
	var type = $(event.currentTarget).attr('gate-type');
	$('#canvas').on('mousemove', function (event) {
		$('#canvas .gate-temp').remove();
		d3
			.select('#canvas')
			.append('image')
			.attr('class', 'gate-temp')
			.attr('href', 'img/' + type + '.svg')
			.attr('x', snap(event.pageX) - gateWidth / 2)
			.attr('y', snap(event.pageY) - gateHeight / 2)
			.attr('width', gateWidth + 'px')
			.attr('height', gateHeight + 'px');
	});
	$('#canvas').on('click', function (event) {
		d3
			.select('#canvas')
			.append('image')
			.attr('class', 'gate')
			.attr('href', 'img/' + type + '.svg')
			.attr('x', snap(event.pageX) - gateWidth / 2)
			.attr('y', snap(event.pageY) - gateHeight / 2)
			.attr('width', gateWidth + 'px')
			.attr('height', gateHeight + 'px')
			.attr('gate-type',type)
			.attr('gate-id', ++globalID)
			.attr('inp-1', 0)
			.attr('inp-2', 0)
			.attr('state', "false")
			.attr('buffer', "false");
		clearEvents();
	});
}

function drawLine(event) {
	clearEvents();
	var inp = $(event.currentTarget).attr('gate-id');
	var out = 0;
    var curX = snap(parseInt($(event.currentTarget).attr('x')) + gateWidth);
    var curY = snap(parseInt($(event.currentTarget).attr('y')) + gateHeight / 2);
    d3
        .select('#canvas')
        .append('path')
        .attr('class', 'wire-current')
        .attr('d', 'M ' + curX + ' ' + curY)
        .attr('stroke', 'black')
        .attr('stroke-width', '1.25')
        .attr('fill', 'none')
        .attr('inp', inp)
        .attr('out', out);
    var curPath = $('#canvas .wire-current');
	$('#canvas #background').on('click', function (event) {
		var tarX = snap(event.pageX);
		var tarY = snap(event.pageY);
		var path = $(curPath).attr('d');
		$(curPath).attr('d', path + ' H ' + snap((curX + tarX) / 2) + ' V ' + tarY + ' H ' + tarX);
		curX = tarX;
		curY = tarY;
    });
	$('#canvas').on('mouseup', '.gate', function (event) {
		console.log(event);
		var out = $(event.currentTarget).attr('gate-id');
		var type = $(event.currentTarget).attr('gate-type');
		var tarX = snap(parseInt($(event.currentTarget).attr('x'))) + 8;
		var tarY = snap(parseInt($(event.currentTarget).attr('y')) + gateHeight / 2);
		if (type == 'inp') {
			alertError('Target gate has no inputs');
			clearEvents();
			return;
		} else if (type == 'not' || type == 'out') {
			if ($(event.currentTarget).attr('inp-1') != 0) {
				alertError('Target gate has no free inputs');
				clearEvents();
				return;
			}
			$(event.currentTarget).attr('inp-1', inp);
		} else {
			if ($(event.currentTarget).attr('inp-1') == 0) {
				$(event.currentTarget).attr('inp-1', inp);
				tarY = snap(parseInt($(event.currentTarget).attr('y')) + gateHeight * 0.3);
			} else if ($(event.currentTarget).attr('inp-2') == 0) {
				$(event.currentTarget).attr('inp-2', inp);
				tarY = snap(parseInt($(event.currentTarget).attr('y')) + gateHeight * 0.7);
			} else {
				alertError('Target gate has no free inputs');
				clearEvents();
				return;
			}
		}
		var path = $(curPath).attr('d');
		$(curPath)
			.attr('d', path + ' H ' + snap((curX + tarX) / 2) + ' V ' + tarY + ' H ' + tarX)
			.attr('out', out)
			.removeClass('wire-current')
			.addClass('wire');
		clearEvents();
	});
	$('#canvas').mousemove(function (event) {
		var tarX = snap(event.pageX);
		var tarY = snap(event.pageY);
		$('#canvas .wire-temp').remove();
		d3
			.select('#canvas')
			.append('path')
			.attr('class', 'wire-temp')
			.attr('d', 'M ' + curX + ' ' + curY + ' H ' + snap((curX + tarX) / 2) + ' V ' + tarY + ' H ' + tarX)
			.attr('stroke', 'gray')
			.attr('stroke-width', '1.25')
			.attr('fill', 'none');
	});
}

function removeGate(event) {
	clearEvents();
    var id = $(event.currentTarget).attr('gate-id');
    $('#canvas .wire').each(function (index) {
        var inp = $(this).attr('inp');
        var out = $(this).attr('out');
        if (inp == id || out == id) {
            var tar = $('#canvas .gate[gate-id="' + out + '"]');
            if ($(tar).attr('inp-1') == inp) {
                $(tar).attr('inp-1', 0);
            }
            if ($(tar).attr('inp-2') == inp) {
                $(tar).attr('inp-2', 0);
            }
            $(this).remove();
        }
    });
    $(event.currentTarget).remove();
}

function toggleGate(event) {
	clearEvents();
	if ($(event.currentTarget).attr('gate-type') == 'inp') {
		$(event.currentTarget).attr('state', $(event.currentTarget).attr('state') == 'false');
	}
}

function gateClick(event) {
	switch (event.which) {
		case 1: // left click
			if ($('#canvas .wire-current').length == 0) {
				drawLine(event);
			}
			break;
		case 2: // middle click
			removeGate(event);
			break;
		case 3: // right click
			toggleGate(event);
			break;
	}
}

function removeWire(event) {
	clearEvents();
	var inp = $(event.currentTarget).attr('inp');
    var out = $(event.currentTarget).attr('out');
    var tar = $('#canvas .gate[gate-id="' + out + '"]');
    if (tar.attr('inp-1') == inp) {
        tar.attr('inp-1', 0);
    } else if (tar.attr('inp-2') == inp) {
        tar.attr('inp-2', 0);
    }
    $(event.currentTarget).remove();
}

function wireClick(event) {
	switch (event.which) {
		case 1: // left click
			break;
		case 2: // middle click
			removeWire(event);
			break;
		case 3: // right click
			break;
	}
}

function keydownEvents(event) {
	clearEvents();
	var keyCode = event.originalEvent.code;
	if (keyCode == 'Space') {
		toggleScanner();
	}
}

function updateStorage() {
	localStorage.setItem('canvas', $('#canvas').html());
	console.log(localStorage.getItem('canvas'));
	console.log('Updated storage');
}

function loadStorage() {
	if (localStorage.getItem('canvas') != null) {
		console.log('Loading from storages');
		d3.select('#canvas').html(localStorage.getItem('canvas'));
		console.log(localStorage.getItem('canvas'));
	} else {
		console.log('Storage not found');
	}
}

function clearStorage() {
	localStorage.clear();
	console.log('Cleared storage');
}

$(document).ready(function() {
	loadStorage();
	$(document).on('keydown', keydownEvents);
	$('#panel .gate-container').on('click', typeSelect);
	$('#canvas').on('mouseup', '.gate', gateClick);
	$('#canvas').on('mouseup', '.wire', wireClick);
	$('*').on('dragstart', function (event) {
		// clearEvents();
		event.preventDefault();
	});
	$('*').on('contextmenu', function (event) {
		clearEvents();
		event.preventDefault();
	});
	// prevent middle click scrolling - https://stackoverflow.com/a/5136883
	$('body').mousedown(function(e){if(e.button==1)return false});
});