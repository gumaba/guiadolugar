$(function () {
    function onResize() {
        if ($(".search-letters").width() > $(".search-letters-wrapper").width()) {
            $(".search-letters").removeClass('with-arrows');
            $(".search-letters-wrapper").css({
                "margin": "0 auto"
            });
        } else {
            $(".search-letters").addClass('with-arrows');
            $(".search-letters-wrapper").css({
                "left": "-20px"
            });
        }
        $.globalVars.maxHeight = $(".search-letters-wrapper").height() - $(".search-letters").height();
        $.globalVars.maxWidth = $(".search-letters-wrapper").width() - $(".search-letters").width();
    }

    $(window).resize(onResize);

    $.globalVars = {
        originalTop: 0,
        originalLeft: 0,
        maxHeight: $(".search-letters-wrapper").height() - $(".search-letters").height(),
        maxWidth: $(".search-letters-wrapper").width() - $(".search-letters").width()
    };
    onResize();

    $(".search-letters-wrapper").css({
        "margin": "0 auto"
    });

    $(".search-letters .arrow-left").bind('mousedown touchstart',function () {
        clearInterval($(this).data('interval'));
        $(this).data('interval', setInterval(function () {
            $(".search-letters-wrapper").simulate("drag", {
                dx: -50
            });
        }, 20));
    }).bind('mouseup mouseleave mouseout touchstop touchend',function () {
            clearInterval($(this).data('interval'));
        }).disableSelection();

    $(".search-letters .arrow-right").bind('mousedown touchstart',function () {
        clearInterval($(this).data('interval'));
        $(this).data('interval', setInterval(function () {
            $(".search-letters-wrapper").simulate("drag", {
                dx: 50
            });
        }, 20));
    }).bind('mouseup mouseleave mouseout touchstop touchend',function () {
            clearInterval($(this).data('interval'));
        }).disableSelection();

    $(".search-letters-wrapper").disableSelection().draggable({ axis: "x",
        start: function (event, ui) {
            if (ui.position != undefined) {
                $.globalVars.originalTop = ui.position.top;
                $.globalVars.originalLeft = ui.position.left;
            }
        },
        drag: function (event, ui) {
            if ($(this).parent().width() > $(this).width()) {
                return false;
            }
            var newTop = ui.position.top;
            var newLeft = ui.position.left;
            if (ui.position.top < 0 && ui.position.top * -1 > $.globalVars.maxHeight) {
                newTop = $.globalVars.maxHeight * -1;
            }
            if (ui.position.top > 0) {
                newTop = 0;
            }
            if (ui.position.left < 0 && ui.position.left * -1 > $.globalVars.maxWidth) {
                newLeft = $.globalVars.maxWidth * -1;
            }
            if (ui.position.left > 0) {
                newLeft = 0;
            }
            ui.position.top = newTop;
            ui.position.left = newLeft;
        }
    });


});