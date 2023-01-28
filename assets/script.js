
var historyArray = JSON.parse(localStorage.getItem('history'))
if (historyArray === null) {
  historyArray = [];
}
var localArray = historyArray

newSearch('Exeter')

function sortHistory() {
  for (let i = 0; i < localArray.length; i++) {
    $("#history" + [i + 1]).text(localArray[i + 1])
  }
}

sortHistory()

// code for when a location is typed in to the search form
$("#search-button").on("click", function (event) {
  event.preventDefault();
  var location = $(`#search-input`).val().trim()

  newSearch(location)

});

$(".history").click(function () {
  var location = this.textContent

  newSearch(location)

});

function newSearch(location) {
  localArray = localArray.filter(e => e !== location)
  localArray.unshift(location)

  // turns place name into coordinates
  $.ajax({
    url: "http://api.openweathermap.org/geo/1.0/direct?q=" + location + "&appid=e67a4f5e5bfdca83b9ba10b8d43c5a60",
    method: "GET"
  }).then(function (response) {
    lat = (response[0].lat)
    lon = (response[0].lon)

    // current weather
    $.ajax({
      url: "https://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lon + "&appid=e67a4f5e5bfdca83b9ba10b8d43c5a60&units=metric",
      method: "GET"
    }).then(function (response) {
      console.log(response) // place code for current weather here
      $(`#currentLocationName`).text(response.name)

      var currentDate = moment.unix(response.dt).format("dddd Do MMM");
      $("#currentDateAndTime").text(currentDate);
      weatherIcon = $(`#currentWeatherIcon`).html(`<img class="icon" src="assets/icons/${response.weather[0].icon}.svg"></img>`);
      temperature = $(`#currentTemperature`).text(Math.round(response.main.temp) + '°');
      humidity = $(`#currentHumidity`).text("Humidity: " + response.main.humidity + '%');
      windSpeed = $(`#currentWindSpeed`).text("Wind speed: " + response.wind.speed + 'mph');
    });

    // forecast weather
    $.ajax({
      url: "https://api.openweathermap.org/data/2.5/forecast?lat=" + lat + "&lon=" + lon + "&appid=e67a4f5e5bfdca83b9ba10b8d43c5a60&units=metric",
      method: "GET"
    }).then(function (response) {

      for (let i = 0; i < 5; i++) {
        var count = ([i + 1] * 4)
        var forecastDate = moment.unix(response.list[count].dt).format("dddd Do MMM");
        forecastDate = $('#forecast' + [i] + 'Date').text(forecastDate + count)
        forecastIcon = $('#forecast' + [i] + 'Icon').html(`<img class="forecastIcon" src="assets/icons/${response.list[count].weather[0].icon}.svg"></img>`);
        forecastTemperature = $('#forecast' + [i] + 'Temp').text(Math.round(response.list[count].main.temp) + '°');
        humidity = $('#forecast' + [i] + 'Humidity').text("Humidity: " + response.list[count].main.humidity + '%');
        windSpeed = $('#forecast' + [i] + 'Wind').text("Wind speed: " + response.list[count].wind.speed + 'mph');
      }
    });
  });

  $(`#search-input`).val(``);
  storedHistory = JSON.stringify(localArray)
  localStorage.setItem('history', storedHistory)
  sortHistory()
}