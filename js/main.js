import {
  updateLocationObject,
  updateLocationWeatherObj,
  getNearbyLocation,
  geocode,
  cleanText,
  getHomePage,
  cacheWeatherData,
  getCachedWeatherData,
} from "./dataFunctions.js";

import {
  displayApiError,
  updateCurrentLocationPage,
  updateSearchPage,
  toggleMoreInfo,
  alertBox,
} from "./domFunctions.js";
import Location from "./Location.js";

let page;
if (document.getElementById("homeBody")) {
  page = "Home Page";
} else if (document.getElementById("searchBody")) {
  page = "Search Page";
}

const currentLoc = new Location();
const firstNearbyLoc = new Location();
const secondNearbyLoc = new Location();

const initApp = () => {
  toggleDefaultMode();
  if (page === "Home Page") {
    document.getElementById("home__page").addEventListener("click", (event) => {
      event.preventDefault();
    });
    loadHomeOrCurrentLoc();
    document
      .getElementById("home__button")
      .addEventListener("click", fillHomePage);
    document
      .getElementById("currentLocation__button")
      .addEventListener("click", getLocation);
  } else {
    loadHomeOrCurrentIcon();
    getLocation();
  }

  const modeToggle = document.getElementById("mode__toggle");
  modeToggle.addEventListener("click", toggleLightDark);

  const clearText = document.getElementById("clearText");
  if (clearText) {
    clearText.addEventListener("click", clearSearchBar);
  }

  const saveButton = document.getElementById("save__button");
  saveButton.addEventListener("click", saveHomeLocation);

  const locationEntry = document.getElementById("searchBar__form");
  if (locationEntry) {
    locationEntry.addEventListener("submit", submitNewLocation);
  }

  const searchButton = document.getElementById("search__button");
  if (searchButton) {
    searchButton.addEventListener("click", searchOrFocus);
  }

  const dropArrow = document.getElementById("drop-arrow");
  if (dropArrow) {
    dropArrow.addEventListener("click", toggleMoreInfo);
  }

  const moreInfo = document.getElementById("moreInfo");

  if (moreInfo) {
    moreInfo.addEventListener("click", toggleMoreInfo);
  }
};

document.addEventListener("DOMContentLoaded", initApp);

const loadHomeOrCurrentLoc = () => {
  toggleActivePage();
  const homePage = getHomePage();
  if (homePage === "home") {
    fillHomePage();
  } else {
    getLocation();
  }
};

const loadHomeOrCurrentIcon = () => {
  const homePage = getHomePage();
  const homeButton = document.getElementById("home__button");
  const currentLocButton = document.getElementById("currentLocation__button");

  if (homePage === "home") {
    homeButton.classList.remove("no-display");
    currentLocButton.classList.add("no-display");
  } else {
    homeButton.classList.add("no-display");
    currentLocButton.classList.remove("no-display");
  }
};

const getLocation = () => {
  //check if the current browser supports geoloaction

  if (
    sessionStorage.getItem("defaultWeatherLocationclwd") &&
    sessionStorage.getItem("firstNearbyLocationclwd")
  ) {
    getCachedWeatherData("defaultWeatherLocation", currentLoc);
    getCachedWeatherData("firstNearbyLocation", firstNearbyLoc);
    getCachedWeatherData("secondNearbyLocation", secondNearbyLoc);

    if (page === "Home Page") {
      updatePageData(currentLoc, firstNearbyLoc, secondNearbyLoc);
    } else if (page === "Search Page") {
      updateSearchData(currentLoc, firstNearbyLoc, secondNearbyLoc);
    }
    return;
  }

  if (navigator.geolocation)
    navigator.geolocation.getCurrentPosition(geoSuccess, geoError);
  else displayApiError("Geo location is not supported by your browser");
};

const geoError = (err) => {
  //display the error on the page
  displayApiError(err);
};

const geoSuccess = async (location) => {
  // create locationObj to hold information from the location object
  let locationObj;
  if (location.coords) {
    locationObj = {
      lat: location.coords.latitude,
      lon: location.coords.longitude,
    };
  } else {
    locationObj = location;
  }

  // transfer the data gotten from the location object to the currentLoc object
  await updateLocationObject(locationObj, currentLoc);
  await findNearbyLocations(currentLoc.getLatLon());

  if (document.getElementById("home__header")) {
    updatePageData(currentLoc);
  } else if (document.getElementById("searchBody")) {
    updateSearchData(currentLoc);
  }
};

const submitNewLocation = async (event) => {
  event.preventDefault();
  // const searchIcon = document.querySelector(".")
  const searchedText = document.getElementById("searchBar__text").value;
  const cleanedText = cleanText(searchedText);
  const location = await geocode(cleanedText);

  await updateLocationObject(location, currentLoc);
  await updateLocationWeatherObj(currentLoc);

  updateSearchData(currentLoc);
};

const findNearbyLocations = async (locationObj) => {
  let nearbyLocation = await getNearbyLocation(locationObj);
  updateLocationObject(nearbyLocation, firstNearbyLoc);

  nearbyLocation = await getNearbyLocation(locationObj);
  updateLocationObject(nearbyLocation, secondNearbyLoc);
};

const updatePageData = async (
  currentLocObj,
  firstNearbyLocObj,
  secondNearbyLocObj
) => {
  //use the locationObj to get the weather from the API
  await updateLocationWeatherObj(currentLoc);
  await updateLocationWeatherObj(firstNearbyLoc);
  await updateLocationWeatherObj(secondNearbyLoc);

  cacheWeatherData("defaultWeatherLocation", currentLocObj || currentLoc);
  cacheWeatherData("firstNearbyLocation", firstNearbyLocObj || firstNearbyLoc);
  cacheWeatherData(
    "secondNearbyLocation",
    secondNearbyLocObj || secondNearbyLoc
  );

  //first make sure the necessary objects aren't empty
  if (currentLoc && firstNearbyLoc && secondNearbyLoc) {
    updateCurrentLocationPage(
      currentLocObj || currentLoc,
      firstNearbyLocObj || firstNearbyLoc,
      secondNearbyLocObj || secondNearbyLoc
    );
  }

  postDynamicInfoToggles();
};

const fillHomePage = () => {
  const savedLocation = JSON.parse(
    localStorage.getItem("defaultWeatherLocation")
  );

  if (!savedLocation) {
    alertBox("Sorry no saved location, Please save a location and try again");
  } else {
    localStorage.setItem("homePage", "home");
    geoSuccess(savedLocation);
  }
};

const saveHomeLocation = (e) => {
  if (!e.target.classList.contains("saving")) {
    e.target.classList.add("saving");
    alertBox(
      `${locationData.name} has been sucessfully saved as your home location`
    );

    localStorage.setItem("defaultWeatherLocation", currentLoc);

    setTimeout(() => {
      e.target.classList.remove("saving");
    }, 3000);
  }
};

const updateSearchData = async (currentLocObj, firstLocObj, secondLocObj) => {
  const searchFlag = document.getElementById("searchBar__text").value
    ? true
    : false;

  if (!searchFlag) {
    if (!firstLocObj) {
      await findNearbyLocations(currentLocObj.getLatLon());
      await updateLocationWeatherObj(firstNearbyLoc);
      await updateLocationWeatherObj(secondNearbyLoc);
    }

    updateSearchPage(currentLocObj || currentLoc, [
      firstLocObj || firstNearbyLoc,
      secondLocObj || secondNearbyLoc,
    ]);

    cacheWeatherData("defaultWeatherLocation", currentLocObj || currentLoc);
    cacheWeatherData("firstNearbyLocation", firstLocObj || firstNearbyLoc);
    cacheWeatherData("secondNearbyLocation", secondLocObj || secondNearbyLoc);
  } else {
    updateSearchPage(currentLocObj);
  }

  postDynamicInfoToggles();
};

const toggleActivePage = () => {
  const pages = document.querySelectorAll(".home__icon");
  const homeLoc = localStorage.getItem("defaultWeatherLocation");

  pages.forEach((page) => {
    if (page.classList.contains("home") && !homeLoc) return;

    page.addEventListener("click", (event) => {
      pages.forEach((elem) => {
        elem.classList.remove("active");
      });
      event.target.classList.add("active");
      return;
    });
  });

  const homePage = getHomePage();
  pages.forEach((page) => {
    if (homePage === "home" && page.classList.contains("home")) {
      page.classList.add("active");
    } else if (homePage === "home" && !page.classList.contains("home")) {
      page.classList.remove("active");
    } else if (
      homePage === "currentLocation" &&
      page.classList.contains("currentLoc")
    ) {
      page.classList.add("active");
    } else {
      page.classList.remove("active");
    }
  });
  if (homePage === "home") {
  }
};

const postDynamicInfoToggles = () => {
  const units = document.querySelectorAll(".unit");
  console.log(units);
  units.forEach((unit) => {
    unit.addEventListener("click", toggleUnits);
  });

  const hour = document.querySelectorAll(".hour");
  let nextSibling, prevSibling;
  hour.forEach((element) => {
    element.addEventListener("click", () => {
      element.classList.add("active");

      nextSibling = element.nextElementSibling;
      while (nextSibling) {
        nextSibling.classList.remove("active");
        nextSibling = nextSibling.nextElementSibling;
      }

      prevSibling = element.previousElementSibling;
      while (prevSibling) {
        prevSibling.classList.remove("active");
        prevSibling = prevSibling.previousElementSibling;
      }
    });
  });

  const day = document.querySelectorAll(".day");
  day.forEach((element) => {
    element.addEventListener("click", () => {
      element.classList.add("active");

      nextSibling = element.nextElementSibling;
      while (nextSibling) {
        nextSibling.classList.remove("active");
        nextSibling = nextSibling.nextElementSibling;
      }

      prevSibling = element.previousElementSibling;
      while (prevSibling) {
        prevSibling.classList.remove("active");
        prevSibling = prevSibling.previousElementSibling;
      }
    });
  });
};

const toggleDefaultMode = () => {
  const mode = localStorage.getItem("mode");
  mode && mode === "dark" && toggleLightDark("load");
};

const toggleLightDark = (status) => {
  const modes = document.querySelectorAll(".mode");
  const currentMode = localStorage.getItem("mode");

  let idArr;

  if (page === "Home Page") {
    idArr = [
      "overlay",
      "home__header",
      "currentForecast",
      "currentConditions",
      "hourlyForecast",
      "daily",
      "navbar",
      "selectBox",
      "chartMenu",
      "dailyChartBox",
    ];
  } else if (page === "Search Page") {
    idArr = [
      "searchBar",
      "overlay",
      "search__header",
      "currentForecast",
      "currentConditions",
      "searchForecast",
      "searchConditions",
      "hourlyForecast",
      "daily",
      "nearbyLocations",
      "moreInfo",
      "navbar",
      "dailyChartBox",
      "selectBox",
      "chartMenu",
    ];
  }

  modes.forEach((elem) => {
    elem.classList.toggle("active");
  });

  idArr.forEach((elem) => {
    document.getElementById(elem).classList.toggle("dark");
  });

  if (!(status === "load")) {
    if (currentMode) {
      currentMode === "light"
        ? localStorage.setItem("mode", "dark")
        : localStorage.setItem("mode", "light");
    } else {
      document.getElementById(idArr[0]).classList.contains("dark")
        ? localStorage.setItem("mode", "dark")
        : localStorage.setItem("mode", "light");
    }
  }
};

const toggleUnits = () => {
  currentLoc.toggleUnit();
  document.querySelectorAll(".unit").forEach((unit) => {
    unit.classList.add("change");
  });

  setTimeout(() => {
    if (page === "Home Page") {
      firstNearbyLoc.toggleUnit();
      secondNearbyLoc.toggleUnit();

      updatePageData(currentLoc);
    } else if (page === "Search Page") {
      updateSearchData(currentLoc, "true");
    }
  }, 1000);
};

const searchOrFocus = (event) => {
  const searchBar = document.getElementById("searchBar__text");
  if (searchBar.value) {
    submitNewLocation(event);
  } else {
    searchBar.focus();
  }
};

const clearSearchBar = () => {
  const input = document.getElementById("searchBar__text");
  input.value = "";
  input.focus();
};
