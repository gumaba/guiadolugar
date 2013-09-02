function uniqid(prefix, more_entropy) {
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +    revised by: Kankrelune (http://www.webfaktory.info/)
    // %        note 1: Uses an internal counter (in php_js global) to avoid collision
    // *     example 1: uniqid();
    // *     returns 1: 'a30285b160c14'
    // *     example 2: uniqid('foo');
    // *     returns 2: 'fooa30285b1cd361'
    // *     example 3: uniqid('bar', true);
    // *     returns 3: 'bara20285b23dfd1.31879087'
    if (typeof prefix === 'undefined') {
        prefix = "";
    }

    var retId;
    var formatSeed = function (seed, reqWidth) {
        seed = parseInt(seed, 10).toString(16); // to hex str
        if (reqWidth < seed.length) { // so long we split
            return seed.slice(seed.length - reqWidth);
        }
        if (reqWidth > seed.length) { // so short we pad
            return Array(1 + (reqWidth - seed.length)).join('0') + seed;
        }
        return seed;
    };

    // BEGIN REDUNDANT
    if (!this.php_js) {
        this.php_js = {};
    }
    // END REDUNDANT
    if (!this.php_js.uniqidSeed) { // init seed with big random int
        this.php_js.uniqidSeed = Math.floor(Math.random() * 0x75bcd15);
    }
    this.php_js.uniqidSeed++;

    retId = prefix; // start with prefix, add current milliseconds hex string
    retId += formatSeed(parseInt(new Date().getTime() / 1000, 10), 8);
    retId += formatSeed(this.php_js.uniqidSeed, 5); // add seed hex string
    if (more_entropy) {
        // for more entropy we add a float lower to 10
        retId += (Math.random() * 10).toFixed(8).toString();
    }

    return retId;
}

$(function () {
    function onResize() {
        if ($(".search-letters").width() > ($(".search-letters-wrapper").width() - 30)) {
            $(".search-letters").removeClass('with-arrows');
            $(".search-letters-wrapper").css({
                "margin": "0 auto"
            });
        } else {
            $(".search-letters").addClass('with-arrows');
            $(".search-letters-wrapper").css({
                "left": "-5px"
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
            if ($(this).parent().width() > ($(this).width() - 30)) {
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


    $.typeaheadCidades = function (scope) {
        $('.typeahead-cidades', scope).typeahead({
            source: function (query, process) {
                return $.get('/typeahead/cidades', { query: query }, function (data) {
                    return process(data.options);
                }, 'json');
            }
        });
    };

    $.typeaheadEstados = function (scope) {
        $('.typeahead-estados', scope).typeahead({
            source: function (query, process) {
                return $.get('/typeahead/estados', { query: query }, function (data) {
                    return process(data.options);
                }, 'json');
            }
        });
    };


});
