const colorInputs = document.querySelectorAll( '.select-color input[name="color"]' );
const quantityInput = document.getElementById( 'quantity' );
const decreaseQuantity = document.querySelector( '.quantity-decrease' );
const increaseQuantity = document.querySelector( '.quantity-increase' );
const shippingToggle = document.querySelector( '.shipping-toggle' );
const shippingInformation = document.getElementById( 'shipping-information' );
const recommendedSwatches = document.querySelectorAll( '.recommended-swatch[data-image]' );
const recommendationImageStates = new WeakMap();
const recommendationFadeDuration = window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches ? 0 : 700;
const imageGallery = document.querySelector( '.image-gallery' );
const carouselItems = Array.from( imageGallery.querySelectorAll( '.carousel-item' ) );
const carouselIndicators = Array.from( imageGallery.querySelectorAll( '.carousel-indicator' ) );

colorInputs.forEach( input => {
    input.addEventListener( 'change', () => {
        showImage( Number( input.dataset.image ) - 1 );
    } );
} );

const selectedColor = Array.from( colorInputs ).find( input => input.checked );
if( selectedColor ){
    showImage( Number( selectedColor.dataset.image ) - 1 );
}

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

function showImage( imageIndex ){
    carouselItems.forEach( ( item, index ) => {
        item.classList.toggle( 'active', index === imageIndex );
    } );
    carouselIndicators.forEach( ( indicator, index ) => {
        const isActive = index === imageIndex;
        indicator.classList.toggle( 'active', isActive );

        if( isActive ){
            indicator.setAttribute( 'aria-current', 'true' );
        } else {
            indicator.removeAttribute( 'aria-current' );
        }
    } );
}

const TO_ADDRESS = "orders@examplewebsite142.com";

const orderButton = document.querySelector('.order-button');

const productName = document.querySelector('.details h2').textContent;
const productPrice = document.querySelector('.details h3').textContent;

function buildOrderEmail() {
    const selectedSize = document.querySelector('input[name="size"]:checked');
    const selectedColor = document.querySelector('input[name="color"]:checked');

    if (selectedSize === null || selectedColor === null) {
        alert("Please select a size and color.");
        return null;
    }

    const size = selectedSize.id;
    const color = selectedColor.id;
    const quantity = quantityInput.value;

    const subject = "Order Request - " + productName;

    const body =
        "Hello!\r\n\r\n" +
        "This is my order details:\r\n\r\n" +
        "Product: " + productName + "\r\n" +
        "Price: " + productPrice + "\r\n" +
        "Color: " + color + "\r\n" +
        "Size: " + size + "\r\n" +
        "Quantity: " + quantity + "\r\n\r\n" +
        "Thank you.";

    return (
        "https://outlook.live.com/mail/0/deeplink/compose?to=" + TO_ADDRESS +
        "&subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body)
    );
}

orderButton.addEventListener('click', function () {
    const emailLink = buildOrderEmail();

    if (emailLink === null) {
        return;
    }

    window.location.href = emailLink;
});
