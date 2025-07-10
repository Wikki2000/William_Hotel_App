import {
  ajaxRequest, getBaseUrl
} from '../global/utils.js';
import { initAllStores } from '../global/init_cache.js';

const cache = await initAllStores([]);

const API_BASE_URL = getBaseUrl()['apiBaseUrl'];
const APP_BASE_URL = getBaseUrl()['appBaseUrl'];
const url = API_BASE_URL + "/hotels";
const hotel = await cache.get_by("data", { id: "hotels" });

$(document).ready(function() {

  if (hotel) {
    if (hotel?.logo) {
      $("#hotelLogo").attr("src", `data:image/;base64,${hotel?.logo}`);
    } else {
      $(".top-logo i").show();
      $("#hotelLogo").hide();
    }
    $("#hotelName").text(hotel.name);
  } else {
    ajaxRequest(
      url,
      'GET',
      {},
      function (data) {
        (async function () {
          cache.save_one('data', { id: 'hotels', value: data });
        })();

        $("#hotelLogo").attr("src", `data:image/;base64,${data?.logo}`);
        $("#hotelName").text(data.name);

        //data:image/;base64,{{ logo }}
      },
      function (error) {
      },
    );
  }

  $(".top-bar").click(function() {
    window.location.href = APP_BASE_URL + "/guest";
  });
});
