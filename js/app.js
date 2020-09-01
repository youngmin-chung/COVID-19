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
    formattedDates = [],
    country_list = [],
    user_country,
    country_code,
    jsonData;

const api_url_by_country = "https://api.covid19api.com/countries";
const api_country_name =
    "https://api.ipstack.com/check?access_key=cbc5a92314e1fe900ede483f777ccc05";

async function fetchCountryInfos() {
    var tmp = [];
    const response = await fetch(api_url_by_country);
    const data = await response.json();

    for (var i in data) {
        tmp.push({ name: data[i].Country, code: data[i].ISO2 });
    }

    // map through the repo list
    const promises = tmp.map(async (country) => {
        // request details from GitHub’s API with Axios

        return {
            name: country.name,
            code: country.code,
        };
    });

    // wait until all promises resolve
    const results = await Promise.all(promises);
    country_list = results;
    // use the results
    // SELECT SEARCH COUNTRY ELEMENTS
    const search_country_element = document.querySelector(".search-country");
    const country_list_element = document.querySelector(".country-list");
    const chang_country_btn = document.querySelector(".change-country");
    const close_list_btn = document.querySelector(".close");
    const input = document.getElementById("search-input");
    const warning = document.getElementById("warning");

    // CREATE TE COUNTRY LIST
    function createCountryList() {
        const num_countries = country_list.length;

        let i = 0,
            ul_list_id;

        country_list.forEach((country, index) => {
            if (index % Math.ceil(num_countries / num_of_ul_lists) == 0) {
                ul_list_id = `list-${i}`;
                country_list_element.innerHTML += `<ul id='${ul_list_id}'></ul>`;
                i++;
            }

            document.getElementById(`${ul_list_id}`).innerHTML += `
              <li onclick="fetchData('${country.name}')" id="${country.name}">
              ${country.name}
              </li>
          `;
        });
    }

    let num_of_ul_lists = 2;
    createCountryList();

    // SHOW/HIDE THE COUNTRY LIST ON CLICK EVENT
    chang_country_btn.addEventListener("click", function () {
        input.value = "";
        resetCountryList();
        search_country_element.classList.toggle("hide");
        search_country_element.classList.add("fadeIn");
    });

    close_list_btn.addEventListener("click", function () {
        search_country_element.classList.toggle("hide");
    });

    country_list_element.addEventListener("click", function () {
        search_country_element.classList.toggle("hide");
    });

    // COUNTRY FILTER
    /* input event fires up whenever the value of the input changes */
    input.addEventListener("input", function () {
        let value = input.value.toUpperCase();

        country_list.forEach((country) => {
            if (country.name.toUpperCase().startsWith(value)) {
                document.getElementById(country.name).classList.remove("hide");
            } else {
                document.getElementById(country.name).classList.add("hide");
            }
        });
    });

    // RESET COUNTRY LIST (SHOW ALL THE COUNTRIES )
    function resetCountryList() {
        country_list.forEach((country) => {
            document.getElementById(country.name).classList.remove("hide");
        });
    }
}

fetchCountryInfos();

// FETCH DATA FOR GETTING CURRENT COUNTRY INFO
function fetchData(user_country) {
    country_name_element.innerHTML = "Loading...";
    document.getElementById("warning").classList.add("hide");
    (cases_list = []),
        (active_cases_list = []),
        (recovered_list = []),
        (deaths_list = []),
        (dates = []),
        (formattedDates = []);
    // POSTMAN'S API
    fetch(`https://api.covid19api.com/total/country/${user_country}`)
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            app_data = data;
            for (var i = 40; i > 0; --i) {
                cases_list.push(
                    parseInt(app_data[app_data.length - i].Confirmed)
                );
                active_cases_list.push(
                    parseInt(app_data[app_data.length - i].Active)
                );
                recovered_list.push(
                    parseInt(app_data[app_data.length - i].Recovered)
                );
                deaths_list.push(
                    parseInt(app_data[app_data.length - i].Deaths)
                );
                formattedDates.push(
                    formatDate(app_data[app_data.length - i].Date)
                );
            }
        })
        .then(() => {
            updateUI();
        })
        .catch((error) => {
            country_name_element.innerHTML = user_country;
            document.getElementById("warning").classList.remove("hide");
            my_chart.destroy();
        });
}

// GET USERS COUNTRY NAME
function fetchGetCountryName() {
    fetch(api_country_name)
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            countryInfo = data;
            user_country = countryInfo.country_name;
            fetchData(user_country);
        });
}

fetchGetCountryName();

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
    if (str[0].length >= 4) {
        str[0] = str[0].replace(/(\d)(?=(\d{3})+$)/g, "$1,");
    }
    if (str[1] && str[1].length >= 4) {
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
            labels: formattedDates,
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
