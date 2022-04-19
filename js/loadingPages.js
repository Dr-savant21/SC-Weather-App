const loadingPage = document.querySelector("#loading__page");

const pages = [
  "./img/loading-pages/compass-color.svg",
  "./img/loading-pages/compass.svg",
  "./img/loading-pages/tornado.svg",
  "./img/loading-pages/wind.svg",
  "./img/loading-pages/windsock.svg",
];

const random = Math.floor(Math.random() * pages.length);

console.log(loadingPage.style.backgroundImage);
loadingPage.style.backgroundImage = `url(${pages[random]})`;
console.log(loadingPage.style.backgroundImage);
