'use strict';
$(function() {
    $('.nav ul li').click(function(e) {
        e.preventDefault();
        var tab = $(this).data('tabs');
        $('.nav ul li').removeClass('active');
        $(this).addClass('active');
        $('.tabs div').addClass('hide');
        $('[data-tab="'+tab+'"]').removeClass('hide');
    });
});
