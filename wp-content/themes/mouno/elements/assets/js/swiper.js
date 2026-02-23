( function( $ ) {
    "use strict";
    $( window ).on( 'elementor/frontend/init', function() {
        const widgets = [ 'pxl_testimonial_carousel', 'pxl_index_box_carousel', 'pxl_post', 'pxl_service', 'pxl_team', 'pxl_icon_carousel', 'pxl_image_carousel', 'pxl_step_carousel', 'pxl_slider'];
        widgets.forEach(widget => {               
            elementorFrontend.hooks.addAction( `frontend/element_ready/${widget}.default`, function( $scope ) {
                swiperHandle($scope);
            });
        });
    });

    const onClickNavigtionPreventEvent = (swiper, prevBtn, nextBtn) => {
        if (swiper.isBeginning) {
            prevBtn.onclick = function (e) { e.preventDefault(); e.stopPropagation(); };
        }
        if(swiper.isEnd) {
            nextBtn.onclick = function (e) { e.preventDefault(); e.stopPropagation(); };
        }
    }
    const splitTextEffect = (slide) => {
        let texts = $(slide).find('.pxl-heading-title .pxl-title-text');
        if (!texts.length) return;
    
        texts.each(function (i, el) {
            let splitText;
    
            if (!$(el).hasClass('split-initialized')) {
                splitText = new SplitText(el, {
                    type: "lines",
                    linesClass: 'pxl-line',
                    tag: 'span',
                });
                new SplitText(el, {
                    type: "lines",
                    linesClass: 'pxl-line-wrap',
                });
                $(el).addClass('split-initialized');
            } else {
                splitText = { lines: $(el).find('.pxl-line') };
            }
    
            gsap.set(splitText.lines, {
                yPercent: 100,
                opacity: 0,
            });
            
            gsap.to(splitText.lines, {
                yPercent: 0,
                opacity: 1,
                duration: 1,   
                delay: .75,   
                stagger: 0.15,     
            })
    
            $(el).removeClass('visibility-hidden');
        });
    };
    
    function swiperHandle($scope){
        let swipers = $scope.find('.pxl-swiper'); 
        if (!swipers.length) return; 
        swipers.each(function () {
            let _this = $(this)
            let elementorEl = _this.closest('.elementor-element').first();
            const thisClasses = _this.attr('class');
            const container = _this.find('.swiper-container');
            if (!container.length) return;
            const params = $(container).data().swiper || {};
            const groupCarousel = _this.attr('data-group') || '';

            const navigationWrap = _this.find('.swiper-navigation').first();
            let alternativeNavigation = $(navigationWrap).data('navigation-id');
            let navigation = {
                nextEl: _this.find('.swiper-button-next')[0],
                prevEl: _this.find('.swiper-button-prev')[0],
            }
            if(alternativeNavigation !== '' && alternativeNavigation !== undefined) {
                navigation = {
                    nextEl: $('#'+alternativeNavigation).find('.pxl-swiper-button-next')[0],
                    prevEl: $('#'+alternativeNavigation).find('.pxl-swiper-button-prev')[0],
                }
            }
            let slidesPerView = params['slides_per_view'] ?? 'auto';
            if(params['direction'] === 'vertical' && params['slides_per_view'] === 'auto') {
                slidesPerView = 1;
            }
            const settings = {
                effect: params['effect'],
                fadeEffect: {
                    crossFade: params['effect'] === 'fade' ? true : false
                },
                allowTouchMove: params['allow_touch_move'] ?? true,
                direction: params['direction'] ?? 'horizontal',
                loop: params['loop'],
                autoplay: (params['autoplay'] === true) ? {
                    delay: params['delay'],
                    disableOnInteraction: params['disable_on_interaction']
                } : false,
                mousewheel: (params['mousewheel'] === true) ? {
                    enabled: true,
                    thresholdTime: 100,
                    forceToAxis: false,
                } : false,
                wrapperClass: 'swiper-wrapper',
                slideClass:'swiper-slide',
                slidesPerView: slidesPerView, 
                slidesPerGroup: 1,
                spaceBetween: params['space_between'] ?? 0, 
                watchSlidesProgress: true,
                watchSlidesVisibility: true,
                observer: true,
                observeParents: true,
                speed: params['speed'],
                enabled: true,
                parallax: true,
                pagination: (params['pagination'] !== '' && params['pagination'] !== 'none') ? {
                    el: _this.find('.swiper-pagination')[0],
                    clickable: true,
                    type: params['pagination']
                } : false,
                navigation: params['navigation'] == true ? navigation : false,

                breakpoints: {
                    0: {
                        slidesPerView: params['slides_per_view_xs'] ?? 1,
                        spaceBetween: (params['space_between'] > 30) ? 30 : params['space_between'],
                    },
                    576: {
                        slidesPerView: params['slides_per_view_sm'] ?? 1,
                        spaceBetween: (params['space_between'] > 30) ? 30 : params['space_between'],
                    },
                    768: {
                        slidesPerView: params['slides_per_view_md'] ?? 2,
                        spaceBetween: (params['space_between'] > 30) ? 30 : params['space_between'],
                    },
                    992: {
                        slidesPerView: params['slides_per_view_lg'] ?? 2,
                        spaceBetween: (params['space_between'] > 30) ? 30 : params['space_between'],
                    },
                    1200: {
                        slidesPerView: params['slides_per_view_xl'] ?? 3,
                        spaceBetween: params['space_between'] ?? 30,},
                    1400: {
                        slidesPerView: params['slides_per_view_xxl'] ?? 3,
                        spaceBetween: params['space_between'] ?? 30, 
                    },
                },
                
                on : {
                    init: function() {
                        const swiper = this;
                        const slides = swiper.slides;
                        const activeIndex = swiper.activeIndex;
                        let realIndex = swiper.realIndex;
                        if(thisClasses.includes('pxl-slider')) 
                            splitTextEffect(swiper.slides[activeIndex]);
                        if(thisClasses.includes('pxl-layout-service2')) {
                            let height = 0;
                            slides.each(function(i, slide) {
                                if ( i < slidesPerView ) {
                                    height += $(this).outerHeight();
                                }
                            });
                            container.css('height' , `${height}px`)
                        }
                    },

                    scroll: function() {
                    },

                    slideChange: function() {
                        const swiper = this;
                        const slides = swiper.slides;
                        const activeIndex = swiper.activeIndex;
                        let realIndex = swiper.realIndex;
                        let nextBtn = navigation.nextEl;
                        let prevBtn = navigation.prevEl;   
                        if(thisClasses.includes('pxl-slider')) {
                            splitTextEffect(slides[activeIndex]);
                            // $(slides).find('.wow').addClass('pxl-invisible').removeClass('animated');
                            $(slides[activeIndex]).find('.wow').addClass('animated');
                        }else {
                            $(slides).find('.wow').addClass('pxl-invisible').removeClass('animated');
                            $(slides).find('.wow.pxl-post-item').addClass('pxl-invisible').removeClass('animated');
                        }
                        if(params['navigation'] == true) 
                            onClickNavigtionPreventEvent(swiper, prevBtn, nextBtn);
                        if (groupCarousel) {
                            let otherSwiper = $(`[data-group="${groupCarousel}"]`).find('.swiper-container').not(swiper.el);
                            otherSwiper.each(function () {
                                let swiperInstance = $(this).get(0).swiper;
                                swiperInstance.slideTo(activeIndex);
                            })
                        }
                        
                    },
                }
            };
            let swiper = new Swiper(container[0], settings);
        });
    };
} )( jQuery );