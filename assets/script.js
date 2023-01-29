// gets the currrent time from moment.js, gets the start of the day and turns it into a unix value then adds seconds to that value 5 times to get the unix date stamp for midday for thhe nect five days and saves them as variables
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

// gets search histort from local storage. If there is nothing stored in local storage it fills the history with the largest cities in the UK
var historyArray = JSON.parse(localStorage.getItem('history'))
if (historyArray === null) {
  historyArray = ['Exeter', 'London', 'Birmingham', 'Glasgow', 'Liverpool', 'Bristol', 'Manchester', 'Sheffield', 'Leeds'];
}
var localArray = historyArray

// function to populate the history list using the stored array
function sortHistory() {
  for (let i = 0; i < localArray.length; i++) {
    $("#history" + [i]).text(localArray[i])
  }
}

// function to performa new search based on a defined location
function newSearch(location) {
  // removes new search from history if it was in there
  localArray = localArray.filter(e => e !== location)
  // adds the new searcg to the search history (will remain hidden until it is the second element in the array)
  localArray.unshift(location)

  // turns location into coordinates
  $.ajax({
    url: "https://api.openweathermap.org/geo/1.0/direct?q=" + location + "&appid=e67a4f5e5bfdca83b9ba10b8d43c5a60",
    method: "GET"
  }).then(function (response) {
    lat = (response[0].lat)
    lon = (response[0].lon)

    // makes an api call to get the data for current weather conditions
    $.ajax({
      url: "https://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lon + "&appid=e67a4f5e5bfdca83b9ba10b8d43c5a60&units=metric",
      method: "GET"
    }).then(function (response) {
      // this populates the application objects with the responses
      $(`#currentLocationName`).text(response.name)
      var currentDate = moment.unix(response.dt).format("dddd Do MMM"); // uses moment to change the unix value to a date format
      $("#currentDateAndTime").text(currentDate);
      weatherIcon = $(`#currentWeatherIcon`).html(`<img class="icon" src="assets/icons/${response.weather[0].icon}.svg"></img>`);
      temperature = $(`#currentTemperature`).text(Math.round(response.main.temp) + '°');
      humidity = $(`#currentHumidity`).text("Humidity: " + response.main.humidity + '%');
      windSpeed = $(`#currentWindSpeed`).text("Wind speed: " + response.wind.speed + 'mph');
    });

    // makes an api call to get the data for forecast weather conditions
    $.ajax({
      url: "https://api.openweathermap.org/data/2.5/forecast?lat=" + lat + "&lon=" + lon + "&appid=e67a4f5e5bfdca83b9ba10b8d43c5a60&units=metric",
      method: "GET"
    }).then(function (response) {
      var forecastArrayIndex = 0 // an index value for every time there is a true result from the below for loop
      for (let i = 0; i < response.list.length; i++) {
        if (response.list[i].dt === forecastArray[forecastArrayIndex]) {
          // if a timestamp matches a timestamp from the forecast array then in populates the forecast objects
          var date = moment.unix(response.list[i].dt).format("dddd Do MMM");
          forecastDate = $('#forecast' + [forecastArrayIndex] + 'Date').text(date)
          forecastIcon = $('#forecast' + [forecastArrayIndex] + 'Icon').html(`<img class="forecastIcon" src="assets/icons/${response.list[i].weather[0].icon}.svg"></img>`);
          forecastTemperature = $('#forecast' + [forecastArrayIndex] + 'Temp').text(Math.round(response.list[i].main.temp) + '°');
          humidity = $('#forecast' + [forecastArrayIndex] + 'Humidity').text("Humidity: " + response.list[i].main.humidity + '%');
          windSpeed = $('#forecast' + [forecastArrayIndex] + 'Wind').text("Wind speed: " + response.list[i].wind.speed + 'mph');
          forecastArrayIndex++
        } else { // this is if the application runs and there is no 5th day midday value avaiilable it fills the 5th forecast with the final entry in the list
          var date = moment.unix(response.list[39].dt).format("dddd Do MMM");
          forecastDate = $('#forecast4Date').text(date)
          forecastIcon = $('#forecast4Icon').html(`<img class="forecastIcon" src="assets/icons/${response.list[39].weather[0].icon}.svg"></img>`);
          forecastTemperature = $('#forecast4Temp').text(Math.round(response.list[39].main.temp) + '°');
          humidity = $('#forecast4Humidity').text("Humidity: " + response.list[39].main.humidity + '%');
          windSpeed = $('#forecast4Wind').text("Wind speed: " + response.list[39].wind.speed + 'mph');
        }
      }
    });
  });
  $(`#search-input`).val(``) //clears the search box
  storedHistory = JSON.stringify(localArray) // sets the new search history in storage
  localStorage.setItem('history', storedHistory)
  sortHistory() // repopulates the search history
}

newSearch('Exeter') // runs a search with a default location of Exeter when the page first opens
sortHistory()

// code for when a location is typed in to the search form
$("#search-button").on("click", function (event) {
  event.preventDefault();
  var searchLocation = $(`#search-input`).val().trim()
  var location = searchLocation.charAt(0).toUpperCase() + searchLocation.slice(1); // formats the location to have a capital letter so all history items are formatted the same
  newSearch(location) // runs the search function using the location
});

// code for when a location is clicked in the history
$(".history").click(function () {
  var location = this.textContent
  newSearch(location) // runs the search function using the location
});