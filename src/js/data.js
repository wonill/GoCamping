export {
  fetchCampingData,
  setDetailSection,
  closeDetailSection,
  fetchSearchData,
  createList,
  fillListSection,
};

const API_KEY_ENCODE = import.meta.env.VITE_PUBLIC_DATA_API_KEY_ENCODE;
const API_KEY_DECODE = import.meta.env.VITE_PUBLIC_DATA_API_KEY_DECODE;

let url = new URL(`https://apis.data.go.kr`);

let numOfRows = 4000;
let pageNo = 1;
const mobileOS = "ETC";
const mobileApp = "LOCACAMP";

let campingSites;
let markers;
// let lastDisplayIndex = -1;

const $detailSection = document.querySelector(".detail-section");
const $list = document.querySelector(".list-section > .list");

const $facilityName = document.getElementById("facilityName");
const $campingImage = document.querySelector("#campingImage > img");
const $address = document.getElementById("address");
const $intro = document.getElementById("intro");
const $homepage = document.getElementById("homepage");
const $manageStatus = document.getElementById("manageStatus");
const $direction = document.getElementById("direction");
const $reservationMethod = document.getElementById("reservationMethod");
const $facilities = document.getElementById("facilities");
const $cookingItems = document.getElementById("cookingItems");
const $allowPets = document.getElementById("allowPets");

const fetchCampingData = async (center, radius) => {
  url.pathname = "/B551011/GoCamping/locationBasedList";
  url.searchParams.set("numOfRows", numOfRows);
  url.searchParams.set("pageNo", pageNo);
  url.searchParams.set("MobileOS", mobileOS);
  url.searchParams.set("MobileApp", mobileApp);
  url.searchParams.set("serviceKey", API_KEY_DECODE);
  url.searchParams.set("_type", "json");
  url.searchParams.set("mapX", center.getLng());
  url.searchParams.set("mapY", center.getLat());
  url.searchParams.set("radius", radius);

  console.log(url.toString());

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    console.log(data.response.body.items.item);
    campingSites = data.response.body.items.item;
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error); // 에러 처리
  }

  return campingSites;
};

const testPrint = (campingSite) => {
  let contentId = campingSite.contentId;
  let facilityName = campingSite.facltNm;
  let campingImage = campingSite.firstImageUrl;
  let address = campingSite.addr1;
  let intro = campingSite.intro;
  let homepage = campingSite.homepage;
  let manageStatus = campingSite.manageSttus;
  let direction = campingSite.direction;
  let reservationMethod = campingSite.resveCl;
  let facilities = campingSite.glampInnerFclty;
  let cookingItems = campingSite.eqpmnLendCl;
  let allowPets = campingSite.animalCmgCl;
  console.log(
    contentId,
    facilityName,
    campingImage,
    address,
    campingSite.addr2,
    intro,
    homepage,
    manageStatus,
    direction,
    reservationMethod,
    facilities,
    cookingItems,
    allowPets
  );
};

const setDetailSection = (campingSite) => {
  $facilityName.textContent = campingSite.facltNm;

  $campingImage.src =
    campingSite.firstImageUrl ||
    "https://previews.123rf.com/images/pavelstasevich/pavelstasevich1902/pavelstasevich190200120/124934975-%EC%82%AC%EC%9A%A9-%EA%B0%80%EB%8A%A5%ED%95%9C-%EC%9D%B4%EB%AF%B8%EC%A7%80-%EC%95%84%EC%9D%B4%EC%BD%98%EC%9D%B4-%EC%97%86%EC%8A%B5%EB%8B%88%EB%8B%A4-%EB%B2%A1%ED%84%B0-%ED%8F%89%EB%A9%B4.jpg";

  $address.textContent = campingSite.addr1 || "제공된 정보 없음";

  $homepage.href = campingSite.homepage;

  $homepage.textContent = campingSite.homepage;

  $manageStatus.textContent = campingSite.manageSttus || "제공된 정보 없음";
  if (campingSite.manageSttus && campingSite.manageSttus == "운영") {
    $manageStatus.style.cssText = `
      font-weight: bold;
      color: #0B75AD;
    `;
  }

  $direction.textContent = campingSite.direction || "제공된 정보 없음";

  $reservationMethod.textContent = campingSite.resveCl || "제공된 정보 없음";
  if (campingSite.resveCl) {
    $reservationMethod.style.cssText = `
      font-weight: bold;
      color: #0B75AD;
    `;
  }

  $facilities.textContent = campingSite.sbrsCl || "제공된 정보 없음";

  $cookingItems.textContent = campingSite.eqpmnLendCl || "제공된 정보 없음";

  $allowPets.textContent = campingSite.animalCmgCl || "제공된 정보 없음";
  if (
    campingSite.animalCmgCl &&
    campingSite.animalCmgCl.slice(0, 2) == "가능"
  ) {
    $allowPets.style.cssText = `
      font-weight: bold;
      color: rgb(41, 193, 129);
    `;
  } else if (
    campingSite.animalCmgCl &&
    campingSite.animalCmgCl.slice(0, 3) == "불가능"
  ) {
    $allowPets.style.cssText = `
      font-weight: bold;
      color: red;
    `;
  }

  $intro.querySelector("p").textContent = campingSite.intro;
  $intro.style.display = campingSite.intro ? "block" : "none";

  const $campingSiteData = $detailSection.querySelector(".campingSiteData");
  $campingSiteData.scrollTo({
    top: 0,
  });

  $detailSection.classList.add("open");
};

const closeDetailSection = () => {
  $detailSection.classList.remove("open");
};

// const searchURL = `https://apis.data.go.kr/B551011/GoCamping/searchList?numOfRows=10&pageNo=1&MobileOS=ETC&MobileApp=LOCACAMP&serviceKey=${API_KEY_ENCODE}&_type=json&keyword=%EC%95%BC%EC%98%81%EC%9E%A5`;
let searchURL = new URL(`https://apis.data.go.kr`);
const fetchSearchData = async (keyword) => {
  searchURL.pathname = "/B551011/GoCamping/searchList";
  searchURL.searchParams.set("numOfRows", 3988);
  searchURL.searchParams.set("pageNo", 1);
  searchURL.searchParams.set("MobileOS", mobileOS);
  searchURL.searchParams.set("MobileApp", mobileApp);
  searchURL.searchParams.set("serviceKey", API_KEY_DECODE);
  searchURL.searchParams.set("_type", "json");
  searchURL.searchParams.set("keyword", keyword);
  try {
    const res = await fetch(searchURL);
    const data = await res.json();
    console.log(data.response.body.items.item);
    campingSites = data.response.body.items.item;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
  return campingSites;
};

function isValidUrl(homepage) {
  try {
    new URL(homepage);
    return true;
  } catch (_) {
    return false;
  }
}

const createList = (campingSite) => {
  if (!campingSites) return;
  const li = document.createElement("li");
  li.setAttribute("data-id", campingSite.contentId);
  li.innerHTML = `
              <div class="name">
                ${campingSite.facltNm}<span class="induty">${
    campingSite.induty
  }</span>
              </div>
              <div>
                <svg
                  width="18"
                  height="21"
                  viewBox="0 0 18 21"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M8.46963 20.3188L8.47316 20.32C8.7049 20.4211 8.83429 20.3976 8.83429 20.3976C8.83429 20.3976 8.96369 20.4211 9.1966 20.32L9.19896 20.3188L9.20601 20.3153L9.22719 20.3059C9.33879 20.2539 9.44901 20.199 9.55774 20.1412C9.77653 20.0283 10.0824 19.8589 10.4482 19.6318C11.1775 19.1801 12.148 18.4955 13.1232 17.5556C15.0712 15.6782 17.0686 12.7432 17.0686 8.63431C17.0686 7.55297 16.8556 6.48221 16.4418 5.48317C16.028 4.48414 15.4215 3.5764 14.6568 2.81177C13.8922 2.04714 12.9845 1.44061 11.9854 1.02679C10.9864 0.612981 9.91564 0.399994 8.83429 0.399994C7.75295 0.399994 6.68219 0.612981 5.68316 1.02679C4.68412 1.44061 3.77638 2.04714 3.01175 2.81177C2.24712 3.5764 1.64059 4.48414 1.22678 5.48317C0.812963 6.48221 0.599976 7.55297 0.599976 8.63431C0.599976 12.7421 2.59739 15.6782 4.54657 17.5556C5.36247 18.3396 6.25868 19.0355 7.22037 19.6318C7.59292 19.8629 7.97604 20.0764 8.36847 20.2718L8.4414 20.3059L8.46257 20.3153L8.46963 20.3188ZM8.83429 11.2811C9.53625 11.2811 10.2095 11.0022 10.7058 10.5058C11.2022 10.0095 11.481 9.33627 11.481 8.63431C11.481 7.93235 11.2022 7.25914 10.7058 6.76278C10.2095 6.26642 9.53625 5.98757 8.83429 5.98757C8.13233 5.98757 7.45912 6.26642 6.96276 6.76278C6.4664 7.25914 6.18755 7.93235 6.18755 8.63431C6.18755 9.33627 6.4664 10.0095 6.96276 10.5058C7.45912 11.0022 8.13233 11.2811 8.83429 11.2811Z"
                    fill="#238CFA"
                  />
                </svg>
                <p class="addr">${campingSite.addr1}</p>
              </div>
              <div>
                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTiPebaQOzJl5_rzH_c5EAaygIuJdtp7n4I9Q3NowGU7jQF-ahw51tagfIJHb68un0xOJk&usqp=CAU" alt="연락처" />
                <span class="tel">연락처 없음</span>
                <a href="#" class="details" data-id="${
                  campingSite.contentId
                }">상세보기</a>
                <a href="${campingSite.homepage || "javascript:void(0);"}" ${
    campingSite.homepage ? "target='_blank'" : ""
  } class="homepage">홈페이지</a>
              </div>
            `;
  return li;
};

const fillListSection = () => {
  $list.innerHTML = ``;
  // let len = campingSites.length > 10 ? 10 : campingSites.length;
  if (!campingSites) return;
  let len = campingSites.length;
  for (let i = 0; i < len; i++) {
    const li = createList(campingSites[i]);
    $list.appendChild(li);
  }
};
