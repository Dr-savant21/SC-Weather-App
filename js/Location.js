export default class Location {
  #locationData = {
    name: "current location",
    city: "city",
    state: "state",
    country: "country",
    lat: null,
    lon: null,
  };

  constructor() {
    this.#locationData.lat = null;
    this.#locationData.lon = null;
  }

  #weatherData = {
    unit: "imperial",
    hourly: [],
    daily: [],

    current: {
      dateTime: null,
      icon: "icon",
      desc: "description",
      uvi: null,
      wind: null,
      feels: "feels like",
      humidity: null,
      temp: {
        avg: null,
        high: null,
        low: null,
      },
    },
  };

  setLatLon(_lat, _lon) {
    this.#locationData.lat = _lat;
    this.#locationData.lon = _lon;
  }

  getLatLon() {
    return {
      lat: this.#locationData.lat,
      lon: this.#locationData.lon,
    };
  }

  setLocationData(_name, _city, _state, _country, _lat, _lon) {
    this.#locationData.name = _name;
    this.#locationData.city = _city;
    this.#locationData.state = _state;
    this.#locationData.country = _country;

    if (_lat) {
      this.#locationData.lat = _lat;
      this.#locationData.lon = _lon;
    }
  }

  getLocationData() {
    return this.#locationData;
  }

  setCurrentWeatherData(
    _dateTime,
    _icon,
    _desc,
    _uvi,
    _wind,
    _feels,
    _humidity,
    _temp
  ) {
    this.#weatherData.current.dateTime = _dateTime;
    this.#weatherData.current.icon = _icon;
    this.#weatherData.current.desc = _desc;
    this.#weatherData.current.uvi = _uvi;
    this.#weatherData.current.wind = _wind;
    this.#weatherData.current.feels = _feels;
    this.#weatherData.current.humidity = _humidity;
    this.#weatherData.current.temp.avg = _temp.avg;
    this.#weatherData.current.temp.high = _temp.high;
    this.#weatherData.current.temp.low = _temp.low;
  }

  getCurrentWeatherData() {
    return this.#weatherData.current;
  }

  getCurrentDateTime() {
    return this.#weatherData.current.dateTime;
  }

  setDailyWeatherData(
    _dateTime,
    _icon,
    _desc,
    _uvi,
    _wind,
    _feels,
    _humidity,
    _temp
  ) {
    if (this.#weatherData.daily.length === 8) {
      this.#weatherData.daily.shift();
    }
    let day = {
      dateTime: _dateTime,
      icon: _icon,
      desc: _desc,
      uvi: _uvi,
      wind: _wind,
      feels: _feels,
      humidity: _humidity,
      temp: {
        avg: _temp.avg,
        high: _temp.high,
        low: _temp.low,
      },
    };

    this.#weatherData.daily.push(day);
  }

  getDailyWeatherData() {
    return this.#weatherData.daily;
  }

  getDailyDateTime(index) {
    return this.#weatherData.daily[index].dateTime;
  }

  setHourlyWeatherData(
    _dateTime,
    _icon,
    _desc,
    _uvi,
    _wind,
    _feels,
    _humidity,
    _temp
  ) {
    if (this.#weatherData.hourly.length === 48) {
      this.#weatherData.hourly.shift();
    }
    let hour = {
      dateTime: _dateTime,
      icon: _icon,
      desc: _desc,
      uvi: _uvi,
      wind: _wind,
      feels: _feels,
      humidity: _humidity,
      temp: {
        avg: _temp.avg,
        high: _temp.high,
        low: _temp.low,
      },
    };

    this.#weatherData.hourly.push(hour);
  }

  getHourlyWeatherData() {
    return this.#weatherData.hourly;
  }

  getHourlyDateTime(index) {
    return this.#weatherData.hourly[index].dateTime;
  }

  setUnit() {
    if (!this.#weatherData.unit) {
      this.#weatherData.unit = "imperial";
    }
  }

  getUnit() {
    return this.#weatherData.unit;
  }

  toggleUnit() {
    this.#weatherData.unit =
      this.#weatherData.unit === "imperial" ? "metric" : "imperial";

    localStorage.setItem("unit", this.#weatherData.unit);
  }

  getNearbyLocData() {
    return {
      icon: this.#weatherData.current.icon,
      state: this.#locationData.state,
      desc: this.#weatherData.current.desc,
      wind: this.#weatherData.current.wind,
      temp: this.#weatherData.current.temp.avg,
    };
  }
}
