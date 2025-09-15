// Get the elements from the DOM
const hamburgerButton = document.getElementById('hamburger-menu');
const directoryMenu = document.getElementById('directory-container');

// Function to toggle the menu visibility
function toggleMenu() {
    directoryMenu.classList.toggle('show');
}

// Add a click event listener to the hamburger button to toggle the menu
hamburgerButton.addEventListener('click', function(event) {
    // Stop the click event from propagating to the document
    event.stopPropagation();
    toggleMenu();
});

// Add a click event listener to the entire document
document.addEventListener('click', function(event) {
    const isClickInsideMenu = directoryMenu.contains(event.target);
    const isClickOnHamburger = hamburgerButton.contains(event.target);

    // If the menu is open AND the click is NOT inside the menu AND the click is NOT on the hamburger button
    if (directoryMenu.classList.contains('show') && !isClickInsideMenu && !isClickOnHamburger) {
        // Close the menu
        toggleMenu();
    }
});