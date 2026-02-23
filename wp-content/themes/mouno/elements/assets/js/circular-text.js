( function( $ ) {
    "use strict";
    var pxl_circilar_text_handler = function( $scope ) {
        let elements = $scope.find('.pxl-circular-text-item');
        if(!elements.length) return;

        setTimeout(function() {
            elements.each(function() {
                let circletext = new CircleType(this)
                circletext.forceHeight(true) 
                .forceWidth(true)  
            });
        }, 300)
    };
    
    $( window ).on( 'elementor/frontend/init', function() {
        elementorFrontend.hooks.addAction( 'frontend/element_ready/pxl_circular_text.default', function( $scope ) {
            pxl_circilar_text_handler($scope);
        });
    } );
} )( jQuery );