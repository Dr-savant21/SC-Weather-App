const WEATHER_API_KEY = "79d96752e5a3f46318c05d90b38c6e45";
const GEO_APIFY_KEY = "28421b98ec5441359c483f448a97253f";

export const updateLocationObject = async (coordsObj, locationObj) => {
  const { lat, lon } = coordsObj;
  const locationName = await getName(lat, lon);
  const name = locationName.fullName;
  const city = locationName.city;
  const state = locationName.state;
  const country = locationName.country;

  locationObj.setLocationData(name, city, state, country, lat, lon);
};

export const getName = async (lat, lon) => {
  const location = await reverseGeocode(lat, lon);

  console.log(location);
  const city = location.city ? location.city : location.state;
  const state = location.state;
  const county = location.county;
  const countryCode = location.country_code.toUpperCase();
  const country = location.country;

  const name = {
    fullName: city ? `${city}, ${countryCode}` : `${county}, ${countryCode}`,
    city: city ? city : county,
    state: state ? state : null,
    country: country,
  };

  return name;
};

export const updateLocationWeatherObj = async (locationObj) => {
  const latLon = locationObj.getLatLon();

  const location = {
    lat: latLon.lat,
    lon: latLon.lon,
    unit: locationObj.getUnit(),
  };

  const weatherData = await getWeatherFromCoords(location);
  const current = weatherData.current;
  const daily = weatherData.daily;
  const hourly = weatherData.hourly;

  let date = current.dt;
  let icon = current.weather[0].icon;
  let desc = current.weather[0].description;
  let uvi = current.uvi;
  let wind = current.wind_speed;
  let feels = current.feels_like;
  let humidity = current.humidity;
  let temp = {
    avg: current.temp,
    high: daily[0].temp.max,
    low: daily[0].temp.min,
  };

  locationObj.setCurrentWeatherData(
    date,
    icon,
    desc,
    uvi,
    wind,
    feels,
    humidity,
    temp
  );

  daily.forEach((element) => {
    date = element.dt;
    icon = element.weather[0].icon;
    desc = element.weather[0].description;
    uvi = element.uvi;
    wind = element.wind_speed;
    feels = element.feels_like.day;
    humidity = element.humidity;
    temp = {
      avg: element.temp.day,
      high: element.temp.max,
      low: element.temp.min,
    };

    locationObj.setDailyWeatherData(
      date,
      icon,
      desc,
      uvi,
      wind,
      feels,
      humidity,
      temp
    );
  });

  hourly.forEach((element) => {
    date = element.dt;
    icon = element.weather[0].icon;
    desc = element.weather[0].description;
    uvi = element.uvi;
    wind = element.wind_speed;
    feels = element.feels_like;
    humidity = element.humidity;
    temp = {
      avg: element.temp,
      high: element.temp,
      low: element.temp,
    };

    locationObj.setHourlyWeatherData(
      date,
      icon,
      desc,
      uvi,
      wind,
      feels,
      humidity,
      temp
    );
  });
};

export const getNearbyLocation = async (locationObj) => {
  const countryObj = await reverseGeocode(locationObj.lat, locationObj.lon);

  const country = countryObj.country;
  const randomStates = await getRandomStateFromCountry(country);
  const random = Math.floor(Math.random() * 36);
  const nearbyLocation = await geocode(randomStates[random].name);

  return nearbyLocation;
};

export const getHomePage = () => {
  let loc = localStorage.getItem("homePage");
  if (!loc) {
    localStorage.setItem("homePage", "currentLocation");
    loc = "Current Location";
  } else {
    return loc;
  }
  return loc;
};

const getRandomStateFromCountry = async (country) => {
  const raw = `{\n    "country": "${country}"\n}`;

  const url = "https://countriesnow.space/api/v0.1/countries/states";
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: raw,
    redirect: "follow",
  };

  try {
    const statesData = await fetch(url, requestOptions);
    const statesJson = await statesData.json();

    const states = statesJson.data.states;

    return states;
  } catch (err) {
    console.error(err);
  }
};

const reverseGeocode = async (lat, lon) => {
  const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&apiKey=${GEO_APIFY_KEY}`;

  try {
    const locationData = await fetch(url, {
      method: "GET",
    });
    const locationJson = await locationData.json();

    return locationJson.features[0].properties;
  } catch (err) {
    console.error(err);
  }
};

export const geocode = async (location) => {
  const url = `https://api.geoapify.com/v1/geocode/search?text=${location}&format=json&apiKey=${GEO_APIFY_KEY}`;
  const encodedURL = encodeURI(url);

  try {
    const locationData = await fetch(encodedURL);
    const locationDataJson = await locationData.json();
    const location = {
      lat: locationDataJson.results[0].lat,
      lon: locationDataJson.results[0].lon,
    };

    return location;
  } catch (err) {
    console.error(err);
  }
};

export const getWeatherFromCoords = async (locationObj) => {
  const { lat, lon, unit } = locationObj;

  const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=alerts,minutely&appid=${WEATHER_API_KEY}&units=${unit}`;

  try {
    const weatherData = await fetch(url);
    const weatherJson = await weatherData.json();

    return weatherJson;
  } catch (err) {
    console.error(err);
  }
};

export const cleanText = (text) => {
  const regex = / {2,}/g;
  const entryText = text.replaceAll(regex, " ").trim();
  return entryText;
};

export const cacheWeatherData = (key, weatherData) => {
  sessionStorage.setItem(
    `${key}cld`,
    JSON.stringify(weatherData.getLocationData())
  );

  sessionStorage.setItem(
    `${key}clwd`,
    JSON.stringify(weatherData.getCurrentWeatherData())
  );

  sessionStorage.setItem(
    `${key}cldd`,
    JSON.stringify(weatherData.getDailyWeatherData())
  );

  sessionStorage.setItem(
    `${key}clhd`,
    JSON.stringify(weatherData.getHourlyWeatherData())
  );
};

export const getCachedWeatherData = (key, currentLocObj) => {
  const { name, city, state, country, lat, lon } = JSON.parse(
    sessionStorage.getItem(`${key}cld`)
  );
  currentLocObj.setLocationData(name, city, state, country, lat, lon);

  const { dateTime, icon, desc, uvi, wind, feels, humidity, temp } = JSON.parse(
    sessionStorage.getItem(`${key}clwd`)
  );

  currentLocObj.setCurrentWeatherData(
    dateTime,
    icon,
    desc,
    uvi,
    wind,
    feels,
    humidity,
    temp
  );

  const hourlyData = JSON.parse(sessionStorage.getItem(`${key}clhd`));

  hourlyData.forEach(
    ({ dateTime, icon, desc, uvi, wind, feels, humidity, temp }) => {
      currentLocObj.setHourlyWeatherData(
        dateTime,
        icon,
        desc,
        uvi,
        wind,
        feels,
        humidity,
        temp
      );
    }
  );

  const dailyData = JSON.parse(sessionStorage.getItem(`${key}cldd`));

  dailyData.forEach(
    ({ dateTime, icon, desc, uvi, wind, feels, humidity, temp }) => {
      currentLocObj.setDailyWeatherData(
        dateTime,
        icon,
        desc,
        uvi,
        wind,
        feels,
        humidity,
        temp
      );
    }
  );

  return currentLocObj;
};
