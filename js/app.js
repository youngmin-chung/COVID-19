// SELECT ALL ELEMENTS
const country_name_element = document.querySelector(".country .name");

const total_cases_element = document.querySelector(".total-cases .value");
const new_cases_element = document.querySelector(".total-cases .new-value");

const active_cases_element = document.querySelector(".active .value");
const new_active_cases_element = document.querySelector(".active .new-value");

const recovered_element = document.querySelector(".recovered .value");
const new_recovered_element = document.querySelector(".recovered .new-value");

const deaths_element = document.querySelector(".deaths .value");
const new_deaths_element = document.querySelector(".deaths .new-value");

const ctx = document.getElementById("axes_line_chart").getContext("2d");

// APP VARIABLES
let app_data = [],
  cases_list = [],
  active_cases_list = [],
  recovered_list = [],
  deaths_list = [],
  deaths = [],
  formatedDates = [],
  jsonData;

// GET USERS COUNTRY CODE
let country_code = geoplugin_countryCode();
let user_country;
country_list.forEach((country) => {
  if (country.code == country_code) {
    user_country = country.name;
  }
});

/*----+----+----+----+----+----+----+----+--*\
\*             API URL AND KEY              */
/*                                          *\
\*----+----+----+----+----+----+----+----+--*/

function fetchData(user_country) {
  country_name_element.innerHTML = "Loading...";

  (cases_list = []),
    (active_cases_list = []),
    (recovered_list = []),
    (deaths_list = []),
    (dates = []),
    (formatedDates = []);
  // POSTMAN'S API
  fetch(`https://api.covid19api.com/total/country/${user_country}`)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      app_data = data;
      for (var i = 40; i > 0; --i) {
        cases_list.push(parseInt(app_data[app_data.length - i].Confirmed));
        active_cases_list.push(parseInt(app_data[app_data.length - i].Active));
        recovered_list.push(parseInt(app_data[app_data.length - i].Recovered));
        deaths_list.push(parseInt(app_data[app_data.length - i].Deaths));
        formatedDates.push(formatDate(app_data[app_data.length - i].Date));
      }
    })
    .then(() => {
      updateUI();
    })
    .catch((error) => {
      alert(error);
    });
}

fetchData(user_country);

// UPDATE UI FUNCTION
function updateUI() {
  updateStats();
  axesLinearChart();
}

function updateStats() {
  let last_entry = app_data[app_data.length - 1];
  let before_last_entry = app_data[app_data.length - 2];
  let confirmedResult =
    parseInt(last_entry.Confirmed) - parseInt(before_last_entry.Confirmed);
  let activeResult =
    parseInt(last_entry.Active) - parseInt(before_last_entry.Active);
  let recoveredResult =
    parseInt(last_entry.Recovered) - parseInt(before_last_entry.Recovered);
  let deathResult =
    parseInt(last_entry.Deaths) - parseInt(before_last_entry.Deaths);

  // country name
  country_name_element.innerHTML = last_entry.Country;

  // total cases
  total_cases_element.innerHTML = commafy(last_entry.Confirmed) || 0;

  if (confirmedResult < 0) {
    new_cases_element.innerHTML = `${commafy(confirmedResult) || 0}`;
  } else {
    new_cases_element.innerHTML = `+${commafy(confirmedResult) || 0}`;
  }

  // active cases
  active_cases_element.innerHTML = commafy(last_entry.Active) || 0;

  if (activeResult < 0) {
    new_active_cases_element.innerHTML = `${commafy(activeResult) || 0}`;
  } else {
    new_active_cases_element.innerHTML = `+${commafy(activeResult) || 0}`;
  }

  // recovered cases
  recovered_element.innerHTML = commafy(last_entry.Recovered) || 0;

  if (recoveredResult < 0) {
    new_recovered_element.innerHTML = `${commafy(recoveredResult) || 0}`;
  } else {
    new_recovered_element.innerHTML = `+${commafy(recoveredResult) || 0}`;
  }

  // death cases
  deaths_element.innerHTML = commafy(last_entry.Deaths);

  if (deathResult < 0) {
    new_deaths_element.innerHTML = `${commafy(deathResult) || 0}`;
  } else {
    new_deaths_element.innerHTML = `+${commafy(deathResult) || 0}`;
  }
}

// COMMA
function commafy(num) {
  var str = num.toString().split(".");
  if (str[0].length >= 5) {
    str[0] = str[0].replace(/(\d)(?=(\d{3})+$)/g, "$1,");
  }
  if (str[1] && str[1].length >= 5) {
    str[1] = str[1].replace(/(\d{3})/g, "$1 ");
  }
  return str.join(".");
}

// UPDATE CHART
let my_chart;
function axesLinearChart() {
  if (my_chart) {
    my_chart.destroy();
  }

  my_chart = new Chart(ctx, {
    type: "line",
    data: {
      datasets: [
        {
          label: "Cases",
          data: cases_list,
          fill: false,
          borderColor: "#FFF",
          backgroundColor: "#FFF",
          borderWidth: 1,
        },

        {
          label: "Active",
          data: active_cases_list,
          fill: false,
          borderColor: "#0e00f0",
          backgroundColor: "#0e00f0",
          borderWidth: 1,
        },

        {
          label: "Recovered",
          data: recovered_list,
          fill: false,
          borderColor: "#009688",
          backgroundColor: "#009688",
          borderWidth: 1,
        },
        {
          label: "Deaths",
          data: deaths_list,
          fill: false,
          borderColor: "#f44336",
          backgroundColor: "#f44336",
          borderWidth: 1,
        },
      ],
      labels: formatedDates,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
  });
}

// FORMAT DATES
const monthsNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatDate(dateString) {
  let date = new Date(dateString);

  return `${date.getDate() + 1} ${monthsNames[date.getMonth()]}`;
}
