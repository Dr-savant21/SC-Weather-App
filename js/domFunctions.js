let page;
if (document.getElementById("homeBody")) {
  page = "Home Page";
} else if (document.getElementById("searchBody")) {
  page = "Search Page";
}

export const displayApiError = (errMsg) => {
  // update the information on the page to show the given error
  console.error(errMsg);
};

export const alertBox = (msg) => {
  const alertBox = document.getElementById("alert__box");
  toggleBox(alertBox);
  alertBox.textContent = msg;
  setTimeout(toggleBox, 3000, alertBox);
};

const toggleBox = (element) => {
  element.classList.remove("no-display");
  element.classList.toggle("alert__box-in");
  element.classList.toggle("alert__box-out");
};

export const updateCurrentLocationPage = (
  currentLocObj,
  firstNearbyLocObj,
  secondNearbyLocObj
) => {
  // updateDateAndLocation();

  // failsafe
  if (page === "Search Page") {
    console.log("wrong function called");
    return;
  }
  document.getElementById("dateLocation").classList.remove("none");

  fillDateLocationSec(
    currentLocObj.getCurrentDateTime(),
    currentLocObj.getLocationData()
  );

  fillCurrentForecastAndConditionsSec(
    currentLocObj.getCurrentWeatherData(),
    currentLocObj.getUnit()
  );

  fillHourlySec(currentLocObj.getHourlyWeatherData(), currentLocObj.getUnit());

  fillDailyForecastDiv(
    currentLocObj.getDailyWeatherData(),
    currentLocObj.getUnit()
  );

  fillNearbyLocationsSec(
    [
      firstNearbyLocObj.getNearbyLocData(),
      secondNearbyLocObj.getNearbyLocData(),
    ],
    currentLocObj.getUnit()
  );

  createChart(currentLocObj.getDailyWeatherData(), currentLocObj.getUnit());

  document.querySelector("main").classList.remove("none");
  document.querySelector("#loading__page").classList.add("loading__page-out");

  //use the data to update the display
  // const currentWeatherData = getWeatherFromCoords(locationObj);
  // console.log(weatherData);
  // console.log(locationObj);
};

export const updateSearchPage = (locationObj, nearbyLocations) => {
  if (locationObj && nearbyLocations) {
    fillNearbyLocationsSec(
      [
        nearbyLocations[0].getNearbyLocData(),
        nearbyLocations[1].getNearbyLocData(),
      ],
      locationObj.getUnit()
    );
    fillCurrentForecastAndConditionsSec(
      locationObj.getCurrentWeatherData(),
      locationObj.getUnit()
    );
  } else {
    document.getElementById("nearbyLocations").classList.add("no-display");

    if (document.getElementById("forecast").classList.contains("no-display")) {
      document.getElementById("currentForecast").classList.remove("no-display");

      document.getElementById("moreInfo").classList.remove("no-display");
    }

    fillCurrentForecastAndConditionsSec(
      locationObj.getCurrentWeatherData(),
      locationObj.getUnit()
    );
    fillDailyForecastDiv(
      locationObj.getDailyWeatherData(),
      locationObj.getUnit()
    );
    fillHourlySec(locationObj.getHourlyWeatherData(), locationObj.getUnit());
    createChart(locationObj.getDailyWeatherData(), locationObj.getUnit());
  }

  document.querySelector("#loading__page").classList.add("loading__page-out");
};

export const toggleMoreInfo = () => {
  const idArr = ["currentForecast", "navbar", "currentConditions"];
  const forecast = document.getElementById("forecast").classList;
  idArr.forEach((element) => {
    document.getElementById(element).classList.toggle("no-display");
  });

  forecast.toggle("no-display");
  forecast.toggle("forecast-in");
  forecast.toggle("forecast-out");
  document.getElementById("moreInfo").classList.toggle("no-display");
};

const fillDateLocationSec = (date, locationObj) => {
  // use the "dateObj" object gotten from the "onecall weather api",
  // the "locationObj" object gotten from the "geoLocation api" and,
  // the optional "day" variable checks if the day being presented is the current day to get the "dateLocationData"

  const dateLocation = document.getElementById("dateLocation");
  emptyElement(dateLocation);

  const monthArr = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const dateObj = new Date(date * 1000);
  const day = dateObj.getDate();
  const month = monthArr[dateObj.getMonth()];
  const year = dateObj.getFullYear();

  //creating all the elements to fill the "dateLocation" Div
  const dateElement = createElem("div", ["date"], `${day} ${month} ${year}`);
  const locationElement = createElem(
    "div",
    ["location"],
    `, ${locationObj.country} `
  );

  const cityElement = createElem("span", ["city"], locationObj.city);

  // adding the child elements to parent elemnts as needed

  locationElement.prepend(cityElement);

  dateLocation.appendChild(dateElement);
  dateLocation.appendChild(locationElement);
};

const fillCurrentForecastAndConditionsSec = (weatherObj, unit) => {
  //filling the "currentForecast" section
  const currentForecast = document.getElementById("currentForecast");
  const searchForecast = document.getElementById("searchForecast");

  emptyElement(currentForecast);
  if (searchForecast) emptyElement(searchForecast);

  const forecastIcon = getForecastimg(weatherObj.icon, "main");
  const temp = createElem("div", ["temp"]);
  const avgTemp = createElem("div", ["avgTemp"], `${weatherObj.temp.avg}°`);
  const tempUnitText = unit === "imperial" ? "F" : "C";
  const tempUnit = createElem("div", ["unit"], tempUnitText);
  tempUnit.title = "Toggle Units";
  tempUnit.id = "unit";

  const highLow = createElem("div", ["highLow"]);
  const high = createElem("div", ["high"], `high ${weatherObj.temp.high}`);
  const low = createElem("div", ["low"], `low ${weatherObj.temp.low}`);
  const desc = createElem("div", ["desc"], weatherObj.desc);

  const highLowArr = [high, low];
  highLowArr.forEach((elem) => {
    highLow.appendChild(elem);
  });

  const tempArr = [avgTemp, tempUnit, highLow];
  tempArr.forEach((elem) => {
    temp.appendChild(elem);
  });

  const currentForecastArr = [forecastIcon, temp, desc];
  currentForecastArr.forEach((elem) => {
    currentForecast.appendChild(elem);
  });

  if (searchForecast) {
    currentForecastArr.forEach((elem) => {
      const clonedNode = elem.cloneNode(true);
      searchForecast.appendChild(clonedNode);
    });
  }

  //filling the "currentConditions" section
  const currentConditions = document.getElementById("currentConditions");
  const searchConditions = document.getElementById("searchConditions");

  emptyElement(currentConditions);
  if (searchConditions) emptyElement(searchConditions);

  const windUnit = unit === "imperial" ? "mph" : "m/s";
  const conditionsArr = [
    weatherObj.feels,
    weatherObj.wind,
    weatherObj.humidity,
    weatherObj.uvi,
  ];

  let condition, icon, digit;
  for (const elem of conditionsArr) {
    condition = createElem("div", ["condition"]);

    if (elem === weatherObj.feels) {
      const feels = createElem("div", ["feels"], "Feels Like");
      icon = createElem("i", ["fa-solid", "fa-cloud"]);
      digit = createElem("span", ["digit"], ` ${weatherObj.feels}`);

      feels.appendChild(digit);
      condition.appendChild(icon);
      condition.appendChild(feels);
    } else if (elem === weatherObj.wind) {
      const wind = createElem("div", ["wind"], "Wind");
      icon = createElem("i", ["fa-solid", "fa-wind"]);
      digit = createElem("span", ["digit"], ` ${weatherObj.wind} ${windUnit}`);

      wind.appendChild(digit);
      condition.appendChild(icon);
      condition.appendChild(wind);
    } else if (elem === weatherObj.humidity) {
      const humidity = createElem("div", ["humidity"], "Humidity");
      icon = createElem("i", ["fa-solid", "fa-droplet"]);
      digit = createElem("span", ["digit"], ` ${weatherObj.humidity}%`);

      humidity.appendChild(digit);
      condition.appendChild(icon);
      condition.appendChild(humidity);
    } else if (elem === weatherObj.uvi) {
      const UVI = createElem("div", ["uvi"], "UV Index");
      icon = createElem("i", ["fa-solid", "fa-sun"]);
      digit = createElem("span", ["digit"], ` ${weatherObj.uvi}`);

      UVI.appendChild(digit);
      condition.appendChild(icon);
      condition.appendChild(UVI);
    }

    currentConditions.appendChild(condition);
    if (searchConditions) {
      const conditionClone = condition.cloneNode(true);
      searchConditions.appendChild(conditionClone);
    }
  }
};

const fillHourlySec = (hourlyWeatherArr, unit) => {
  // using the "hourlyWeatherData" object gotten from the "onecall weather" API to fill the "hourly" section

  // storing an array of elements needed to fill the "hourly" section
  const hourlyForecast = document.getElementById("hourlyForecast");
  emptyElement(hourlyForecast);

  let list,
    dateObj,
    hour,
    merridiem, // A.M or P.M
    cHour, //concerned Hour
    cTime, //concerned Time
    time,
    temp,
    wind,
    windIcon,
    windSpeed,
    forecastIcon,
    currentHour,
    windUnit = unit === "imperial" ? "mph" : "m/s";

  for (let i = 0; i < 24; i++) {
    list = createElem("li", ["hour", `hour${i}`]);

    dateObj = new Date(hourlyWeatherArr[i].dateTime * 1000);
    hour = dateObj.getHours();

    // turning 24 hr time to 12 hr time
    merridiem = hour < 12 ? "A.M" : "P.M";
    if (hour === 0 || hour === 12) cHour = 12;
    else cHour = hour < 12 ? hour : hour - 12;

    // displaying "now" or necessary time
    if (i === 0) {
      cTime = `Now`;
      list.classList.add("active");
    } else cTime = `${cHour} ${merridiem}`;

    time = createElem("div", ["time"], cTime);
    temp = createElem(
      "div",
      ["temp"],
      `${Math.round(Number(hourlyWeatherArr[i].temp.avg))}°`
    );

    wind = createElem("div", ["wind"]);
    windIcon = createElem("i", ["fa-solid", "fa-wind"]);
    windSpeed = createElem(
      "div",
      ["windSpeed"],
      `${Math.round(Number(hourlyWeatherArr[i].wind))} ${windUnit}`
    );

    forecastIcon = getForecastimg(hourlyWeatherArr[i].icon);
    wind.appendChild(windIcon);
    wind.appendChild(windSpeed);

    currentHour = [time, temp, forecastIcon, wind];
    currentHour.forEach((elem) => {
      list.appendChild(elem);
    });

    hourlyForecast.appendChild(list);
  }
};

const fillDailyForecastDiv = (dailyWeatherArr, unit) => {
  // using the "dailyWeatherData" object gotten from the "onecall weather" API to fill the "hourly" section

  const dailyForecast = document.getElementById("dailyForecast");
  emptyElement(dailyForecast);

  let dayObj,
    dayAbbrev,
    list,
    forecastDay,
    temp,
    forecastIcon,
    wind,
    windIcon,
    windSpeed,
    currentDay,
    windUnit = unit === "imperial" ? "mph" : "m/s";

  for (let i = 0; i < dailyWeatherArr.length; i++) {
    list = createElem("li", ["day", `day${i}`]);

    dayObj = new Date(dailyWeatherArr[i].dateTime * 1000);
    dayAbbrev = dayObj.toDateString().slice(0, 3);

    //deciding if to displaying today, tomorrow or the concerned day
    if (i === 0) {
      dayAbbrev = "Today";
      list.classList.add("active");
    } else if (i === 1) {
      dayAbbrev = "Tomorrow";
    }

    forecastDay = createElem("div", ["day"], dayAbbrev);
    temp = createElem(
      "div",
      ["temp"],
      `${Math.round(Number(dailyWeatherArr[i].temp.avg))}°`
    );

    forecastIcon = getForecastimg(dailyWeatherArr[i].icon);
    wind = createElem("div", ["wind"]);
    windIcon = createElem("i", ["fa-solid", "fa-wind"]);
    windSpeed = createElem(
      "div",
      ["windSpeed"],
      `${Math.round(Number(dailyWeatherArr[i].wind))} ${windUnit}`
    );

    //filling the parent element with their respective child elements
    wind.appendChild(windIcon);
    wind.appendChild(windSpeed);

    currentDay = [forecastDay, temp, forecastIcon, wind];
    currentDay.forEach((elem) => {
      list.appendChild(elem);
    });

    dailyForecast.appendChild(list);
  }
};

const fillNearbyLocationsSec = (nearbyLocationsArr, unit) => {
  const nearbyLocations = document.getElementById("nearbyLocations");
  if (!nearbyLocations) return;
  emptyElement(nearbyLocations);
  nearbyLocations.classList.remove("none");

  let loc,
    forecastIcon,
    info,
    state,
    desc,
    windIcon,
    temp,
    locationArr,
    infoArr,
    windUnit = unit === "imperial" ? "mph" : "m/s";

  for (let i = 0; i < nearbyLocationsArr.length; i++) {
    loc = createElem("div", ["loc", `loc${i + 1}`]);
    forecastIcon = getForecastimg(nearbyLocationsArr[i].icon, "main");
    info = createElem("div", ["info"]);
    state = createElem("div", ["city"], nearbyLocationsArr[i].state);
    desc = createElem("div", ["desc"], nearbyLocationsArr[i].desc);
    windIcon = createElem(
      "div",
      ["fas", "fa-wind"],
      ` ${nearbyLocationsArr[i].wind} ${windUnit}`
    );
    temp = createElem("div", ["temp"], `${nearbyLocationsArr[i].temp}°`);

    if (page === "Home Page") {
      infoArr = [state, desc, windIcon];
      infoArr.forEach((element) => {
        info.appendChild(element);
      });

      locationArr = [forecastIcon, info, temp];
      locationArr.forEach((element) => {
        loc.appendChild(element);
      });
    } else if (page === "Search Page") {
      desc.appendChild(windIcon);
      info.appendChild(temp);
      info.appendChild(desc);

      locationArr = [state, forecastIcon, info];
      locationArr.forEach((element) => {
        loc.appendChild(element);
      });
    }

    nearbyLocations.appendChild(loc);
    document.getElementById("nearbyLocations").classList.remove("none");
  }

  // const loc = document.querySelectorAll(".loc");
  // loc.forEach((element) => {
  //   element.addEventListener("click", () => {
  //     if (element.classList.contains("loc1")) {
  //       fillDateLocationSec(date, firstLocation);
  //       fillCurrentConditionsSec(
  //         firstLocCurrentWeather,
  //         firstLocOnecallWeather.current.uvi,
  //         unit
  //       );
  //       fillCurrentForecastSec(firstLocCurrentWeather, unit);
  //       fillHourlySec(firstLocOnecallWeather.hourly, unit);
  //       fillDailyForecastDiv(firstLocOnecallWeather.daily, unit);
  //       createChart(firstLocOnecallWeather.daily, unit);
  //     } else {
  //       fillDateLocationSec(date, secondLocation);
  //       fillCurrentConditionsSec(
  //         secondLocCurrentWeather,
  //         secondLocOnecallWeather.current.uvi,
  //         unit
  //       );
  //       fillCurrentForecastSec(secondLocCurrentWeather);
  //       fillHourlySec(secondLocOnecallWeather.hourly, unit);
  //       fillDailyForecastDiv(secondLocOnecallWeather.daily, unit);
  //       createChart(secondLocOnecallWeather.daily, unit);
  //     }
  //     document.getElementById("locationUndo").classList.remove("none");
  //   });
  // });
};

const createChart = (dailyForecastArr, unit) => {
  const chartBox = document.getElementById("dailyChartBox");
  emptyElement(chartBox);

  const chart = createElem("canvas", ["chart"]);
  chart.getContext("2d");
  if (document.querySelector(".chart")) {
    chartBox.removeChild(document.querySelector(".chart"));
  }

  chartBox.appendChild(chart);
  const chartMenu = document.getElementById("chartMenu");

  const dayOfTheWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const labels = [];
  const tempArr = [];
  const uviArr = [];
  const humidityArr = [];
  const windArr = [];

  let day, dayObj;
  dailyForecastArr.forEach((element) => {
    dayObj = new Date(element.dateTime * 1000);
    day = dayOfTheWeek[dayObj.getDay()];

    labels.push(day);
    tempArr.push(element.temp.avg);
    uviArr.push(element.uvi);
    humidityArr.push(element.humidity);
    windArr.push(element.wind);
  });

  labels[0] = "Today";

  let delayed;
  const data = {
    labels: labels,
    datasets: [
      {
        label: "Temperature",
        data: tempArr,
        tension: 0.4,
        borderColor: "#666",
      },
    ],
  };

  const config = {
    type: "line",
    data: data,
    plugins: [ChartDataLabels],
    options: {
      plugins: {
        legend: {
          display: false,
        },
        datalabels: {
          color: "#000",
          formatter: function (input) {
            return `${input}°`;
          },
          align: "bottom",
          anchor: "end",
          offset: 10,
          font: {
            family: "Rubik",
          },
        },
      },
      scales: {
        y: {
          ticks: {
            display: false,
          },
          grid: {
            display: false,
          },
        },
      },
      radius: 3,
      responsive: true,
      hitRadius: 3,
      animation: {
        onComplete: () => {
          delayed = true;
        },
        delay: (context) => {
          let delay = 0;
          if (
            context.type === "data" &&
            context.mode === "default" &&
            !delayed
          ) {
            delay = context.dataIndex * 300 + context.datasetIndex * 100;
          }
          return delay;
        },
      },
    },
  };

  const dailyChart = new Chart(chart, config);

  chartMenu.addEventListener("change", () => {
    const value = chartMenu.value;
    const windUnit = unit === "imperial" ? "mph" : "m/s";

    switch (value) {
      case "temp":
        dailyChart.data.datasets[0].data = tempArr;
        dailyChart.data.datasets[0].label = "Temperature";
        dailyChart.config.options.plugins.datalabels.formatter = (input) => {
          return `${input}°`;
        };
        break;

      case "uvi":
        dailyChart.data.datasets[0].data = uviArr;
        dailyChart.data.datasets[0].label = "UVI";
        dailyChart.config.options.plugins.datalabels.formatter = (input) => {
          return input;
        };
        break;

      case "humidity":
        dailyChart.data.datasets[0].data = humidityArr;
        dailyChart.data.datasets[0].label = "Humidity";
        dailyChart.config.options.plugins.datalabels.formatter = (input) => {
          return `${input}%`;
        };
        break;

      case "wind_speed":
        dailyChart.data.datasets[0].data = windArr;
        dailyChart.data.datasets[0].label = "Wind Speed";
        dailyChart.config.options.plugins.datalabels.formatter = (input) => {
          return `${input} ${windUnit}`;
        };
        break;

      default:
        break;
    }

    dailyChart.update();
  });
};

const getImgSrc = (weatherIcon, flag) => {
  const firstTwoChars = weatherIcon.slice(0, 2);
  const lastChar = weatherIcon.slice(2);
  let imgSrc;

  if (!flag) {
    switch (firstTwoChars) {
      case "01":
        imgSrc =
          lastChar === "d"
            ? "./img/animated/day.svg"
            : "./img/animated/night.svg";
        break;

      case "02":
        imgSrc =
          lastChar === "d"
            ? "./img/animated/cloudy-day-3.svg"
            : "./img/animated/cloudy-night-3.svg";
        break;

      case "03":
        imgSrc = "./img/animated/cloudy.svg";
        break;

      case "04":
        imgSrc = "./img/animated/cloudy.svg";
        break;

      case "09":
        imgSrc = "./img/animated/rainy-3.svg";
        break;

      case "10":
        imgSrc = "./img/animated/rainy-6.svg";
        break;

      case "11":
        imgSrc = "./img/animated/thunder.svg";
        break;

      case "13":
        imgSrc = "./img/animated/snowy-6.svg";
        break;

      case "50":
        imgSrc =
          lastChar === "d"
            ? "./img/main-animated/partly-coudy-day-fog.svg"
            : "./img/main-animated/partly-cloudy-night-fog.svg";
        break;

      default:
        break;
    }
  } else {
    switch (firstTwoChars) {
      case "01":
        imgSrc =
          lastChar === "d"
            ? "./img/main-animated/clear-day.svg"
            : "./img/main-animated/clear-night.svg";
        break;

      case "02":
        imgSrc =
          lastChar === "d"
            ? "./img/main-animated/partly-cloudy-day.svg"
            : "./img/main-animated/partly-cloudy-night.svg";
        break;

      case "03":
        imgSrc = "./img/main-animated/cloudy.svg";
        break;

      case "04":
        imgSrc =
          lastChar === "d"
            ? "./img/main-animated/overcast-day.svg"
            : "./img/main-animated/overcast-night.svg";
        break;

      case "09":
        imgSrc =
          lastChar === "d"
            ? "./img/main-animated/partly-cloudy-day-drizzle.svg"
            : "./img/main-animated/partly-cloudy-night-drizzle.svg";
        break;

      case "10":
        imgSrc =
          lastChar === "d"
            ? "./img/main-animated/partly-cloudy-day-rain.svg"
            : "./img/main-animated/partly-cloudy-night-rain.svg";
        break;

      case "11":
        imgSrc =
          lastChar === "d"
            ? "./img/main-animated/thunderstorms-day.svg"
            : "./img/main-animated/thunderstorms-night.svg";
        break;

      case "13":
        imgSrc =
          lastChar === "d"
            ? "./img/main-animated/partly-cloudy-day-rain.svg"
            : "./img/main-animated/partly-cloudy-night-rain.svg";
        break;

      case "50":
        imgSrc =
          lastChar === "d"
            ? "./img/main-animated/partly-cloudy-day-fog.svg"
            : "./img/main-animated/partly-cloudy-night-fog.svg";
        break;

      default:
        break;
    }
  }

  return imgSrc;
};

const getForecastimg = (weatherIcon, flag, classArr) => {
  const src = getImgSrc(weatherIcon, flag);
  const icon = document.createElement("img");
  icon.src = src;

  if (classArr) {
    classArr.forEach((elem) => {
      icon.classList.add(elem);
    });
  }

  return icon;
};

const createElem = (itemType, classArr, text) => {
  const element = document.createElement(itemType);

  if (classArr) {
    classArr.forEach((elem) => {
      element.classList.add(elem);
    });
  }

  if (text) element.textContent = text;

  return element;
};

const emptyElement = (element) => {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
  // console.log();
};
