( function( $ ) {
    var pxl_widget_counter_handler = function( $scope ) {
        if(!$scope.find('.pxl-number-value.effect-default, .pxl-number-value.effect-slide').length) return;
        setTimeout(function(){
            elementorFrontend.waypoint($scope.find('.pxl-number-value.effect-default'), function () {
                var $number = $(this),
                    data = $number.data();

                var decimalDigits = data.toValue.toString().match(/\.(.*)/);

                if (decimalDigits) {
                    data.rounding = decimalDigits[1].length;
                }

                $number.numerator(data);
            }, {
                offset: '95%',
                triggerOnce: true
            });

            elementorFrontend.waypoint($scope.find('.pxl-number-value.effect-slide'), function () {
                var $number = $(this),
                    data = $number.data();
                var el = $number[0];
                var startNumber = data['startnumber'], endNumber = data['endnumber'], separator = data['delimiter'], duration = data['duration'] ;
                od = new Odometer({
                    el: el,
                    value: startNumber,
                    format: separator,
                    theme: 'default'
                });
                od.update(endNumber);
            }, {
                offset: '95%',
                triggerOnce: true
            });
        }, 300);

    };

    function dynamicSvg( $scope ) {
        if (!$scope.find('.dynamic-svg').length) return;
        $scope.find('.dynamic-svg').each(function(i, svg) {
            const text = $(svg).find('text:first'); 
            const box = text[0].getBBox(); 
            $(svg).css('width', box.width + 'px');
            ScrollTrigger.create({
                trigger: svg, 
                start: "top 80%",        
                end: "top 20%",    
                toggleClass: {
                    targets: text,
                    className: "animated-text-stroke"
                },
                // markers: true,  
                once: true,
                onEnter: function() {
                    text.removeClass('visibility-hidden');  // Xóa lớp 'visiable-hidden'
                },         
            });
        });
    }

    
    $( window ).on( 'elementor/frontend/init', function() {
        elementorFrontend.hooks.addAction( `frontend/element_ready/pxl_counter.default`, function( $scope ) {
            pxl_widget_counter_handler($scope);
            dynamicSvg($scope);
        });
    } );
} )( jQuery );