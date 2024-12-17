$(document).ready(function() {
  // Hide dropdown menus when clicking outside
  $(document).on('click', function (e) {
    if (!$(e.target).closest('.dropdown').length) {
      $('.dropdown-menu').hide();
    }
  });

  // cancel confirmation modal
  $('#dynamic__load-dashboard').on('click', '#order__cancel-btn, .closePopupModal', function(){
    $('#order__popup-modal').hide();
    $('.popup-modal').hide();
  });
});
