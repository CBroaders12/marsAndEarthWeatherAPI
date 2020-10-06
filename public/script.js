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
// let fiveDaysAgo = new Date(today - 4 * (secondsPerDay * 1000));

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

// TODO: Set location;
// latitude = latSlider.value;
// longitude = longSlider.value;

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

	//Calculate Avg, min, max temp
	let temps = [];
	let avgTemp = 0;
	let minTemp;
	let maxTemp;
	for (hour of hourlyData) {
		temps.push(hour.temp);
		avgTemp += hour.temp;
	}
	minTemp = Math.round(Math.min(...temps));
	maxTemp = Math.round(Math.max(...temps));

	avgTemp /= hourlyData.length;
	avgTemp = Math.round(avgTemp);

	// TODO: Pull wind info

	// TODO: Pull pressure info

	let earthCard = buildCard(location, timeZone, dateString, avgTemp, minTemp, maxTemp);

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

	// Get temperature readings in Fahrenheit
	let avgTemp = Math.round(1.8 * solData.AT.av + 32);
	let minTemp = Math.round(1.8 * solData.AT.mn + 32);
	let maxTemp = Math.round(1.8 * solData.AT.mx + 32);

	// TODO: Pull wind info
	if (solData.HWS) {
		let windSpeed = solData.HWS.av;
		console.log(windSpeed);
	}
	if (solData.WD) {
		let windDirection = solData.WD.most_common.compass_point;
		console.log(windDirection);
	}

	// TODO: Pull pressure info
	if (solData.PRE) {
		let avgPressure = Math.round(solData.PRE.av);
		console.log(avgPressure);
	}

	let marsCard = buildCard("4.5\u00b0 135.6\u00b0", "Elysium Planitia", dateString, avgTemp, minTemp, maxTemp);

	marsDiv.appendChild(marsCard);
}
// }
// }

function buildCard(location, locationExtra, date, avgTemp, minTemp, maxTemp) {
	let card = document.createElement("div");
	let cardHeader = document.createElement("div");
	let cardBody = document.createElement("div");
	let locationText = document.createElement("h4");
	let locationDetail = document.createElement("h5");
	let measurementDate = document.createElement("h6");
	let avgTempText = document.createElement("p");
	let minTempText = document.createElement("p");
	let maxTempText = document.createElement("p");

	//add Bootstrap Classes
	card.classList.add("card");
	cardHeader.classList.add("card-header");
	cardBody.classList.add("card-body");
	locationText.classList.add("card-title", "text-center", "my-2");
	locationDetail.classList.add("card-subtitle", "text-center");
	measurementDate.classList.add("card-subtitle");
	avgTempText.classList.add("card-text");
	minTempText.classList.add("card-text");
	maxTempText.classList.add("card-text");

	// add content to each section
	locationText.innerText = location;
	locationDetail.innerText = locationExtra;
	measurementDate.innerHTML = date;
	avgTempText.innerHTML = `${avgTemp} \u00b0F`;
	minTempText.innerHTML = `Low: <span> ${minTemp} \u00b0F </span>`;
	maxTempText.innerHTML = `High: <span> ${maxTemp} \u00b0F </span>`;

	// Put the card together
	cardHeader.appendChild(locationText);
	cardHeader.appendChild(locationDetail);
	cardBody.appendChild(measurementDate);
	cardBody.appendChild(avgTempText);
	cardBody.appendChild(minTempText);
	cardBody.appendChild(maxTempText);
	card.appendChild(cardHeader);
	card.appendChild(cardBody);

	return card;
}
