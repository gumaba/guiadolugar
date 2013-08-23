(function($) {
    $.fn.oneCarousel = function(options) {
    	var _this = this;
        // plugin options
        var settings = $.extend({
            easeIn : 'fadeInLeft',
            pause: 'hover',
            interval: 5000
        }, options);

		_this.carousel({
			pause: settings.pause,
			interval: settings.interval
		});
		var _prevItem;
		var _animateClass;

		_this.find('.carousel-caption').children().each(function(index) {
			$(this).css('opacity', 0);
		});

		$('.carousel-caption', _this.find('.active')).children().each(function(index) {
			if($(this).data('animate')){
				_animateClass = $(this).data('animate');
			}else{
				_animateClass = settings.easeIn;
			}
			if($.browser.msie&&$.browser.version<=9){
				$(this).css('opacity', 0);
				$(this).show().animate({opacity: 1}, 200+200*index);
			}else{
				$(this).removeClass(_animateClass).addClass('animate'+ index + ' '+ _animateClass);
			}
			_prevItem = $(this);
		});


		_this.on('slid', function(event) {
		   	if(_prevItem) _prevItem.find('.carousel-caption').children().each(function(inex) {
		 		if($(this).data('animate')){
					_animateClass = $(this).data('animate');
				}else{
					_animateClass = settings.easeIn;
				}
		        $(this).removeClass(_animateClass).css('opacity', 0);
			});

		    $('.carousel-caption', _this.find('.active')).children().each(function(index) {
				if($(this).data('animate')){
					_animateClass = $(this).data('animate');
				}else{
					_animateClass = settings.easeIn;
				}
				if($.browser.msie&&$.browser.version<=9){
					$(this).css('opacity', 0);
					$(this).show().animate({opacity: 1}, 200+200*index);
				}else{
					$(this).css('opacity', 0).removeClass(_animateClass).addClass('animate'+ index + ' ' + _animateClass);
				}
			});
			_prevItem = $(this);	
		});  
        return this;
    };
})(jQuery);