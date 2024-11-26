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
