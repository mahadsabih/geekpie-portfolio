( function( $ ) {
    "use strict";
    var pxl_widget_countdown_handler = function( $scope, $ ) {
        $scope.find(".pxl-countdown-wrapper").each(function () {
            let countdownItem = $(this).find('.pxl-countdown-item');
            let count_down = $(this).find('.pxl-countdown-time').data("count-down");
            setInterval(function () {
                let startDateTime = new Date().getTime();
                let endDateTime = new Date(count_down).getTime();
                let distance = endDateTime - startDateTime;
                let days = Math.floor(distance / (1000 * 60 * 60 * 24));
                let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                let seconds = Math.floor((distance % (1000 * 60)) / 1000);
                let text_day = days !== 1 ? countdownItem.attr('data-days') : countdownItem.attr('data-day');
                let text_hour = hours !== 1 ? countdownItem.attr('data-hours') : countdownItem.attr('data-hour');
                let text_minu = minutes !== 1 ? countdownItem.attr('data-minutes') : countdownItem.attr('data-minute');
                let text_second = seconds !== 1 ? countdownItem.attr('data-seconds') : countdownItem.attr('data-second');
                days = days < 10 ? '0' + days : days;
                hours = hours < 10 ? '0' + hours : hours;
                minutes = minutes < 10 ? '0' + minutes : minutes;
                seconds = seconds < 10 ? '0' + seconds : seconds;

                countdownItem.html(''
                    + '<div class="countdown-group"><div class="countdown-amount">' + days + '</div><div class="countdown-period">' + text_day + '</div></div>'
                    + '<div class="countdown-separator">:</div>'
                    + '<div class="countdown-group"><div class="countdown-amount">' + hours + '</div><div class="countdown-period">' + text_hour + '</div></div>'
                    + '<div class="countdown-separator">:</div>'
                    + '<div class="countdown-group"><div class="countdown-amount">' + minutes + '</div><div class="countdown-period">' + text_minu + '</div></div>'
                    + '<div class="countdown-separator">:</div>'
                    + '<div class="countdown-group"><div class="countdown-amount">' + seconds + '</div><div class="countdown-period">' + text_second + '</div></div>'
                );
            }, 100);
        });
    };

    $( window ).on( 'elementor/frontend/init', function() {
        elementorFrontend.hooks.addAction( 'frontend/element_ready/pxl_countdown.default', pxl_widget_countdown_handler );
    } );
} )( jQuery );