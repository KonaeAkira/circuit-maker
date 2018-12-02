var selectedType = 'none';
var globalID = 0;
var modifyFlag = false;

var curPath = null;
var curX,
    curY;

const gateWidth = 62;
const gateHeight = 34;

function selectType(caller) {
    $('.gate-container.selected')
        .removeClass('selected')
        .addClass('unselected');
    $(caller)
        .removeClass('unselected')
        .addClass('selected');
    selectedType = $(caller).attr('gate-type');
    console.log('gate-type: ' + selectedType);
}

function clearSelectedType() {
    $('.gate-container.selected')
        .removeClass('selected')
        .addClass('unselected');
    selectedType = 'none';
    $('#canvas .gate-temporary').remove();
}

function pathAppend(caller, tarX, tarY) {
    var d = $(curPath).attr('d');
    console.log(curX, curY, tarX, tarY);
    curPath.attr('d', d + ' H ' + parseInt((curX + tarX) / 16) * 8 + ' V ' + tarY + ' H ' + tarX);
    curX = tarX;
    curY = tarY;
}

function connectGates(caller) {
    var inp = $(curPath).attr('inp');
    var id = $(caller).attr('gate-id');
    var type = $(caller).attr('gate-type');
    var x = parseInt($(caller).attr('x')) + gateWidth * 0.0562;
    var y = parseInt($(caller).attr('y')) + gateHeight / 2;
    if (type == 'inp') {
        alertError('Target gate has no inputs');
        return;
    } else if (type == 'not' || type == 'out') {
        if ($(caller).attr('inp-1') != 0) {
            alertError('Target gate has no free inputs');
            return;
        }
        $(caller).attr('inp-1', inp);
    } else {
        if ($(caller).attr('inp-1') == 0) {
            $(caller).attr('inp-1', inp);
            y = parseInt($(caller).attr('y')) + gateHeight * 0.3;
        } else if ($(caller).attr('inp-2') == 0) {
            $(caller).attr('inp-2', inp);
            y = parseInt($(caller).attr('y')) + gateHeight * 0.7;
        } else {
            alertError('Target gate has no free inputs');
            return;
        }
    }
    pathAppend(curPath, x, y);
    $(curPath).attr('out', id);
    curPath = null;
}

function selectGate(caller) {
    var id = $(caller).attr('gate-id');
    curX = parseInt($(caller).attr('x')) + gateWidth * 0.9437;
    curY = parseInt($(caller).attr('y')) + gateHeight / 2;
    d3
        .select('#canvas')
        .append('path')
        .attr('class', 'wire')
        .attr('d', 'M ' + curX + ' ' + curY)
        .attr('stroke', 'black')
        .attr('stroke-width', '1.25')
        .attr('fill', 'none')
        .attr('inp', id)
        .attr('out', 0);
    curPath = $('#canvas .wire[inp="' + id + '"][out="0"]');
}

function removeGate(caller) {
    var id = $(caller).attr('gate-id');
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
    $(caller).remove();
}

function clearSelectedGate() {
    if (curPath != null) {
        $(curPath).remove();
        curPath = null;
    }
    $('#canvas .wire-temporary').remove();
}

function toggleGate(caller) {
    if ($(caller).attr('gate-type') == 'inp') {
        $(caller).attr('this-state', $(caller).attr('this-state') == 'false');
        $(caller).attr('next-state', $(caller).attr('next-state') == 'false');
        console.log('switched gate ' + $(caller).attr('gate-id') + ' to ' + $(caller).attr('this-state'));
    }
}

function removeWire(caller) {
    var inp = $(caller).attr('inp');
    var out = $(caller).attr('out');
    var tar = $('#canvas .gate[gate-id="' + out + '"]');
    if (tar.attr('inp-1') == inp) {
        tar.attr('inp-1', 0);
    } else if (tar.attr('inp-2') == inp) {
        tar.attr('inp-2', 0);
    }
    $(caller).remove();
}

$(document)
    .ready(function () {

        $('#panel .gate-container')
            .click(function () {
                selectType(this);
                clearSelectedGate();
            });

        // draw previews
        $('#canvas').mousemove(function (event) {
            var x = parseInt(event.pageX / 8) * 8;
            var y = parseInt(event.pageY / 8) * 8;
            if (selectedType != 'none') {
                $('#canvas .gate-temporary').remove();
                d3
                    .select(this)
                    .append('image')
                    .attr('class', 'gate-temporary')
                    .attr('href', 'img/' + selectedType + '.svg')
                    .attr('x', x - 35)
                    .attr('y', y - 16)
                    .attr('width', '62px')
                    .attr('height', '34px');
            } else if (curPath != null) {
                $('#canvas .wire-temporary').remove();
                d3
                    .select(this)
                    .append('path')
                    .attr('class', 'wire-temporary')
                    .attr('d', 'M ' + curX + ' ' + curY + ' H ' + (curX + x) / 2 + ' V ' + y + ' H ' + x)
                    .attr('stroke', 'gray')
                    .attr('stroke-width', '1.25')
                    .attr('fill', 'none');
            }
        });

        // draw a new gate on the canvas
        $('#canvas').click(function (event) {
            if (selectedType != 'none') {
                var gate = d3
                    .select(this)
                    .append('image')
                    .attr('href', 'img/' + selectedType + '.svg')
                    .attr('class', 'gate unselected no-contextmenu')
                    .attr('x', parseInt(event.pageX / 8) * 8 - 35)
                    .attr('y', parseInt(event.pageY / 8) * 8 - 16)
                    .attr('width', '62px')
                    .attr('height', '34px')
                    .attr('gate-type', selectedType)
                    .attr('gate-id', ++globalID)
                    .attr('inp-1', 0)
                    .attr('inp-2', 0)
                    .attr('this-state', false)
                    .attr('next-state', false);
            }
        });

        $('#canvas #background').click(function (event) { // click on background
            if (curPath != null) {
                var x = parseInt(event.pageX / 8) * 8;
                var y = parseInt(event.pageY / 8) * 8;
                console.log(curX, curY, x, y);
                pathAppend(curPath, x, y);
                console.log(curX, curY, x, y);
            }
        });

        // mousedown events for gates on canvas
        $('#canvas').on('mousedown', '.gate', function (event) {
            switch (event.which) {
                case 1: // left mouse
                    if (selectedType == 'none') {
                        if (modifyFlag == true) {
                            removeGate(this);
                        } else if (curPath == null) {
                            selectGate(this);
                        } else {
                            connectGates(this);
                            clearSelectedGate();
                        }
                    }
                    break;
                case 3:
                    toggleGate(this);
                    break;
            }
        });

        // mousedown events for wires on canvas
        $('#canvas').on('mousedown', '.wire', function (event) {
            switch (event.which) {
                case 1: // left mouse
                    if (modifyFlag == true) {
                        removeWire(this);
                    }
                    break;
            }
        });

        // dragging events
        $('*').on('dragstart', function (event) {
            event.preventDefault();
        });

        // context menu events
        $('*').on('contextmenu', function (event) {
            event.preventDefault();
            clearSelectedType();
            clearSelectedGate();
        });

        // keydown events
        $(document).keydown(function (event) {
            if (event.key == 'Escape') {
                clearSelectedType();
                clearSelectedGate();
            } else if (event.key == 'Shift') {
                modifyFlag = true;
            }
        });

        // keyup events
        $(document).keyup(function (event) {
            if (event.key == 'Shift') {
                modifyFlag = false;
            }
        });

    });
