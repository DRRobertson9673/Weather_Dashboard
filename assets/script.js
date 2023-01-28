var forecastArray = []
var now = moment()
var startdate = now.startOf('day');
var startdateUnix = moment(startdate).format('X')
var forecastDay0 = parseInt(startdateUnix) + 129600
forecastArray.push(forecastDay0)
var forecastDay1 = parseInt(startdateUnix) + 216000
forecastArray.push(forecastDay1)
var forecastDay2 = parseInt(startdateUnix) + 302400
forecastArray.push(forecastDay2)
var forecastDay3 = parseInt(startdateUnix) + 388800
forecastArray.push(forecastDay3)
var forecastDay4 = parseInt(startdateUnix) + 475200
forecastArray.push(forecastDay4)

var historyArray = JSON.parse(localStorage.getItem('history'))
if (historyArray === null) {
  historyArray = ['Exeter', 'London', 'Birmingham', 'Glasgow', 'Liverpool', 'Bristol', 'Manchester', 'Sheffield', 'Leeds'];
}
var localArray = historyArray

function sortHistory() {
  for (let i = 0; i < localArray.length; i++) {
    $("#history" + [i]).text(localArray[i])
  }
}

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
      // place code for current weather here
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
      var forecastArrayIndex = 0
      for (let i = 0; i < response.list.length; i++) {
        if (response.list[i].dt === forecastArray[forecastArrayIndex]) {
          var date = moment.unix(response.list[i].dt).format("dddd Do MMM");
          forecastDate = $('#forecast' + [forecastArrayIndex] + 'Date').text(date)
          forecastIcon = $('#forecast' + [forecastArrayIndex] + 'Icon').html(`<img class="forecastIcon" src="assets/icons/${response.list[i].weather[0].icon}.svg"></img>`);
          forecastTemperature = $('#forecast' + [forecastArrayIndex] + 'Temp').text(Math.round(response.list[i].main.temp) + '°');
          humidity = $('#forecast' + [forecastArrayIndex] + 'Humidity').text("Humidity: " + response.list[i].main.humidity + '%');
          windSpeed = $('#forecast' + [forecastArrayIndex] + 'Wind').text("Wind speed: " + response.list[i].wind.speed + 'mph');
          forecastArrayIndex++
        }
      }
    });
  });
  $(`#search-input`).val(``);
  storedHistory = JSON.stringify(localArray)
  localStorage.setItem('history', storedHistory)
  sortHistory()
}

newSearch('Exeter')
sortHistory()

// code for when a location is typed in to the search form
$("#search-button").on("click", function (event) {
  event.preventDefault();
  var searchLocation = $(`#search-input`).val().trim()
  var location = searchLocation.charAt(0).toUpperCase() + searchLocation.slice(1);
  newSearch(location)
});

$(".history").click(function () {
  var location = this.textContent
  newSearch(location)
});