
document.addEventListener('DOMContentLoaded', function() {
  const acronymHeader = document.getElementById('acronymHeader');

  function updateHeader() {
    if (window.innerWidth <= 600) {
      acronymHeader.innerHTML = 'Intergenerational Community Homeshare Activity'; 
    } else {
      acronymHeader.innerHTML = 'The Intergenerational Community Homeshare Activity (I-CHAt)';
    }
  }

  updateHeader();

  window.addEventListener('resize', updateHeader);
});
