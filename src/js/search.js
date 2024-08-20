import { fillListSection } from "./data.js";
import { deactivateCampSite, clearMarkers, createMarkers } from "./map.js";

let isLoading = false;

let $searchInput = document.querySelector(".search > input");
let $searchBtn = document.querySelector(".searchBtn");
let $list = document.querySelector(".list-section > .list");

document.addEventListener("DOMContentLoaded", function () {
  $searchInput.focus();
});

const search = async (value) => {
  if (value) {
    $searchInput.value = "";
    await deactivateCampSite();
    await clearMarkers();
    await createMarkers(value);
    await fillListSection();
  }
};

$searchInput.addEventListener("keyup", (e) => {
  if (e.key != "Enter") return;
  search(e.target.value.trim());
});

$searchBtn.addEventListener("click", () => {
  search($searchInput.value.trim());
});
