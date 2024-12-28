import {
  updateElementCount, getBaseUrl, confirmationModal, fetchData,
  getFormDataAsDict, previewImageAndReurnBase64, validateForm,
  showNotification, ajaxRequest,
} from '../../global/utils.js';
$(document).ready(function() {
  const API_BASE_URL = getBaseUrl()['apiBaseUrl'];
  const APP_BASE_URL = getBaseUrl()['appBaseUrl'];

  $('#sidebar__profile').click(function() {
    const profileUrl = APP_BASE_URL + '/pages/profile';

    $('.notifications-dropdown').addClass('hidden');  // Hide menu when select optio

    // Load the profile dashboard section
    $('#dynamic__load-dashboard').load(profileUrl, function() {

      // Populate the input field
      const userId = localStorage.getItem('userId');
      const staffUrl = API_BASE_URL + `/members/${userId}`;
      fetchData(staffUrl)
        .then((response) => {
          const photoSrc = (
            response.profile_photo ?
            `data:image/;base64, ${response.profile_photo}` :
            '/static/images/public/profile_photo_placeholder.png'
          );
          $('#edit-fname').val(response.first_name);
          $('#edit-mname').val(response.middle_name);
          $('#edit-lname').val(response.last_name);
          $('#edit-username').val(response.username);
          $('#edit-gender').val(response.gender);
          $('#edit-email').val(response.email);
          $('#edit-title').val(response.title);
          $('#edit-address').val(response.address);
          $('#edit-phone').val(response.number);
          $('input[name="profile_photo"]').val(
            `data:image/;base64, ${response.profile_photo}`
          );
          $('#profile__photo').attr('src', photoSrc);
        })
        .catch((error) => {
          console.log(error);
        });

      // Trigger file input when image is clicked.
      $('#dynamic__load-dashboard').off('click', '#profile__photo')
        .on('click', '#profile__photo', function() {
          $('#profile__image-fileInput').click();
        });

      // Function triggered when profile images is click.
      const $fileInputSelector = $('#profile__image-fileInput');
      const $imgSelector = $('#profile__photo');
      previewImageAndReurnBase64($fileInputSelector, $imgSelector)
        .then((Base64String) => {
          $('input[name="profile_photo"]').val(Base64String);
        })
        .catch((error) => {
          console.log('Error:', error);
        });
    });
  });

  // Handle form submission for editing profile
  $('#dynamic__load-dashboard').on('submit', '#staff__profile-form', function(e) {
    e.preventDefault();

    const $formSelector = $(this);
    if (!validateForm($formSelector)) {
      showNotification('Please fill all requires field');
      return;
    }
    $('#save-changes').prop('disable', true);
    const data = getFormDataAsDict($formSelector);
    const editUrl = API_BASE_URL + '/users';
    ajaxRequest(editUrl, 'PUT', JSON.stringify(data),
      (response) => {
        $('#save-changes').prop('disable', false);
        showNotification('Profile updated successfully !');

        localStorage.setItem('userName', $('#edit-username').val());
        localStorage.setItem('email', $('#edit-email').val());
        localStorage.setItem('image', $('input[name="profile_photo"]').val());
        localStorage.setItem(
          'name', $('#edit-fname').val() + " " + $('#edit-lname').val()
        );
        $('.sidebar__profile-image').attr(
          'src', $('input[name="profile_photo"]').val()
        );
      },
      (error) => {
        $('#save-changes').prop('disable', false);
        showNotification('An error occured. Try again !', true);
        console.log(error);
      }
    );
  });
});
