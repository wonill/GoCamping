import { fetchSearchData, createList } from "./data.js";

let $searchInput = document.querySelector(".search > input");
let $searchBtn = document.querySelector(".searchBtn");
let $list = document.querySelector(".list-section > .list");

document.addEventListener("DOMContentLoaded", function () {
  $searchInput.focus();
});

const search = async (value) => {
  if (value) {
    let campingSites = await fetchSearchData(value);
    $list.innerHTML = ``;
    for (let i = 0; i < campingSites.length; i++) {
      const li = createList(campingSites[i]);
      $list.appendChild(li);
    }
  }
};

$searchInput.addEventListener("keyup", (e) => {
  if (e.key != "Enter") return;
  search(e.target.value.trim());
});

$searchBtn.addEventListener("click", () => {
  search($searchInput.value.trim());
});
