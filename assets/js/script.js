$(function(){

    /* Configuration */

    var weatherDiv = $('#weather'),
        scroller = $('#scroller'),
        location = $('p.location'),
        x = 0,
        symbols = ['C','F'];

    // Does this browser support geolocation?
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(locationSuccess, locationError);
    }
    else{
        showError("Your browser does not support Geolocation!");
    }

    // Get user's location, and use OpenWeatherMap
    // to get the location name and weather forecast

    function locationSuccess(position) {

        try{

            // Retrive the cache
            var cache = localStorage.weatherCache && JSON.parse(localStorage.weatherCache);

            var d = new Date();

            // If the cache is newer than 30 minutes, use the cache
            if(cache && cache.timestamp && cache.timestamp > d.getTime() - 30*60*1000){

                // Get the offset from UTC (turn the offset minutes into ms)
                var offset = d.getTimezoneOffset()*60*1000;
                var city = cache.data.name;
                var country = cache.data.sys.country;

                // Add location to page
                location.html(city+', <b>'+country+'</b>');
                console.log('lat=' + position.coords.latitude + '&lon=' + position.coords.longitude);
                
                // Add temp to page
                addWeather(cache.data.main.temp);
                $("#symbol").on("click", function(){addWeather(cache.data.main.temp)});
                
                // Add condition to page
                document.getElementById("condition").innerHTML = cache.data.weather[0].main;
                
                //adds icon image
                ajax_test(function(data){
        
                    var icon = cache.data.weather[0].description;
                    
                    var div = document.getElementById("iconBox");
                    
                    switch(icon){
                        case "clear sky":    
                            div.innerHTML = data.sunny;
                            break;
                        case "few clouds":
                            div.innerHTML = data.cloudy;
                            break;
                        case "rain":
                            div.innerHTML = data.sun_showers;
                            break;
                        case "scattered clouds":
                            div.innerHTML = data.cloudy;
                            break;
                        case "broken clouds":
                            div.innerHTML = data.cloudy;
                            break;
                        case "shower rain":
                            div.innerHTML = data.rainy;
                            break;
                        case "thunderstorm":
                            div.innerHTML = data.thunder;
                            break;
                        case "snow":
                            div.innerHTML = data.flurries;
                            break;
                        case "mist":
                            div.innerHTML = data.cloudy;
                            break;
                        default:
                    
                    }
                });

            }

            else{

                // If the cache is old or nonexistent, issue a new AJAX request
                
                console.log('lat=' + position.coords.latitude + '&lon=' + position.coords.longitude);

                var weatherAPI = 'http://api.openweathermap.org/data/2.5/weather?lat='+position.coords.latitude+'&lon='+position.coords.longitude+'&callback=?&appid=d764b67a93d8cc2654e70be7d6800994';

                $.getJSON(weatherAPI, function(response){

                    // Store the cache
                    localStorage.weatherCache = JSON.stringify({
                        timestamp:(new Date()).getTime(),   // getTime() returns milliseconds
                        data: response
                    });

                    // Call the function again
                    locationSuccess(position);
                });
            }

        }
        catch(e){
            showError("We can't find information about your city!");
            window.console && console.error(e);
        }
    }
    
    function addWeather(condition){
        document.getElementById("temp").innerHTML = convertTemperature(condition) + '°';
        document.getElementById("symbol").innerHTML = symbols[x];
        x = 1 - x;
    }
    
    function ajax_test(callback){  
       $.ajax({
          //this is the url to my json.js file
          url: "http://millerjay1985.github.io/weather/assets/json/json_data.json.js",
          dataType: "jsonp",
          //this is the name of the function in my .json.js file
          jsonpCallback: "myFunction",
          success: function(data) {  
            callback(data);
         }
       });  
    }

    /* Error handling functions */

    function locationError(error){
        switch(error.code) {
            case error.TIMEOUT:
                showError("A timeout occured! Please try again!");
                break;
            case error.POSITION_UNAVAILABLE:
                showError('We can\'t detect your location. Sorry!');
                break;
            case error.PERMISSION_DENIED:
                showError('Please allow geolocation access for this to work.');
                break;
            case error.UNKNOWN_ERROR:
                showError('An unknown error occured!');
                break;
        }

    }

    function convertTemperature(kelvin){
        // Convert the temperature to either Celsius or Fahrenheit:
        return Math.round(x == '0' ? (kelvin - 273.15) : (kelvin*9/5 - 459.67));
    }

    function showError(msg){
        weatherDiv.addClass('error').html(msg);
    }
});
