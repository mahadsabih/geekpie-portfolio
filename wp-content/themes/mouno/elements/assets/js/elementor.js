( function( $ ) {
    "use strict";

    function mounoElAfterRender(){
        let _elementor = typeof elementor != 'undefined' ? elementor : elementorFrontend;
        _elementor.hooks.addFilter('pxl_element_container/after-render', function(ouput, settings) {
            // if(typeof settings.el_bg_parallax_img != 'undefined' && settings.el_bg_parallax_img.url != ''){
            //     ouput += '<div class="e-con-background-parallax"></div>';
            // }
            // if (typeof settings.el_number_layer_overlay != 'undefined' && settings.el_number_layer_overlay == '1') {
            //     ouput += `<div class="e-con-overlay"></div>`;
            // }    
            // if (typeof settings.el_overlays != 'undefined' && settings.el_overlays.length > 0) {
            //     settings.el_overlays.forEach(function (item) {
            //         let classes = 'e-con-overlay elementor-repeater-item-' + item._id;
            //         ouput += `<div class="${classes}"></div>`;
            //     });
            // }    
            // return ouput;
        });
    } 

    function mounoElBeforeRender(){
        let _elementor = typeof elementor != 'undefined' ? elementor : elementorFrontend;
        
        _elementor.hooks.addFilter( 'pxl_element_container/before-render', function( output, settings) {
            if(typeof settings.el_bg_parallax_img != 'undefined' && settings.el_bg_parallax_img.url != ''){
                output += '<div class="e-con-background-parallax"></div>';
            }
            if (typeof settings.el_number_layer_overlay != 'undefined' && settings.el_number_layer_overlay == '1') {
                output += `<div class="e-con-overlay"></div>`;
            }    
            if (typeof settings.el_overlays != 'undefined' && settings.el_overlays.length > 0) {
                settings.el_overlays.forEach(function (item) {
                    let classes = 'e-con-overlay elementor-repeater-item-' + item._id;
                    output += `<div class="${classes}"></div>`;
                });
            }    
            if(typeof settings.is_el_template != 'undefined') {
                output += '<div class="pxl-template-overlay"></div>';
            }
            return output;
        });
    } 

    function cursorSpotlight() {
        if(!$('.cursor-spotlight').length) return;
        $('.cursor-spotlight').on('mousemove', function(e) {
            const mouseX = e.offsetX;
            const mouseY = e.offsetY;    
            gsap.to(this, {
                '--pxl-translate-x': `${mouseX}px`,
                '--pxl-translate-y': `${mouseY}px`,
                '--pxl-box-size': '200px',
                duration: 0.3, 
                ease: 'power2.out', 
            });
        });
    
        $('.cursor-spotlight').on('mouseleave', function(e) {
            gsap.to(this, {
                '--pxl-box-size': '0px',
                duration: 0.5,
                ease: 'power2.out', 
            });
        });
    }

    function layerEffectHome4() {
        if(!$('#test').length) return;
        let els = $('#test').find('> .elementor-element');
        let cons = $('#test').find('.elementor-widget-container');
        let parent = $('#test').parent('.e-parent')
        els.each(function(i, el) {
            if(i > 0) {                
                gsap.from(el, {
                    top: 0,
                    left: 0,
                    ease: 'power4.out',
                    duration: 1 + i * 0.05,
                    delay: .25,
                    scrollTrigger: {
                        trigger: parent,
                        start: 'top top',
                        end: 'bottom bottom',
                        toggleActions: "play reverse play reverse",
                    }
                })
            }
        })
        gsap.from(cons,{
            rotate: 0,
            ease: 'power4.out',
            duration: .75,
            delay: .5,
            scrollTrigger: {
                trigger: parent,
                start: 'top top',
                end: 'bottom bottom',
                toggleActions: "play reverse play reverse",
            }
        })
    }

    function pinSection() {
        if(!$('.e-con-pin').length) return;
        $('.e-con-pin').each(function(i, el) {
            let elNext = $(el).next('.elementor-element');
            if(!elNext.length && $(el).hasClass('e-parent')) {
                elNext = $('#pxl-footer-elementor');
            }
            let elNextHeight = elNext.outerHeight();
            let elHeight = $(el).outerHeight();
            let vwHeight = $(window).outerHeight();
            let start = (elHeight <= vwHeight) ? 'top top' : 'bottom bottom';
            gsap.to(el, {
                scrollTrigger : {
                    trigger: el,
                    start: start, 
                    end : () => `+=`+elNextHeight, 
                    pin: true,
                    pinSpacing: false,
                    scrub: 1,
                    // markers: true,
                }
            })
        })
    }


    function elementSticky() {
        let stickyElement = document.querySelector('.pxl-sticky');

        if (!stickyElement || !window.smoother) return;
    
        window.smoother = ScrollTrigger.create({
            trigger: stickyElement,
            start: "top top",
            end: "bottom top",
            scrub: true,
            markers: true,
            // pinReparent: true,
            pin: true,
            pinType: "fixed",
            onEnter: () => {
                window.smoother.vars.smooth = 0; // Tắt smooth
                window.smoother.update();
            },
            onLeaveBack: () => {
                window.smoother.vars.smooth = 2.25; // Bật lại smooth
                window.smoother.update();
            }
        });
    }

    function onScrollTranslateX() {
        let el = $('.scroll-marquee-animation .pxl-text-marquee-item');
        if (!el.length) return;
        let parent = el.closest('.elementor-element');
        let moveDistance = (el.outerWidth() > $(parent).width()) ? $(parent).width() - el.outerWidth() : 0;
        gsap.to(el, {
            x: moveDistance,
            ease: "none",
            duration: 5,
            scrollTrigger: {
                trigger: parent,
                start: "bottom bottom",
                end: `top center`,
                scrub: 2.5,
                pinSpacing: true,
                anticipatePin: 1,
                pinReparent: true,
            }
        });
    }

    $( window ).on( 'elementor/frontend/init', function() {
        mounoElAfterRender();
        mounoElBeforeRender()
        cursorSpotlight()
        pinSection()
        onScrollTranslateX()
        layerEffectHome4()
        elementSticky()
    });


} )( jQuery );