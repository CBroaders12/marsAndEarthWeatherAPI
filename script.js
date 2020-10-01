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
let longField = document.getElementById("longitude");
let latField = document.getElementById("latitude");
let marsDiv = document.getElementById("mars-weather");
let earthDiv = document.getElementById("earth-weather");

//Set location date and time
searchForm.addEventListener("submit", fetchWeather);

// TODO: Set location;
// latitude = 39.79;
// longitude = -86.15;

// fetch Earth data for last 5 days

function fetchWeather(e) {
	e.preventDefault();

	for (let i = 4; i >= 0; i--) {
		let unixTime = todaySeconds - i * secondsPerDay;

		fetch(
			`${weatherURL}?lat=${latField.value}&lon=${longField.value}&dt=${unixTime}&appid=${weatherApiKey}&units=${unitType}`
		)
			.then((results) => {
				return results.json();
			})
			.then((json) => {
				console.log(json);
				let weatherDate = new Date(json.current.dt * 1000);
			});
	}

	fetch(marsURL)
		.then((results) => {
			return results.json();
		})
		.then((json) => {
			displayMarsInfo(json);
		});
	// let month = weatherDate.getMonth();
	// let date = weatherDate.getDate();
	// let dayOfWeek = weatherDate.getDay();
}

// function displayEarthInfo {

// }

function displayMarsInfo(json) {
	let solKeys = json.sol_keys;
	for (let i = 2; i < json.sol_keys.length; i++) {
		//Only pulling last 5 days of data
		let solData = json[solKeys[i]];

		// Get temperature readings
		let solTempAvg = solData.AT.av;
		let solTempMin = solData.AT.mn;
		let solTempMax = solData.AT.mx;

		// Get Date
		let timeStamp = new Date(solData.Last_UTC);
		let day = timeStamp.getDay();
		let month = timeStamp.getMonth();
		let date = timeStamp.getDate();

		// Only pull dates that are within the OpenWeather range
		if (timeStamp.getDate() >= fiveDaysAgo.getDate()) {
			console.log("Mars date:", timeStamp);
			let marsCard = document.createElement("div");
			marsCard.classList.add("card");

			marsCard.innerHTML = `
				<h4>${dayNames[day]}, ${monthNames[month]} ${date}</h4>
				<h6>${solTempAvg} \u00b0F</h6>
				<p>Minimum: ${solTempMin} \u00b0F</p>
				<p>Maximum ${solTempMax} \u00b0F</p>`;

			marsDiv.appendChild(marsCard);
		}

		// console.log(`Average: ${solTempAvg} \u00b0F, Minimum: ${solTempMin} \u00b0F, Maximum ${solTempMax} \u00b0F`);
	}
}
