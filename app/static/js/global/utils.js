/**
 * Retrieved data from server server.
 *
 * @param {string} url - The URL to which the request is sent.
 * @return {Promise<object>} - A server response, which contains the data in JSON format.
 */
export async function get(url) {
  try {
    const data = await Promise.resolve($.get(url));
    return data;
  } catch (error) {
    throw error;
  }
}

/**
 * Sends an AJAX request.
 *
 * @param {string} url - The URL to which the request is sent.
 * @param {string} method - The HTTP method to use for request.
 * @param {object} data - The data to send with the request. Default is an empty object.
 * @param {function} onSuccess - Callback function to execute if the request succeeds.
 * @param {function} onError - Callback function to execute if the request fails.
 */
export function ajaxRequest(url, method, data = {}, onSuccess, onError) { $.ajax({
  url: url,
  method: method,
  contentType: 'application/json',
  data: method == 'POST' || method == 'PUT' ? data : null,
  success: onSuccess,
  error: onError,
});
}

/**
 * Toggle password visibility.
 *
 * @param {string} passwordFieldId - The ID of password field.
 * @param {string} toggleButtonId - The ID of button to toggle password.
 */
export function togglePasswordVisibility(passwordFieldId, toggleButtonId) {
  $(`#${toggleButtonId}`).click(function () {
    const $password = $(`#${passwordFieldId}`);

    if ($password.attr('type') === 'password') {
      $password.attr('type', 'text');
    } else {
      $password.attr('type', 'password');
    }
  });
}

/**
 * Alert box for success and error.
 *
 * @param {string} alertDivClass - The class of the Alert DIV.
 * @param {bool} isError - Give a true or false value if it is an error alert.
 * @param {string} successClass - Class for successfull alert with default value.
 * @param {string} errorClass - Class for error alert with default value.
 * @param {string} msg - Message to be display on alert box.
 */
export function alertBox(
  alertDivClass, msg, isError = true,
  successClass = 'auth__success__alert',
  errorClass = 'auth__error__alert'
) {
  if (isError) {
    $(`.${alertDivClass}`).removeClass(successClass)
      .addClass(errorClass).text(msg).show();
  } else {
    $(`.${alertDivClass}`).removeClass(errorClass)
      .addClass(successClass).text(msg).show();
  }
}

/**
 * Define a dictionary of api and app base url,
 * this will make future changes in the base url easy.
 *
 * @return {object} - Object containing base url for api and app. 
 */
export function getBaseUrl() {
  return {
    apiBaseUrl: '/api/v1',
    appBaseUrl: '/app'
  }
}

/**
 * Go back to previous page.
 *
 * @param {string} iconId - The ID of icon to be click.
 */
export function goBack(iconId) {
  $(`#${iconId}`).click(function() {
    window.history.back();
  });
}

/**
 * Retrieve a query parameter value from the current page URL.
 *
 * This function extracts the value of a specified query parameter from the URL's search string.
 *
 * @param {string} param - The name of the query parameter to retrieve.
 * @return {string | null} - The value of the query parameter if found, or `null` if not found.
 */
export function getQueryParam(param) {
  // Create an instance of URLSearchParams from the current window's search string
  const urlParams = new URLSearchParams(window.location.search);

  // Retrieve and return the value of the specified parameter
  return urlParams.get(param);
}

/**
 * Template for rooms list table
 * @room {object} - The response object from database
 * @statusClass {string} - Class for status of room e.g., reserved, available or occupied.
 *
 * @return {string} - The table and contents
 */
export function roomTableTemplate(room, statusClass) {
  // Create the table row HTML
  const row = `<tr>
    <td>
      <div class="featured">
        <img src="${room.image}" alt="Featured Image" class="room-image" />
      </div>
    </td>

    <td>
      <div class="room-info">
        <p class="ui text size-textmd">${room.roomType}</p>
        <p class="room-number-1 ui heading size-textlg">${room.roomNumber}</p>
      </div>
    </td>

    <td>
      <p class="ui text size-textmd">${room.rate}</p>
    </td>

    <td>
      <p class="${statusClass} ui text size-textmd">${room.status}</p>
    </td>
  </tr>`;
  return row;
}

/**
 * Display rooms and it's details
 *
 * @param {object} data - The JSON response of all rooms
 */
export function displayRoomData(data) {
  try {
    const $tableBody = $(".room-table-body");
    // Iterate over the fetched data
    data.forEach((room) => {
      let statusClass = "";
      if (room.status === "available") {
        statusClass = "room-status-4";
      } else if (room.status === "reserved") {
        statusClass = "room-status-3";
      } else if (room.status === "occupied") {
        statusClass = "room-status";
      }

      // Append the row to the table body
      $tableBody.append(roomTableTemplate(room, statusClass));
    });
  } catch (error) {
    console.error("Error fetching room data:", error);
  }
}
