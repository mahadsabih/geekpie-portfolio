( function( $ ) {
    "use strict";
    var pxl_widget_accordion_handler = function($scope) {
        let els = $scope.find('.pxl-accordion-wrapper');
        if (!els.length) return;
    
        els.each(function(i, el) {
            let items = $(el).find('.pxl-accordion-item');
    
            items.each(function() {
                if ($(this).hasClass('active')) {
                    $(this).find('.pxl-accordion-content').slideDown(0);
                }
            });
    
            items.find('.pxl-accordion-header').on('click', function(e) {

                let currentItem = $(this).closest('.pxl-accordion-item');
    
                if (currentItem.hasClass('active')) return;
                e.preventDefault();
    
                items.removeClass('active').find('.pxl-accordion-content').slideUp(300);
    
                currentItem.addClass('active').find('.pxl-accordion-content').slideDown(300);
            });
        });
    };

    const accordionHandle = function($scope) {
        const els = $scope.find('.pxl-post-accordion');
        if (!els.length) return;
        els.each(function() {
            const el = $(this);
            let items = el.find('.pxl-accordion-item');
            items.each(function() {
                const $item = $(this);
                if ($item.hasClass('active')) {
                    const content = $item.find('.pxl-accordion-content')[0];
                    gsap.set(content, { height: content.scrollHeight });
                }
            });

            el.on('click', '.pxl-post-item', function(e) {
                const currentItem = $(this);
                if (currentItem.hasClass('active')) return;
                else e.preventDefault();
                items = el.find('.pxl-accordion-item');
                let contents = el.find('.pxl-accordion-content');
                const currentContent = currentItem.find('.pxl-accordion-content')[0];
                items.removeClass('active');
                gsap.to(contents, { height: 0, duration: 0.5 });
                currentItem.addClass('active');
                gsap.to(currentContent, {
                    height: 'auto',
                    duration: 0.5,
                });
            });
        });
    };   
    
    $( window ).on( 'elementor/frontend/init', function() {
        elementorFrontend.hooks.addAction( `frontend/element_ready/pxl_accordion.default`, function( $scope ) {
            pxl_widget_accordion_handler($scope);
        });
        elementorFrontend.hooks.addAction( `frontend/element_ready/pxl_service.default`, function( $scope ) {
            accordionHandle($scope);
        });
        elementorFrontend.hooks.addAction( `frontend/element_ready/pxl_portfolio.default`, function( $scope ) {
            accordionHandle($scope);
        });
    });
} )( jQuery );