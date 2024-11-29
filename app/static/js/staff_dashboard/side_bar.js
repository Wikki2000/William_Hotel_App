$(document).ready(function() {
  $('#sidebar__name').text(localStorage.getItem('name'));
  $('#sidebar__email').text(localStorage.getItem('email'))
});
