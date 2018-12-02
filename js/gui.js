var alertTimeout;
var clicked = false;
var clickY,
    clickX;

function alertError(message) {
    clearTimeout(alertTimeout);
    $('#alert-box').attr('class', 'error-box');
    $('#alert-box').html('<b>Error:</b> ' + message);
    $('#alert-box').css('display', 'block');
    alertTimeout = setTimeout(function () {
        $('#alert-box').css('display', 'none');
    }, 3000);
}

function alertMessage(message) {
    clearTimeout(alertTimeout);
    $('#alert-box').attr('class', 'message-box');
    $('#alert-box').html('<b>Note:</b> ' + message);
    $('#alert-box').css('display', 'block');
    alertTimeout = setTimeout(function () {
        $('#alert-box').css('display', 'none');
    }, 3000);
}

function updateScrollPos(event) {
    $('html').css('cursor', 'grabbing');
    $(window).scrollTop($(window).scrollTop() + (clickY - event.pageY));
    $(window).scrollLeft($(window).scrollLeft() + (clickX - event.pageX));
}

$(document)
    .ready(function () {
        $(window).scrollTop($('#canvas').height() / 2 - window.innerHeight / 2);
        $(window).scrollLeft($('#canvas').width() / 2 - window.innerWidth / 2);
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
    });