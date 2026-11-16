const image = document.getElementById( 'productImg' );
const nextImage = document.getElementById( 'productImgNext' );
const controls = document.querySelector( '.image-gallery .controls' );
const previousButton = document.querySelector( '.image-gallery .previous' );
const nextButton = document.querySelector( '.image-gallery .next' );
const colorInputs = document.querySelectorAll( '.select-color input[name="color"]' );
const quantityInput = document.getElementById( 'quantity' );

const orderButton = document.querySelector('.order-button');

const selectedSize = document.querySelector('input[name="size"]:checked');
const selectedColor = document.querySelector('input[name="color"]:checked');

const productName = document.querySelector('.details h2').textContent;
const productPrice = document.querySelector('.details h3').textContent;

const decreaseQuantity = document.querySelector( '.quantity-decrease' );
const increaseQuantity = document.querySelector( '.quantity-increase' );
const shippingToggle = document.querySelector( '.shipping-toggle' );
const shippingInformation = document.getElementById( 'shipping-information' );
const recommendedSwatches = document.querySelectorAll( '.recommended-swatch[data-image]' );
const recommendationImageStates = new WeakMap();
const recommendationFadeDuration = window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches ? 0 : 700;
const imageGallery = document.querySelector( '.image-gallery' );
const images = imageGallery.dataset.images.split( ',' ).map( imagePath => imagePath.trim() );
const indicators = images.map( ( _, index ) => {
    const button = document.createElement( 'button' );
    button.type = 'button';
    button.className = 'btn';
    button.setAttribute( 'aria-label', `Show product image ${ index + 1 }` );
    button.addEventListener( 'click', () => showImage( index ) );
    controls.appendChild( button );
    return button;
} );
let currentImage = 0;
let imageRequest = 0;

function showImage( index ){
    currentImage = ( index + images.length ) % images.length;
    const imageSrc = images[ currentImage ];
    const imageAlt = `Product image ${ currentImage + 1 }`;
    const request = ++imageRequest;

    nextImage.style.transition = 'none';
    nextImage.classList.remove( 'is-visible' );
    void nextImage.offsetWidth;
    nextImage.style.transition = '';

    if( image.getAttribute( 'src' ) !== imageSrc ){
        const startCrossfade = () => {
            if(
                request === imageRequest &&
                nextImage.getAttribute( 'src' ) === imageSrc &&
                nextImage.complete &&
                nextImage.naturalWidth > 0
            ){
                requestAnimationFrame( () => {
                    if( request === imageRequest && nextImage.getAttribute( 'src' ) === imageSrc ){
                        nextImage.classList.add( 'is-visible' );
                    }
                } );
            }
        };

        nextImage.alt = imageAlt;
        nextImage.onload = startCrossfade;
        nextImage.onerror = () => {
            if( request === imageRequest ){
                console.error( `Unable to load product image: ${ imageSrc }` );
            }
        };
        nextImage.src = imageSrc;

        if( nextImage.complete && nextImage.naturalWidth > 0 ){
            startCrossfade();
        }
    }

    indicators.forEach( ( indicator, indicatorIndex ) => {
        const isActive = indicatorIndex === currentImage;
        indicator.classList.toggle( 'active', isActive );
        indicator.setAttribute( 'aria-current', isActive ? 'true' : 'false' );
    } );
}

nextImage.addEventListener( 'transitionend', event => {
    if( event.propertyName !== 'opacity' || !nextImage.classList.contains( 'is-visible' ) ){
        return;
    }

    image.src = nextImage.getAttribute( 'src' );
    image.alt = nextImage.alt;
    nextImage.style.transition = 'none';
    nextImage.classList.remove( 'is-visible' );
    void nextImage.offsetWidth;
    nextImage.style.transition = '';
} );

previousButton.addEventListener( 'click', () => showImage( currentImage - 1 ) );
nextButton.addEventListener( 'click', () => showImage( currentImage + 1 ) );
colorInputs.forEach( input => {
    input.addEventListener( 'change', () => showImage( Number( input.dataset.image ) - 1 ) );
} );
decreaseQuantity.addEventListener( 'click', () => {
    if( Number( quantityInput.value ) > Number( quantityInput.min ) ){
        quantityInput.stepDown();
    }
} );
increaseQuantity.addEventListener( 'click', () => quantityInput.stepUp() );
shippingToggle.addEventListener( 'click', () => {
    const isExpanded = shippingToggle.getAttribute( 'aria-expanded' ) === 'true';
    shippingToggle.setAttribute( 'aria-expanded', String( !isExpanded ) );
    shippingInformation.hidden = isExpanded;
} );
recommendedSwatches.forEach( swatch => {
    swatch.addEventListener( 'click', () => {
        const product = swatch.closest( '.recommended-product' );
        const productImage = product.querySelector( '.recommended-product-image' );
        let state = recommendationImageStates.get( product );

        if( !state ){
            state = {
                originalSrc: productImage.getAttribute( 'src' ),
                originalAlt: productImage.alt,
                timer: null,
                transitionTimer: null,
                request: 0
            };
            recommendationImageStates.set( product, state );
        }

        window.clearTimeout( state.timer );
        window.clearTimeout( state.transitionTimer );
        const request = ++state.request;
        const productName = product.querySelector( 'h3' ).textContent.trim();

        product.querySelectorAll( '.recommended-swatch' ).forEach( productSwatch => {
            productSwatch.setAttribute( 'aria-pressed', String( productSwatch === swatch ) );
        } );

        crossfadeRecommendedImage(
            product,
            productImage,
            swatch.dataset.image,
            `${ swatch.dataset.color } ${ productName }`,
            state,
            request,
            () => {
                state.timer = window.setTimeout( () => {
                    if( state.request !== request ){
                        return;
                    }

                    crossfadeRecommendedImage(
                        product,
                        productImage,
                        state.originalSrc,
                        state.originalAlt,
                        state,
                        request,
                        () => {
                            state.timer = null;
                            product.querySelectorAll( '.recommended-swatch' ).forEach( productSwatch => {
                                productSwatch.setAttribute( 'aria-pressed', 'false' );
                            } );
                        }
                    );
                }, 5000 );
            }
        );
    } );
} );

function crossfadeRecommendedImage( product, productImage, imageSrc, imageAlt, state, request, onComplete ){
    const imageFrame = product.querySelector( '.recommended-image' );
    const existingOutgoingImage = imageFrame.querySelector( '.recommended-image-outgoing' );

    if( existingOutgoingImage ){
        existingOutgoingImage.remove();
    }

    const outgoingImage = productImage.cloneNode( false );
    outgoingImage.className = 'recommended-image-outgoing';
    outgoingImage.alt = '';
    outgoingImage.removeAttribute( 'loading' );
    outgoingImage.setAttribute( 'aria-hidden', 'true' );
    outgoingImage.src = productImage.currentSrc || productImage.src;
    imageFrame.appendChild( outgoingImage );

    const incomingImage = new Image();
    incomingImage.onload = () => {
        if( state.request !== request ){
            outgoingImage.remove();
            return;
        }

        productImage.src = imageSrc;
        productImage.alt = imageAlt;
        requestAnimationFrame( () => {
            if( state.request !== request ){
                outgoingImage.remove();
                return;
            }

            outgoingImage.classList.add( 'is-fading' );
            state.transitionTimer = window.setTimeout( () => {
                if( state.request !== request ){
                    return;
                }

                outgoingImage.remove();
                state.transitionTimer = null;
                onComplete();
            }, recommendationFadeDuration );
        } );
    };
    incomingImage.onerror = () => {
        outgoingImage.remove();
        console.error( `Unable to load recommendation image: ${ imageSrc }` );
    };
    incomingImage.src = imageSrc;
}

showImage( currentImage );

orderButton.addEventListener('click', () => {
    
    const selectedSize = document.querySelector('input[name="size"]:checked');
    const selectedColor = document.querySelector('input[name="color"]:checked');

    if (selectedSize === null || selectedColor === null) {
        alert("Please select a size and color.");
        return;
    }

    const size = selectedSize.id;
    const color = selectedColor.id;
    const quantity = quantityInput.value;

    const emailSubject = `Order Request - ${productName}`;

    const emailBody = `Hello!

    This is my order details:

    Product: ${productName}
    Price: ${productPrice}
    Color: ${color}
    Size: ${size}
    Quantity: ${quantity}

    Thank you.`;

const outlookLink = `https://outlook.live.com/mail/0/deeplink/compose?to=orders@examplewebsite142.com&subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    
    window.location.href = outlookLink;
});