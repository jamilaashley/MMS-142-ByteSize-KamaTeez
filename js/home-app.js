const reducedMotion = window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;
const recommendationFadeDuration = reducedMotion ? 0 : 700;
const resetDelay = 5000;

document.querySelectorAll( '.recommended-product' ).forEach( product => {
    const imageFrame = product.querySelector( '.recommended-image' );
    const productImage = product.querySelector( '.recommended-product-image' );
    const originalSrc = productImage.getAttribute( 'src' );
    const originalAlt = productImage.alt;
    let request = 0;
    let resetTimer = null;
    let transitionTimer = null;

    product.querySelectorAll( '.recommended-swatch[data-image]' ).forEach( swatch => {
        swatch.addEventListener( 'click', () => {
            window.clearTimeout( resetTimer );
            window.clearTimeout( transitionTimer );
            const currentRequest = ++request;
            const productName = product.querySelector( '.recommended-product-title h2' ).textContent.trim();

            product.querySelectorAll( '.recommended-swatch' ).forEach( productSwatch => {
                productSwatch.setAttribute( 'aria-pressed', String( productSwatch === swatch ) );
            } );

            crossfadeImage(
                swatch.dataset.image,
                `${ swatch.dataset.color } ${ productName }`,
                currentRequest,
                () => {
                    resetTimer = window.setTimeout( () => {
                        if( request !== currentRequest ){
                            return;
                        }

                        crossfadeImage( originalSrc, originalAlt, currentRequest, () => {
                            product.querySelectorAll( '.recommended-swatch' ).forEach( productSwatch => {
                                productSwatch.setAttribute( 'aria-pressed', 'false' );
                            } );
                        } );
                    }, resetDelay );
                }
            );
        } );
    } );

    function crossfadeImage( imageSrc, imageAlt, currentRequest, onComplete ){
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
            if( request !== currentRequest ){
                outgoingImage.remove();
                return;
            }

            productImage.src = imageSrc;
            productImage.alt = imageAlt;
            requestAnimationFrame( () => {
                if( request !== currentRequest ){
                    outgoingImage.remove();
                    return;
                }

                outgoingImage.classList.add( 'is-fading' );
                transitionTimer = window.setTimeout( () => {
                    if( request !== currentRequest ){
                        return;
                    }

                    outgoingImage.remove();
                    onComplete();
                }, recommendationFadeDuration );
            } );
        };
        incomingImage.onerror = () => {
            outgoingImage.remove();
            console.error( `Unable to load product image: ${ imageSrc }` );
        };
        incomingImage.src = imageSrc;
    }
} );
