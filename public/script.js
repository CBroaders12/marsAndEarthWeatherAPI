// NASA API Information
let nasaApiKey = "lWkkpS9nzhyh9FJUohbkjLGvm19YdBA6gNhdP2HJ";
let marsURL = `https://api.nasa.gov/insight_weather/?api_key=${nasaApiKey}&feedtype=json&ver=1.0`;

// OpenWeather API Information
let weatherApiKey = "660824dc711c358313eb90ee81cba37f";
let weatherURL = `https://api.openweathermap.org/data/2.5/onecall/timemachine`;
let unitType = "imperial";

// Declare variables for time and location
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const dayNames = ["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"];
let secondsPerDay = 24 * 60 * 60; //for calculating Unix time
let today = new Date(); // Current time
let todaySeconds = Math.floor(today / 1000); // Unix time in seconds

// Declare variables for HTML Tags
let searchForm = document.querySelector("form");
let longSlider = document.getElementById("longitude");
let latSlider = document.getElementById("latitude");
let marsDiv = document.getElementById("mars-weather");
let earthDiv = document.getElementById("earth-weather");

// Slider should display current coordinates
let latOutput = document.getElementById("lat-output");
let longOutput = document.getElementById("long-output");

latOutput.innerHTML = latSlider.value;
longOutput.innerHTML = longSlider.value;

latSlider.oninput = () => (latOutput.innerHTML = latSlider.value);
longSlider.oninput = () => (longOutput.innerHTML = longSlider.value);

// Fetch Data
searchForm.addEventListener("submit", fetchWeather);

function fetchWeather(e) {
	e.preventDefault();

	let unixTime = todaySeconds - secondsPerDay; // Get yesterdays time

	fetch(
		`${weatherURL}?lat=${latSlider.value}&lon=${longSlider.value}&dt=${unixTime}&appid=${weatherApiKey}&units=${unitType}`
	)
		.then((results) => {
			return results.json();
		})
		.then((json) => {
			displayEarthInfo(json);
		});

	fetch(marsURL)
		.then((results) => {
			return results.json();
		})
		.then((json) => {
			displayMarsInfo(json);
		});
}

function displayEarthInfo(json) {
	while (earthDiv.firstChild) {
		earthDiv.removeChild(earthDiv.firstChild);
	}

	// console.log(json);

	let hourlyData = json.hourly;
	let timeStamp = new Date(json.current.dt * 1000);
	let day = timeStamp.getDay();
	let month = timeStamp.getMonth();
	let date = timeStamp.getDate();
	let timeZone = json.timezone;

	let dateString = `${dayNames[day]}, ${monthNames[month]} ${date}`;
	let location = `${latSlider.value}\u00b0, ${longSlider.value}\u00b0`;

	//Get measurements and calculate averages
	let temps = [];
	let avgPressure = 0;
	let avgWindSpeed = 0;
	let avgTemp = 0;
	let minTemp;
	let maxTemp;

	for (hour of hourlyData) {
		temps.push(hour.temp);
		avgTemp += hour.temp;

		avgPressure += hour.pressure;

		avgWindSpeed += hour.wind_speed;
	}

	// Calculate max, min, and average temperature
	minTemp = Math.round(Math.min(...temps));
	maxTemp = Math.round(Math.max(...temps));

	avgTemp /= hourlyData.length;
	avgTemp = Math.round(avgTemp);

	// Calculate average wind speed (measured in mph)
	avgWindSpeed /= hourlyData.length;
	avgWindSpeed = Math.round(avgWindSpeed * 100) / 100; //Round to 2 decimal places
	console.log(`Earth Wind Speed: ${avgWindSpeed} mph`);

	// Calculate average pressure (measured in hPa (1 hPa = 100 Pa))
	avgPressure /= hourlyData.length;
	avgPressure *= 100; //Convert to Pascals
	avgPressure = Math.round(avgPressure * 100) / 100; // Round to 2 decimal places
	console.log(`Earth Pressure: ${avgPressure} Pa`);

	let earthCard = buildCard(location, timeZone, dateString, avgTemp, minTemp, maxTemp, avgPressure, avgWindSpeed);

	earthDiv.appendChild(earthCard);
}

function displayMarsInfo(json) {
	while (marsDiv.firstChild) {
		marsDiv.removeChild(marsDiv.firstChild);
	}

	// console.log(json);

	let solKeys = json.sol_keys;
	let lastSol = solKeys[solKeys.length - 1];
	let solData = json[lastSol];
	// console.log(solData);

	// Get Date
	// let timeStamp = new Date(solData.Last_UTC); // Not used
	let dateString = `Sol ${lastSol}`; // Show the Sol of the Insight mission instead of the Earth Date

	// Get temperature readings in Celsius and convert to Fahrenheit
	let avgTemp = Math.round(1.8 * solData.AT.av + 32);
	let minTemp = Math.round(1.8 * solData.AT.mn + 32);
	let maxTemp = Math.round(1.8 * solData.AT.mx + 32);

	// declare atmospheric variables
	let windSpeed;
	let avgPressure;

	// Pull wind info (speed in m/s)
	if (solData.HWS) {
		windSpeed = solData.HWS.av * 2.237; // Convert to mph for comparison
		windSpeed = Math.round(windSpeed * 100) / 100; // Round to 1 Decimal Place
		console.log(`Mars Wind Speed: ${windSpeed} mph`);
	}

	// Pull pressure info (measured in Pa)
	if (solData.PRE) {
		avgPressure = Math.round(solData.PRE.av * 100) / 100;
		console.log(`Mars Pressure: ${avgPressure} Pa`);
	}

	let marsCard = buildCard(
		"4.5\u00b0 135.6\u00b0",
		"Elysium Planitia",
		dateString,
		avgTemp,
		minTemp,
		maxTemp,
		avgPressure,
		windSpeed
	);

	marsDiv.appendChild(marsCard);
}

function buildCard(location, locationExtra, date, avgTemp, minTemp, maxTemp, pressure = "N/A", windSpeed = "N/A") {
	// !Initialize main card parts
	let card = document.createElement("div");
	let cardHeader = document.createElement("div");
	let cardBody = document.createElement("div");
	let locationText = document.createElement("h4");
	let locationDetail = document.createElement("h5");
	let measurementDate = document.createElement("h5");
	let cardGroup = document.createElement("div");

	// Initialize Temperature sub-card parts
	let tempCard = document.createElement("div");
	let tempCardHeader = document.createElement("div");
	let tempCardBody = document.createElement("div");
	let avgTempText = document.createElement("p");
	let minTempText = document.createElement("p");
	let maxTempText = document.createElement("p");

	// Initialize Atmosphere sub-card parts
	let atmoCard = document.createElement("div");
	let atmoCardHeader = document.createElement("div");
	let atmoCardBody = document.createElement("div");
	let pressureText = document.createElement("p");
	let windText = document.createElement("p");

	//! add Bootstrap Classes
	card.classList.add("card");
	cardHeader.classList.add("card-header");
	cardBody.classList.add("card-body");
	locationText.classList.add("card-title", "text-center", "my-2");
	locationDetail.classList.add("card-subtitle", "text-center");
	measurementDate.classList.add("card-title", "text-center");
	cardGroup.classList.add("card-group");

	// Temperature Card
	tempCard.classList.add("card");
	tempCardHeader.classList.add("card-header");
	tempCardBody.classList.add("card-body");
	avgTempText.classList.add("card-text");
	minTempText.classList.add("card-text");
	maxTempText.classList.add("card-text");

	// Atmospher card
	atmoCard.classList.add("card");
	atmoCardHeader.classList.add("card-header");
	atmoCardBody.classList.add("card-body");
	pressureText.classList.add("card-text");
	windText.classList.add("card-text");

	//! add content to each section
	locationText.innerText = location;
	locationDetail.innerText = locationExtra;
	measurementDate.innerHTML = date;

	// Temperature Card
	tempCardHeader.innerHTML = `<h6 class="text-center">Temperature</h6>`;
	avgTempText.innerHTML = `<strong>Avg:</strong> ${avgTemp} \u00b0F`;
	minTempText.innerHTML = `<strong>Low:</strong> ${minTemp} \u00b0F`;
	maxTempText.innerHTML = `<strong>High:</strong> ${maxTemp} \u00b0F`;

	// Atmosphere Card
	atmoCardHeader.innerHTML = `<h6 class="text-center">Atmosphere</h6>`;
	pressureText.innerHTML = `<strong>Press.:</strong> ${pressure} Pa`;
	windText.innerHTML = `<strong>Wind:</strong> ${windSpeed} mph`;

	//! Put the card together
	cardHeader.appendChild(locationText);
	cardHeader.appendChild(locationDetail);
	cardBody.appendChild(measurementDate);
	cardBody.appendChild(cardGroup);

	// Temperature Card
	tempCardBody.appendChild(avgTempText);
	tempCardBody.appendChild(minTempText);
	tempCardBody.appendChild(maxTempText);
	tempCard.appendChild(tempCardHeader);
	tempCard.appendChild(tempCardBody);

	// Atmosphere Card
	atmoCardBody.appendChild(pressureText);
	atmoCardBody.appendChild(windText);
	atmoCard.appendChild(atmoCardHeader);
	atmoCard.appendChild(atmoCardBody);

	// Join inner cards
	cardGroup.appendChild(tempCard);
	cardGroup.appendChild(atmoCard);

	card.appendChild(cardHeader);
	card.appendChild(cardBody);

	return card;
}
