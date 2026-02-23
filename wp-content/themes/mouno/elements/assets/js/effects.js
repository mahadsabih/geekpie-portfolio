( function( $ ) {
    function hoverTransformDirectionAnimation( $scope ) {
        let els = $scope.find('.hover-rotate3d-direction, .hover-translate3d-direction');
        if(!els.length) return;
        const directions = { 0: 'top', 1: 'right', 2: 'bottom', 3: 'left' };
        const getDirectionKey = (ev, $node) => {
            const offset = $node.offset();
            const width = $node.outerWidth();
            const height = $node.outerHeight();
            const l = ev.pageX - offset.left;
            const t = ev.pageY - offset.top;
            const x = (l - (width / 2) * (width > height ? (height / width) : 1));
            const y = (t - (height / 2) * (height > width ? (width / height) : 1));
            return Math.round(Math.atan2(y, x) / 1.57079633 + 5) % 4;
        };

        const getHorizontalKey = (ev, $node) => {
            const offset = $node.offset();
            const width = $node.outerWidth();
            const l = ev.pageX - offset.left;
            const x = l - width / 2;
            return x < 0 ? 3 : 1;
        };

        const getVerticalKey = (ev, $node) => {
            const offset = $node.offset();
            const height = $node.outerHeight();
            const t = ev.pageY - offset.top; 
            const y = t - height / 2; 
            return y < 0 ? 0 : 2;
        };
        
        class Item {
            constructor($element) {
                this.$element = $element;
                this.activeClass = ''; 
                
                const parent = this.$element.parent('.menu-item');
                if(parent.length) {
                    parent.on('mouseenter', (ev) => this.update(ev, 'in'));
                    parent.on('mouseleave', (ev) => this.update(ev, 'out'));
                }else {
                    this.$element.on('mouseenter', (ev) => this.update(ev, 'in'));
                    this.$element.on('mouseleave', (ev) => this.update(ev, 'out'))
                };
            }
            update(ev, prefix) {
                let itemHover = this.$element.find('.direction-item').first();
                if(!itemHover.length) {
                    itemHover = $('<span class="direction-item"></span>');
                    this.$element.prepend(itemHover);
                }
                const effectType = this.$element.hasClass('hover-rotate3d-direction') ? 'rotate3d' : 
                                   this.$element.hasClass('hover-translate3d-direction') ? 'translate3d' : '';
                if (!effectType) return;
                let direction = this.$element.data().direction;
                let directionClass = `${effectType}-${prefix}-${directions[getDirectionKey(ev, this.$element)]}`;
                if(direction === 'horizontal') {
                    directionClass = `${effectType}-${prefix}-${directions[getHorizontalKey(ev, this.$element)]}`
                }
                if(direction === 'vertical') {
                    directionClass = `${effectType}-${prefix}-${directions[getVerticalKey(ev, this.$element)]}`
                }

                if (this.activeClass) {
                    this.$element.removeClass(this.activeClass); 
                }
                this.activeClass = directionClass;
                this.$element.addClass(this.activeClass); 
            }
        }

        $(els).each(function () {
            new Item($(this));
        });
    }

    function hoverScaleSpotlight( $scope ) {
        let els = $scope.find('.hover-spotlight-scale');
        if(!els.length) return;
        const update = (e, isMouseenter) => {
            let item = $(e.currentTarget).find('.item-spotlight').first();
            if (isMouseenter && !item.length) {
                item = $('<span class="item-spotlight"></span>');
                $(e.currentTarget).prepend(item);
            }
            const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
            const mouseX = e.clientX - left;
            const mouseY = e.clientY - top;
            const distToCorners = [
                Math.hypot(mouseX, mouseY), 
                Math.hypot(mouseX - width, mouseY), 
                Math.hypot(mouseX, mouseY - height),
                Math.hypot(mouseX - width, mouseY - height) 
            ];
            const maxRadius = Math.max(...distToCorners);
    
            gsap.to(item, {
                x: mouseX,
                y: mouseY,
                ease: "none",
                duration: 0.3,
                scale: isMouseenter ? (maxRadius / 10) + 0.2 : 0, 
            });
        };
        els.each(function(i, el) {
            $(el).on('mouseenter', (e) => update(e, true));
            $(el).on('mouseleave', (e) => update(e, false));
        })
    
    }
    

    function hoverImageShow($scope) {
        let els = $scope.find('.hover-image-show');
        if(!els.length) return;
        const update = (e, isMousemove) => {
            const imgUrl = $(e.currentTarget).attr('data-image-url');
            let item = $(e.currentTarget).find('.item-image').first();
            if (isMousemove && !item.length) {
                item = $('<span class="item-image"></span>');
                $(e.currentTarget).prepend(item);
            }
            $(item).css('background-image', `url(${imgUrl})`);
            const { left, top } = e.currentTarget.getBoundingClientRect();
            const mouseX = e.clientX - left;
            const mouseY = e.clientY - top;
            const imageWidth = $(item).outerWidth() / 2;
            const imageHeight = $(item).outerHeight() / 2;
            gsap.to(item, {
                x: mouseX - imageWidth,
                y: mouseY - imageHeight,
                ease: "power1.out",
                duration: 0.25,
                delay: 0.15,
                opacity: isMousemove ? 1 : 0,
                scale: isMousemove ? 1 : 0,
            });
        };
        els.each(function(i, el) {
            $(el).on('mousemove', (e) => update(e, true));
            $(el).on('mouseleave', (e) => update(e, false));
        })
    }

    function textEffects( $scope ) {
        const els = $scope.find('.split-text');
        if (!els.length) return;

        // Rotate In
        const effectRoateIn = (el, splitType, settings, elClass) => { 
            let rotateX = 0;
            let rotateY = 0; 
            let transformOrigin = 'top center -90';
            if(elClass.includes('rotate-y')) {
                rotateX = -90;
            }else {
                rotateY = -90;
                transformOrigin = 'center center'
            } 
            gsap.set(el, {
                perspective: 800,
            })
            gsap.from(splitType, {
                duration: settings['duration'],
                opacity: 0,
                rotationX: rotateX,
                rotationY: rotateY,
                scaleY: 0.8, 
                force3D: true,
                transformOrigin: transformOrigin,
                stagger: settings['stagger'],
                delay: settings['delay'],
                scrollTrigger: {
                    trigger: el,
                    start: "top 90%", 
                    toggleActions: "play none none none",
                    once: true,
                },
            });
        }
        // Fade In
        const effectFadeIn = (el, splitType, settings, elClass) => { 
            let x = 0
            let y = 0  
            if(elClass.includes('fade-in-top')) {
                y = 50
            }else if(elClass.includes('fade-in-bottom')) {
                y = -50
            }else if(elClass.includes('fade-in-left')) {
                x = -50
            }else if(elClass.includes('fade-in-right')) {
                x = 50
            }        
            gsap.from(splitType, {
                duration: settings['duration'] ,
                x: x,
                y: y,
                opacity: 0,
                force3D: true,
                stagger: settings['stagger'],
                delay: settings['delay'],
                scrollTrigger: {
                    trigger: el,
                    start: "top 90%", 
                    toggleActions: "play none none none",
                },
            });
        }
        // Slide In
        const effectSlideIn = (el,splitType, settings, elClass) => {
            let y = 0;
            let x = 0;
            if(elClass.includes('btt')) {
                y = '110%';
            }else if(elClass.includes('ttb')) {
                y = '-110%';
            }else if(elClass.includes('ltr')) {
                x = '110%';
            }else if(elClass.includes('rtl')) {
                x = '-110%';
            }
            gsap.from(splitType, {
                duration: settings['duration'],
                force3D: true,
                stagger: settings['stagger'],
                delay: settings['delay'],
                y: y,
                x: x,
                scrollTrigger: {
                    trigger: el,
                    start: "top 90%", 
                    toggleActions: "play none none none",
                },
            });
        }

        // Reveal
        const effectReveal = (el, splitType, settings) => {
            gsap.from(splitType, {
                duration: settings['duration'],
                opacity: 0.05,
                // x: 100,
                force3D: true,
                stagger: settings['stagger'],
                delay: settings['delay'],
                scrollTrigger: {
                    trigger: el,
                    start: "top 90%", 
                    toggleActions: "play none reverse none",
                    scrub: true,
                },
            });
        }

        const applyEffects = (el) => {
            let settings = $(el).data().gsap;
    
            let elClass = $(el).attr('class');
            let attrs = {
                type: 'lines',
                linesClass: 'pxl-line',
            };
            let type = 'lines';
    
            if (elClass.includes('split-into-word')) {
                attrs = { ...attrs, type: 'words', wordsClass: 'pxl-word' };
                type = 'words';
            } else if (elClass.includes('split-into-char')) {
                attrs = { ...attrs, type: 'words, chars', charsClass: 'pxl-char', wordsClass: 'pxl-word' };
                type = 'chars';
            }
    
            $(el).removeClass('visibility-hidden');
    
            if (el.splitTextInstance) {
                el.splitTextInstance.revert();
            }
    
            let splitText = null;
            if ($(el).hasClass('pxl-text-editor-wrapper')) {
                const elP = $(el).find('> p');
                splitText = new SplitText(elP, attrs);
            }else {
                splitText = new SplitText(el, attrs);
            } 
            el.splitTextInstance = splitText;
    
            // Apply effects
            if (elClass.includes('text-effect-rotate-in')) {
                effectRoateIn(el, splitText[type], settings, elClass);
            } else if (elClass.includes('text-effect-fade-in')) {
                effectFadeIn(el, splitText[type], settings, elClass);
            } else if (elClass.includes('text-effect-slide-in')) {
                const splitText2 = new SplitText(el, attrs);
                el.splitTextInstance2 = splitText2;
                if(type === 'lines') {
                    effectSlideIn(el, splitText[type], settings, elClass);                    
                } 
                effectSlideIn(el, splitText2[type], settings, elClass);
            }else if (elClass.includes('text-effect-reveal')) {
                effectReveal(el, splitText[type], settings)
            }
        };
    
        els.each(function (i, el) {
            applyEffects(el);
        });
    
        let resizeTimeout;
        $(window).on('resize', function () {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(function () {
                els.each(function (i, el) {
                    applyEffects(el); 
                });
            }, 300);
        });
    }

    function serviceScrollEffects($scope) {
        let el = $scope.find('.scroll-pin-toggle');
        let items = $(el).find('.pxl-grid-item');
        if(!el.length || !items.length) return;
        let prevIndex = -1;
        ScrollTrigger.create({
            trigger: el,
            start: 'top-=30px top',
            end: 'bottom 0px',
            scrub: 1,
            pin: true,
            pinSpacing: true,
            onUpdate: (self) => {
                let itemIndex = Math.floor(self.progress * items.length);
                itemIndex = Math.min(itemIndex, items.length - 1);
                items.each(function(i, el){
                    if(i !== itemIndex) {
                        $(el).removeClass('active').find('.pxl-accordion-content').slideUp(250);;
                    }else {
                        $(items[i]).addClass('active').find('.pxl-accordion-content').slideDown(250);
                    }
                }) 
            }
        })
    }

    function hoverShowSocialRadial($scope) {
        let els = $scope.find('.show-social-radial');
        if (els.length === 0) return; 

        const randomPosition = () => {
            const directions = [
                { xPercent: -100, yPercent: 0 },
                { xPercent: 100, yPercent: 0 },   
                { xPercent: 0, yPercent: -100 },  
                { xPercent: 0, yPercent: 100 }    
            ];
            return directions[Math.floor(Math.random() * directions.length)];
        };
        
        els.each(function (i, el) {
            const parent = $(el).closest('.pxl-post-item');
            let icons = $(el).find('.pxl-social-link');
        
            icons.each(function (i, icon) {
                gsap.set(icon, { ...randomPosition(), opacity: 0 });
            });
        
            $(parent).on({
                mouseenter() {
                    gsap.to(icons, {
                        xPercent: 0,
                        yPercent: 0,
                        opacity: 1,
                        duration: 0.25,
                        ease: "power1.out",
                    });
                },
                mouseleave() {
                    icons.each(function (i, icon) {
                        let newRandomPos = randomPosition(); // Random từ một hướng cố định
                        gsap.to(icon, { ...newRandomPos, opacity: 0, duration: 0.25 });
                    });
                },
            });
        });
        
        
    }
    
    function hoverTilt($scope) {
        const els = $scope.find(".hover-tilt");
        if(!els.length) return;
        const tilt = $(els).tilt({
            reverse: false,
            max: 10,
            speed: 250,
            perspective: 1000,
            transition: true,
            gyroscope: true,
            gyroscopeMinAngleX: -15,
            gyroscopeMaxAngleX: 15,
            gyroscopeMinAngleY: -15,
            gyroscopeMaxAngleY: 15,
            easing: "cubic-bezier(.03,.98,.52,.99)",    
        });

        tilt.on('change', function(e, transforms) {
            let tiltX = transforms.tiltX;
            let tiltY = transforms.tiltY;
            let tiltItems = $(this).find('.tilt-item');
            tiltItems.each(function() {
                let depth = 50;
                $(this).css({
                    'transform' : `translateZ(${depth}px) translateX(${tiltX * (depth / 50)}px) translateY(${tiltY * (depth / 50)}px)`,
                })
            }) 
        }); 
    }

    function hoverImageDistortionWarp($scope) {
        const els = $scope.find('.hover-image-distortion-warp');
        if(!els.length) return;
        const vs = `#ifdef GL_ES
            precision mediump float;
            #endif
            
            // those are the mandatory attributes that the lib sets
            attribute vec3 aVertexPosition;
            attribute vec2 aTextureCoord;

            // those are mandatory uniforms that the lib sets and that contain our model view and projection matrix
            uniform mat4 uMVMatrix;
            uniform mat4 uPMatrix;

            uniform mat4 texture0Matrix;

            // if you want to pass your vertex and texture coords to the fragment shader
            varying vec3 vVertexPosition;
            varying vec2 vTextureCoord;

            void main() {
                vec3 vertexPosition = aVertexPosition;

                gl_Position = uPMatrix * uMVMatrix * vec4(vertexPosition, 1.0);
        
                // set the varyings
                vTextureCoord = (texture0Matrix * vec4(aTextureCoord, 0., 1.)).xy;
                vVertexPosition = vertexPosition;
        }`     
        const fs = `#ifdef GL_ES
            precision mediump float;
            #endif

            #define PI2 6.28318530718
            #define PI 3.14159265359
            #define S(a,b,n) smoothstep(a,b,n)

            uniform float uTime;
            uniform float uProgress;
            uniform vec2 uReso;
            uniform vec2 uMouse;
            
            // get our varyings
            varying vec3 vVertexPosition;
            varying vec2 vTextureCoord;

            // the uniform we declared inside our javascript

            // our texture sampler (default name, to use a different name please refer to the documentation)
            uniform sampler2D texture0;

            // http://www.flong.com/texts/code/shapers_exp/
            float exponentialEasing (float x, float a){

            float epsilon = 0.00001;
            float min_param_a = 0.0 + epsilon;
            float max_param_a = 1.0 - epsilon;
            a = max(min_param_a, min(max_param_a, a));

            if (a < 0.5){
                // emphasis
                a = 2.0 * a;
                float y = pow(x, a);
                return y;
            } else {
                // de-emphasis
                a = 2.0 * (a-0.5);
                float y = pow(x, 1.0 / (1.-a));
                return y;
            }
            }
        
            void main(){
                vec2 uv = vTextureCoord;

                float progress = uProgress;
            
                float d = exponentialEasing(length( uv - .5 ), progress) - 1.0 + progress * 0.75; 

                vec2 centerInterp = (uv - 0.5) * d;
            
                vec2 r = centerInterp * (progress * 0.6 + 0.4) + uv;
                vec2 g = centerInterp * (progress * 0.9 + 0.1) + uv;
                vec2 b = centerInterp * (progress * 0.9 + 0.1) + uv;
            
                vec4 color = vec4( texture2D( texture0, r).r , texture2D( texture0, g ).g, texture2D( texture0, b).b , 1.); 

                gl_FragColor = color;         
        }`;
        class WEBGL {
            constructor(set) {
                this.webGLCurtain = new Curtains({ 
                    container: set.canvas ,
                    watchScroll: false
                });
                this.planeElement = set.planeElement;
                this.mouse = {
                    x: 0,
                    y: 0
                };
                this.params = {
                    vertexShader: vs, // our vertex shader ID
                    fragmentShader: fs, // our fragment shader ID
                    uniforms: {
                        time: {
                            name: "uTime", // uniform name that will be passed to our shaders
                            type: "1f", // this means our uniform is a float
                            value: 0
                        },
                        mousepos: {
                            name: "uMouse",
                            type: "2f",
                            value: [0, 0]
                        },
                        resolution: {
                            name: "uReso",
                            type: "2f",
                            value: [1, 1] // Initial value, will be updated later
                        },
                        progress: {
                            name: "uProgress",
                            type: "1f",
                            value: 0
                        }
                    }
                };
            }
            initPlane() {
                // create our plane mesh
                this.plane = this.webGLCurtain.addPlane(this.planeElement, this.params);
                if (this.plane) {
                    this.plane.onReady(() => {
                        this.update();
                        this.initEvent();
                    });
                }
            }
            update() {
                this.plane.onRender(() => {
                    this.plane.uniforms.time.value += 0.01; 
                    let bounding = this.planeElement.getBoundingClientRect();
                    this.plane.uniforms.resolution.value = [bounding.width, bounding.height];
                });
            }
            initEvent() {
                this.planeElement.addEventListener("mouseenter", () => {
                    gsap.to(this.plane.uniforms.progress, 1, {
                        value: 1,
                        ease: "expo.inOut"
                    });
                });
            
                this.planeElement.addEventListener("mouseout", () => {
                    gsap.to(this.plane.uniforms.progress, 1, {
                        value: 0,
                        ease: "expo.inOut"
                    });
                });
            }
        }
        els.each(function() {
            const webgl = new WEBGL({
                canvas: $(this)[0],
                planeElement: $(this)[0]
            });
            webgl.initPlane(); 
        })
    }

    function hoverImageDistortionTransition( $scope ) {
        let els = $scope.find('.hover-image-distortion-transition');
        if(!els.length) return;
        els.each(function() {
            const img = $(this).find('img')
            let src = $(img).attr('src');
            let currentEl = $(this);
            let width = parseInt($(img).attr('width')) ?? 1;
            let height = parseInt($(img).attr('height')) ?? 1;
            let myAnimation = new hoverEffect({
                parent: $(this)[0],
                intensity: 0.3,
                image1: src,
                image2: src,
                displacementImage: currentEl.attr('data-displacement') ?? 'http://mouno.local/wp-content/uploads/2025/01/displacement-1.webp',
                imagesRatio: height/width,
            });
        })
    }

    function hoverImageDistortionWave( $scope ) {
        let els = $scope.find('.hover-image-distortion-wave');
        if(!els.length) return;
        const vSheder = ` precision mediump float;
            // default mandatory variables
            attribute vec3 aVertexPosition;
            attribute vec2 aTextureCoord;
            uniform mat4 uMVMatrix;
            uniform mat4 uPMatrix;
            // custom variables
            varying vec3 vVertexPosition;
            varying vec2 vTextureCoord;
            uniform float uTime;
            
            void main() {
                vec3 vertexPosition = aVertexPosition;
            
                // a float varying from -1.5 to 1.5
                float waveCoords = ((uTime / 45.0) * 3.5) - 1.75;
            
                // distance from the waveCoords to the vertex coordinates
                float distanceToWave = distance(vec2(vertexPosition.x, 0.0), vec2(waveCoords, 0.0));
            
                // Modify z position only for wave effect
                vertexPosition.z -= (cos(clamp(distanceToWave, 0.0, 0.75) * 3.141592) - cos(0.75 * 3.141592) + (2.0 * sin(3.141592 * uTime / 90.0))) * 0.025;
            
                // Ensure the scaling of the canvas is not impacted
                gl_Position = uPMatrix * uMVMatrix * vec4(vertexPosition, 1.0);
            
                // varyings
                vTextureCoord = aTextureCoord;
                vVertexPosition = vertexPosition;
            }
        `;
        
        const fSheder = `precision mediump float;
            uniform float uTime;
            varying vec3 vVertexPosition;
            varying vec2 vTextureCoord;
            uniform sampler2D uExample;
            void main() {
                // get our texture coords
                vec2 textureCoords = vec2(vTextureCoord.x, vTextureCoord.y);
                vec4 finalColor = texture2D(uExample, textureCoords);

                gl_FragColor = finalColor;
        }`;
        class DistortionWave {
            constructor(set) {
                this.webGLCurtain = new Curtains({ 
                    container: set.canvas,
                    watchScroll: false
                });
                this.planeElement = set.planeElement;
                this.mouse = {
                    x: 0,
                    y: 0
                };
                this.params = {
                    vertexShader: vSheder,
                    fragmentShader: fSheder,
                    widthSegments: 20,
                    heightSegments: 1,
                    texturesOptions: {
                        minFilter: this.webGLCurtain.gl.LINEAR_MIPMAP_NEAREST
                    },
                    uniforms: {
                        time: {
                            name: "uTime",
                            type: "1f",
                            value: 0,
                        },
                    },
                };
            }
            initPlane() {
                this.plane = this.webGLCurtain.addPlane(this.planeElement, this.params);
                if (this.plane) {
                    this.plane.onReady(() => {
                        this.initEvent();
                    });
                }
            }
            initEvent() {
                this.planeElement.addEventListener("mouseenter", () => {
                    this.isAnimating = true; 
                    gsap.to(this.plane.uniforms.time, {
                        value: 45, 
                        duration: 0.75, 
                        ease: "none", 
                    });
                });
                this.planeElement.addEventListener("mouseout", () => {
                    this.isAnimating = true; 
                    gsap.to(this.plane.uniforms.time, {
                        value: 0, 
                        duration: 0.75,
                        ease: "none",
                    });
                });
            }
        }        

        els.each(function() {
            const curtain = new DistortionWave({
                canvas: $(this)[0],
                planeElement: $(this)[0]
            });
            curtain.initPlane()
        })
    }

    
    $( window ).on( 'elementor/frontend/init', function() {

        // elementorFrontend.hooks.addAction( `frontend/element_ready/pxl_test.default`, hoverImageDistortionWarp());
        elementorFrontend.hooks.addAction( `frontend/element_ready/pxl_service.default`, function( $scope ) {
            setTimeout(function() {
                hoverTransformDirectionAnimation($scope);
            }, 250)
        });
        elementorFrontend.hooks.addAction( 'frontend/element_ready/pxl_link_box.default', function( $scope ) {
            hoverScaleSpotlight($scope)
        });
        elementorFrontend.hooks.addAction( `frontend/element_ready/pxl_popup_button.default`, function( $scope ) {
            hoverScaleSpotlight($scope);
        });
        elementorFrontend.hooks.addAction( `frontend/element_ready/pxl_button.default`, function( $scope ) {
            hoverScaleSpotlight($scope);
        });
        elementorFrontend.hooks.addAction( `frontend/element_ready/pxl_cta_button.default`, function( $scope ) {
            hoverScaleSpotlight($scope);
        });
        elementorFrontend.hooks.addAction( 'frontend/element_ready/pxl_link_box.default', function($scope) {
            hoverImageShow($scope);
        } );
        elementorFrontend.hooks.addAction( `frontend/element_ready/pxl_icon.default`, function( $scope ) {
            // effectPulseLight($scope);
        });
        elementorFrontend.hooks.addAction( `frontend/element_ready/pxl_portfolio.default`, function($scope) {
            hoverTilt($scope);
            hoverImageDistortionTransition($scope)
            hoverImageDistortionWarp($scope)
            hoverImageDistortionWave($scope)
            function cursorButton() {
                let layout = $scope.find('.pxl-layout-portfolio4');
                if(!layout.length) return;
                let items = $(layout).find('.pxl-post-item');
                let cursor = $(layout).find('.cursor-btn');
                gsap.set($(cursor)[0], {opacity: 0, scale: 0})
                $(items).mousemove(function(e) {
                    let offset = $(layout).offset();
                    let relX = e.pageX - offset.left;
                    let relY = e.pageY - offset.top;
                    
                    gsap.to($(cursor)[0], {
                        left: relX,
                        top: relY,
                        scale: 1,
                        opacity: 1,
                        duration: .25,
                        ease: 'none',
                    })
                })
                $(items).mouseout(function(e) {
                    gsap.to($(cursor)[0], {
                        scale: 0,
                        opacity: 0,
                        duration: .25,
                        ease: 'none',
                    })
                })
            }
            cursorButton();
            function boxContentFollowCursor() {
                let layout = $scope.find('.pxl-layout-portfolio1, .pxl-layout-portfolio5');
                if (!layout.length) return;
                let items = $(layout).find('.pxl-post-item');
            
                $(items).mousemove(function (e) {
                    let offset = $(this).offset();
                    let thisWidth = $(this).width();
                    let thisHeight = $(this).height();
                    
                    let boxContent = $(this).find('.follow-cursor');
                    let boxWidth = $(boxContent).outerWidth();
                    let boxHeight = $(boxContent).outerHeight();
            
                    let mouseX = e.pageX - offset.left;
                    let mouseY = e.pageY - offset.top;
            
                    let newX = Math.min(Math.max(mouseX, boxWidth / 2), thisWidth - boxWidth / 2);
                    let newY = Math.min(Math.max(mouseY, boxHeight / 2), thisHeight - boxHeight / 2);
            
                    gsap.to($(boxContent)[0], {
                        left: newX,
                        top: newY,
                        scale: 1,
                        opacity: 1,
                        duration: 0.25,
                        ease: 'none',
                    });
                });
            
                $(items).mouseout(function () {
                    let boxContent = $(this).find('.follow-cursor');
                    gsap.to($(boxContent)[0], {
                        scale: 0,
                        opacity: 0,
                        duration: 0.25,
                        ease: 'none',
                    });
                });
            }
            
            boxContentFollowCursor()
        });
        elementorFrontend.hooks.addAction( `frontend/element_ready/pxl_post.default`, function($scope) {
            hoverScaleSpotlight($scope);
            hoverTilt($scope);
            hoverImageDistortionTransition($scope)
            hoverImageDistortionWarp($scope)
            hoverImageDistortionWave($scope)
        });
        elementorFrontend.hooks.addAction( `frontend/element_ready/pxl_service.default`, function($scope) {
            serviceScrollEffects($scope)
        });
        elementorFrontend.hooks.addAction( `frontend/element_ready/pxl_team.default`, function($scope) {
            hoverShowSocialRadial($scope);
            hoverTilt($scope)
        });
        elementorFrontend.hooks.addAction( `frontend/element_ready/pxl_show_case.default`, function($scope) {
            hoverTilt($scope)
        });
        elementorFrontend.hooks.addAction( `frontend/element_ready/pxl_heading.default`, function( $scope ) {
            textEffects($scope);
        });
        elementorFrontend.hooks.addAction( `frontend/element_ready/pxl_text_editor.default`, function( $scope ) {
            textEffects($scope);
        });
        elementorFrontend.hooks.addAction( `frontend/element_ready/pxl_navigation_menu.default`, function( $scope ) {
            hoverTransformDirectionAnimation($scope);
        });
    });
} )( jQuery );

