import {
  fetchData,
  ajaxRequest,
  getQueryParam,
  getBaseUrl,
  getFormDataAsDict,
  sanitizeInput,
  previewImageAndReurnBase64,
} from "../../global/utils.js";


$(document).ready(function () {
  const API_BASE_URL = getBaseUrl()["apiBaseUrl"];
  const APP_BASE_URL = getBaseUrl()["appBaseUrl"];

  const hotel_id = getQueryParam("hotel_id");
  if (hotel_id) {
  }

  // Handle submission of user feedback and contact form.
  $('#add__update-hotel').on('submit', function (e) {
    e.preventDefault();
    const $formElement = $(this);

    const data = sanitizeInput(getFormDataAsDict($formElement));

    const isSubmit = confirm("You about to add new hotel. Click ok to proceed!")
    if (!isSubmit) {
      return;
    }

    const fileInput = document.getElementById('logo');
    const file = fileInput.files[0];

    if (!file) {
      alert("Please select an image.");
      return;
    }
   const days = parseInt(data.month) * 31;

    const hotel = {
      location: data.location, name: data.name, is_free_trial: data.is_free_trial,
      contact: data.contact, alt_contact: data.alt_contact, days,
      email: data.hotel_email, website: data.website, subdomain: data.subdomain,
      is_active: data.is_active,
    }

    const hotel_setting = {
      early_checkin_amount: data.early_checkin_amount,
      short_time_amount: data.short_time_amount,
      short_time_hours: data.short_time_hours,
      hotel_abbrev: data.hotel_abbrev
    }

    const hotelAdmin = {
      email: data.admin_email, portfolio: data.portfolio,
      first_name: data.first_name, username: data.username,
      last_name: data.last_name,
    }
    const url = API_BASE_URL + "/hotels";

    const reader = new FileReader();
    reader.onload = function(e) {
      const base64Image = e.target.result;
      hotel["logo"] = base64Image

      ajaxRequest(url, "POST", JSON.stringify({ hotel, hotel_setting, hotelAdmin }),
        (response) => {
          alert("Hotel Added Successfully and admin user created");
        },
        (error) => {
          console.log(error);
        }
      );
    };

    reader.readAsDataURL(file);
  });

});

