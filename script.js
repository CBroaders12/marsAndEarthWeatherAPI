let nasaApiKey = "lWkkpS9nzhyh9FJUohbkjLGvm19YdBA6gNhdP2HJ";
let marsURL = `https://api.nasa.gov/insight_weather/?api_key=${nasaApiKey}&feedtype=json&ver=1.0`;
let weatherApiKey = "660824dc711c358313eb90ee81cba37f";
let weatherURL = `https://api.openweathermap.org/data/2.5/onecall/timemachine`;
let unitType = "imperial";

// Declare variables for time and location
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const dayNames = ["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"];
let secondsPerDay = 24 * 60 * 60; //for calculating Unix time
let today = new Date(); // Current time
let todaySeconds = Math.floor(today / 1000); // Unix time in seconds
let fiveDaysAgo = new Date(today - 4 * (secondsPerDay * 1000));

// Declare variables for HTML Tags
let searchForm = document.querySelector("form");
let longSlider = document.getElementById("longitude");
let latSlider = document.getElementById("latitude");
// let marsDiv = document.getElementById("mars-weather");
// let earthDiv = document.getElementById("earth-weather");
let weatherDiv = document.getElementById("weather-cards");

// Fetch Data
searchForm.addEventListener("submit", fetchWeather);

// TODO: Set location;
// latitude = latSlider.value;
// longitude = longSlider.value;

function fetchWeather(e) {
	e.preventDefault();

	// for (let i = 4; i >= 0; i--) {
	let unixTime = todaySeconds - secondsPerDay; // Get yesterdays time

	fetch(
		`${weatherURL}?lat=${latSlider.value}&lon=${longSlider.value}&dt=${unixTime}&appid=${weatherApiKey}&units=${unitType}`
	)
		.then((results) => {
			return results.json();
		})
		.then((json) => {
			displayEarthInfo(json);
			// let weatherDate = new Date(json.current.dt * 1000);
		});
	// }

	fetch(marsURL)
		.then((results) => {
			return results.json();
		})
		.then((json) => {
			displayMarsInfo(json);
		});
}

function displayEarthInfo(json) {
	// console.log(json);
	let hourlyData = json.hourly;
	let timeStamp = new Date(json.current.dt * 1000);
	let day = timeStamp.getDay();
	let month = timeStamp.getMonth();
	let date = timeStamp.getDate();

	let dateString = `${dayNames[day]}, ${monthNames[month]} ${date}`;
	// console.log(hourlyData);
	let location = `${latSlider.value}\u00b0 N, ${longSlider.value}\u00b0 E`;
	// console.log(typeof location);

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

	// let earthCard = document.createElement("div");
	// earthCard.classList.add("card");

	let earthCard = buildCard(location, dateString, avgTemp, minTemp, maxTemp);

	// earthCard.innerHTML = `
	// 		<h5>${dayNames[day]}, ${monthNames[month]} ${date}</h5>
	// 		<h6>${avgTemp} \u00b0F</h6>
	// 		<p>Low: ${minTemp} \u00b0F</p>
	// 		<p>High: ${maxTemp} \u00b0F</p>`;

	weatherDiv.appendChild(earthCard);
}

function displayMarsInfo(json) {
	let solKeys = json.sol_keys;
	let lastSol = solKeys[solKeys.length - 1];
	// console.log(solKeys);
	let solData = json[lastSol];
	// console.log(solData);

	// Get Date
	let timeStamp = new Date(solData.Last_UTC);
	let day = timeStamp.getDay();
	let month = timeStamp.getMonth();
	let date = timeStamp.getDate();
	let dateString = `Sol ${lastSol}`; // ${dayNames[day]}, ${monthNames[month]} ${date}`;

	// Get temperature readings
	let avgTemp = Math.round(solData.AT.av);
	let minTemp = Math.round(solData.AT.mn);
	let maxTemp = Math.round(solData.AT.mx);

	// Only pull dates that are within the OpenWeather range
	// if (timeStamp >= fiveDaysAgo) {
	// console.log("Mars date:", timeStamp);
	// let marsCard = document.createElement("div");
	// marsCard.classList.add("card");

	// marsCard.innerHTML = `
	// 			<h5>${dayNames[day]}, ${monthNames[month]} ${date}</h5>
	// 			<h6>${solTempAvg} \u00b0F</h6>
	// 			<p>Low: ${solTempMin} \u00b0F</p>
	// 			<p>High: ${solTempMax} \u00b0F</p>`;

	let marsCard = buildCard("Elysium Planitia", dateString, avgTemp, minTemp, maxTemp);

	weatherDiv.appendChild(marsCard);
}
// }
// }

function buildCard(location, date, avgTemp, minTemp, maxTemp) {
	let card = document.createElement("div");
	let cardBody = document.createElement("div");
	let cardTitle = document.createElement("h5");
	let cardSubTitle = document.createElement("h6");
	let avgTempText = document.createElement("p");
	let minTempText = document.createElement("p");
	let maxTempText = document.createElement("p");

	//add Bootstrap Classes
	card.classList.add("card");
	cardBody.classList.add("card-body");
	cardTitle.classList.add("card-title");
	cardSubTitle.classList.add("card-subtitle");
	avgTempText.classList.add("card-text");
	minTempText.classList.add("card-text");
	maxTempText.classList.add("card-text");

	// add content to each section
	cardTitle.innerText = location;
	cardSubTitle.innerHTML = date;
	avgTempText.innerHTML = `${avgTemp} \u00b0F`;
	minTempText.innerHTML = `Low: <span> ${minTemp} \u00b0F </span>`;
	maxTempText.innerHTML = `High: <span> ${maxTemp} \u00b0F </span>`;

	// Put the card together
	cardBody.appendChild(cardTitle);
	cardBody.appendChild(cardSubTitle);
	cardBody.appendChild(avgTempText);
	cardBody.appendChild(minTempText);
	cardBody.appendChild(maxTempText);
	card.appendChild(cardBody);

	return card;
}
