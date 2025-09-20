// Get the elements from the DOM
const hamburgerButton = document.getElementById('hamburger-menu');
const directoryMenu = document.getElementById('directory-container');
const feedbackFormContainer = document.getElementById('feedbackFormContainer');

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

// Add a click event listener to the container
feedbackFormContainer.addEventListener('click', function(event) {
  // Check if the click occurred on the container itself, not on the form
  if (event.target === feedbackFormContainer) {
    hideFeedbackForm();
  }
});
function showFeedbackForm() {
  const formContainer = document.getElementById('feedbackFormContainer');
  formContainer.classList.remove('hidden');
}

function hideFeedbackForm() {
  const formContainer = document.getElementById('feedbackFormContainer');
  formContainer.classList.add('hidden');
}
