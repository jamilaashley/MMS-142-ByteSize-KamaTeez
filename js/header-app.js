document.querySelectorAll( '.navigation' ).forEach( navigation => {
    const toggle = navigation.querySelector( '.menu-toggle[data-bs-toggle="dropdown"]' );

    if( !toggle ){
        return;
    }

    navigation.classList.add( 'menu-ready' );

    toggle.addEventListener( 'show.bs.dropdown', () => {
        toggle.setAttribute( 'aria-label', 'Close navigation menu' );
    } );

    toggle.addEventListener( 'hidden.bs.dropdown', () => {
        toggle.setAttribute( 'aria-label', 'Open navigation menu' );
    } );
} );