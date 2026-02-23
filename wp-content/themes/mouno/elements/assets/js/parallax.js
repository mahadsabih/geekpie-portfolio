( function( $ ) {
  "use strict";
  function scrollParallax() {
    const els = $('[data-parallax]');
    if (!els.length) return;
    
    els.each(function (i, el) {
      const params = $(el).data().parallax;
      const parent = $(el).closest('.e-con.elementor-element');
      const x = parseFloat(params.x) || 0;
      const y = parseFloat(params.y) || 0;
      const rotate = parseFloat(params.rotate) || 0;
      const scale = parseFloat(params.scale) || 1;
      const opacity = parseFloat(params.opacity) || 1;

      if ($(el).hasClass('pxl-grid-item')) {
        ScrollTrigger.matchMedia({
          "(min-width: 1200px)": function() {
            if ($(el).hasClass('e-con-background-parallax') || $(el).hasClass('parallax-fit-position')) {
              if (x > 0) gsap.set(el, { left: -x });
              if (x < 0) gsap.set(el, { right: x });
              if (y > 0) gsap.set(el, { top: -y });
              if (y < 0) gsap.set(el, { bottom: y });
            }
            gsap.to(el, {
              x: x,
              y: y,
              rotate: rotate,
              scale: scale,
              opacity: opacity,
              ease: "none",
              duration: 0.25,
              scrollTrigger: {
                trigger: parent,
                start: "top 90%",
                end: "bottom 10%",
                scrub: true,
              },
            });
          }
        });
        return;
      }   
      if ($(el).hasClass('e-con-background-parallax') || $(el).hasClass('parallax-fit-position')) {
        if (x > 0) gsap.set(el, { left: -x });
        if (x < 0) gsap.set(el, { right: x });
        if (y > 0) gsap.set(el, { top: -y });
        if (y < 0) gsap.set(el, { bottom: y });
      }      
      gsap.to(el, {
        x: x,
        y: y,
        rotate: rotate,
        scale: scale,
        opacity: opacity,
        ease: "none",
        duration: 0.25,
        scrollTrigger: {
          trigger: parent,
          start: "top 90%",
          end: "bottom 10%",
          scrub: true,
        },
      });
    });
  }
  

  function hoverParallax( ) {
    let intensity = 0.05;
    const handleOnHover = (el, intensity, e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const moveX = (x - rect.width / 2) * 1 * intensity;
      const moveY = (y - rect.height / 2) * 1 * intensity;
      gsap.to(el, {
        x: moveX,
        y: moveY,
        duration: 0.25,
        ease: "bounce.out",
      });
    }
    const initialState = (el) => {
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.25,
        ease: "bounce.out",
      });
    }

    const hoverParallaxItem = () => {
      let els = $('.hover-parallax-item');
      if(!els.length) return;
      els.each(function(i, el) {
        let items = $(el).find('.parallax-item');
        intensity = parseFloat($(el).attr('data-intensity')) || intensity;
        items.each(function(i, item) {
          $(el).on('mousemove', function(e) {
            handleOnHover(item, intensity, e, 1)
          })
          $(el).on('mouseleave', function() {
            initialState(item)
          })
        })
      })
    }
    hoverParallaxItem()
  }

  function onHoverButtonParallax($scope) {
    const els = $scope.find('.btn.hover-parallax');
    if (!els.length) return;

    $(els).on({
        mousemove(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const moveX = (x - rect.width / 2) * 0.5;
            const moveY = (y - rect.height / 2) * 0.5;
            gsap.to(this, {
                x: moveX,
                y: moveY,
                duration: 0.25,
                ease: "power4.out",
            });
            const elText = $(this).find('.pxl-btn-text');
            const elIcon = $(this).find('.pxl-btn-icon');
            if (elText.length) {
                gsap.to(elText, {
                    x: moveX / 2,
                    y: moveY / 2,
                    duration: 0.25,
                    ease: "power4.out",
                });
            }
            if (elIcon.length) {
                gsap.to(elIcon, {
                    x: moveX / 2,
                    y: moveY / 2,
                    duration: 0.25,
                    ease: "power4.out",
                });
            }
        },
        mouseleave() {
            gsap.to(this, {
                x: 0,
                y: 0,
                duration: 0.25,
                ease: "power1.out",
            });
            const elText = $(this).find('.pxl-btn-text');
            const elIcon = $(this).find('.pxl-btn-icon');
            if (elText.length) {
                gsap.to(elText, {
                    x: 0,
                    y: 0,
                    duration: 0.25,
                    ease: "back.out",
                });
            }
            if (elIcon.length) {
                gsap.to(elIcon, {
                    x: 0,
                    y: 0,
                    duration: 0.25,
                    ease: "back.out",
                });
            }
        },
    });
  }


  function hoverImageParallax($scope) {
    const els = $scope.find('.hover-image-parallax');
    console.log(els.length)
    if (!els.length) return;
    $(els).on({
      mousemove(e) {
      const img = $(this).find('img');
      if (!img.length) return;
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const moveX = (x - rect.width / 2) * 0.15;
      const moveY = (y - rect.height / 2) * 0.15;
      gsap.to(img, {
        x: moveX,
        y: moveY,
        scale: 1.15,
        duration: 0.25,
        ease: "none",
      });
      },
      mouseleave() {
      const img = $(this).find('img');
      if (!img.length) return;
      gsap.to(img, {
        x: 0,
        y: 0,
        scale: 1,
        duration: 0.25,
        ease: "none",
      });
      },
    });
  }

  $( window ).on( 'elementor/frontend/init', function() {
    hoverParallax();
    scrollParallax();

    elementorFrontend.hooks.addAction( `frontend/element_ready/pxl_portfolio.default`, function( $scope ) {
      hoverImageParallax($scope);
      let layout = $scope.find('.pxl-layout-portfolio3');
      let els = layout.find('.pxl-post-inner');
      if (!els.length || !layout.length)  return;
      let spacer = layout.outerWidth() - $(els[0]).outerWidth();
      els.each(function(i, el) {
        let x = (i%2 !== 0) ? -spacer : spacer;
        gsap.to(el, {
          x: x,
          duration: 0.25,
          scrollTrigger: {
            trigger: el,
            start: 'center bottom',
            end: 'top top',
            scrub: 0.5,
          }
        })
      })
    });
    elementorFrontend.hooks.addAction( `frontend/element_ready/pxl_team.default`, function( $scope ) {
      hoverImageParallax($scope);
    });
    elementorFrontend.hooks.addAction( `frontend/element_ready/pxl_service.default`, function( $scope ) {
      hoverImageParallax($scope);
    });
    elementorFrontend.hooks.addAction( `frontend/element_ready/pxl_post.default`, function( $scope ) {
      hoverImageParallax($scope);
    });
    elementorFrontend.hooks.addAction( `frontend/element_ready/pxl_button.default`, function( $scope ) {
      onHoverButtonParallax($scope);
    });
    elementorFrontend.hooks.addAction( `frontend/element_ready/pxl_cta_button.default`, function( $scope ) {
      onHoverButtonParallax($scope);
    });   
  });
} )( jQuery );