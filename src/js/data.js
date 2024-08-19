export {
  fetchCampingData,
  setDetailSection,
  removeDetailSection,
  fetchSearchData,
  createList,
};

// const API_KEY = decodeURIComponent(
//   "cJcy2xKvqpNiaNiLtIIKlDtZ5T2lgeZ48bDzF4oIGTkHDiQe1o3k%2FzAr2CQJm4YxiB7%2BDVdpBeJeUIZT%2Bnmy%2FA%3D%3D"
// );
// const API_KEY_ENCODE = `cJcy2xKvqpNiaNiLtIIKlDtZ5T2lgeZ48bDzF4oIGTkHDiQe1o3k%2FzAr2CQJm4YxiB7%2BDVdpBeJeUIZT%2Bnmy%2FA%3D%3D`;
// const API_KEY_DECODE =
//   "cJcy2xKvqpNiaNiLtIIKlDtZ5T2lgeZ48bDzF4oIGTkHDiQe1o3k/zAr2CQJm4YxiB7+DVdpBeJeUIZT+nmy/A==";
const API_KEY_ENCODE = import.meta.env.VITE_PUBLIC_DATA_API_KEY_ENCODE;
const API_KEY_DECODE = import.meta.env.VITE_PUBLIC_DATA_API_KEY_DECODE;
// ("cJcy2xKvqpNiaNiLtIIKlDtZ5T2lgeZ48bDzF4oIGTkHDiQe1o3k/zAr2CQJm4YxiB7+DVdpBeJeUIZT+nmy/A==");
let url = new URL(`https://apis.data.go.kr`);

let numOfRows = 4000;
let pageNo = 1;
const mobileOS = "ETC"; // ETC로 설정
const mobileApp = "LOCACAMP"; // 어플명

// let url = `https://apis.data.go.kr/B551011/GoCamping/basedList?serviceKey=${API_KEY}&numOfRows=${numOfRows}&pageNo=${pageNo}&MobileOS=${mobileOS}&MobileApp=${mobileApp}&_type=json`;
// let url = `https://apis.data.go.kr/B551011/GoCamping/locationBasedList?numOfRows=${numOfRows}&pageNo=${pageNo}&MobileOS=ETC&MobileApp=MyCampingApp&serviceKey=${API_KEY}&_type=json&mapX=${mapX}&mapY=${mapY}&radius=${radius}`;

let campingSites;

const $detailSection = document.querySelector(".detail-section");

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
    createHtml(campingSites[2]);
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error); // 에러 처리
  }

  return campingSites;
};

const createHtml = (campingSite) => {
  //아이디(o)
  let contentId = campingSite.contentId;
  // 시설 이름(o)
  let facilityName = campingSite.facltNm;
  // 이미지(o)
  let campingImage = campingSite.firstImageUrl;
  // 주소(o)
  let address = campingSite.addr1;
  // 설명
  let intro = campingSite.intro;
  // 홈페이지(o)
  let homepage = campingSite.homepage;
  // 현재운영여부(o)
  let manageStatus = campingSite.manageSttus;
  // 오시는 길
  let direction = campingSite.direction;
  // 예약방법(o)
  let reservationMethod = campingSite.resveCl;
  // 내부시설
  let facilities = campingSite.glampInnerFclty;
  // 취사도구
  let cookingItems = campingSite.eqpmnLendCl;
  // 애완견가능여부(o)
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

  // let urlToImage = news.urlToImage || "./newsImg.jpg";
  // let title = news.title || "제목없음";
  // let description = news.description
  //   ? news.description.length > 100
  //     ? news.description.substring(0, 100) + "..."
  //     : news.description
  //   : "내용이 없어요";
  // let author = news.author || "작성자없음";
  // let publishedAt = news.publishedAt
  //   ? new Date(news.publishedAt).toISOString().slice(0, 10)
  //   : "";
  // let source = news.source ? news.source.name || "출처없음" : "출처없음";
  // return `<li>
  //           <div class="newsImg"><img src="${urlToImage}" alt="" /></div>
  //           <p class="title">${title}</p>
  //           <p class="desc">${description}</p>
  //           <p class="source">${author}</p>
  //           <p class="source">${source}</p>
  //           <p class="date">${publishedAt}</p>
  //           <a class="more" href="${news.url} target='_blank'"></a>
  //         </li>`;
};

const setDetailSection = (campingSite) => {
  $facilityName.textContent = campingSite.facltNm;
  $campingImage.src =
    campingSite.firstImageUrl ||
    "https://previews.123rf.com/images/pavelstasevich/pavelstasevich1902/pavelstasevich190200120/124934975-%EC%82%AC%EC%9A%A9-%EA%B0%80%EB%8A%A5%ED%95%9C-%EC%9D%B4%EB%AF%B8%EC%A7%80-%EC%95%84%EC%9D%B4%EC%BD%98%EC%9D%B4-%EC%97%86%EC%8A%B5%EB%8B%88%EB%8B%A4-%EB%B2%A1%ED%84%B0-%ED%8F%89%EB%A9%B4.jpg";
  $address.textContent = campingSite.addr1 || "제공된 정보 없음";
  $intro.textContent = campingSite.intro || "제공된 정보 없음";
  $homepage.href = campingSite.homepage;
  $homepage.textContent = campingSite.homepage;
  $manageStatus.textContent = campingSite.manageSttus || "제공된 정보 없음";
  $direction.textContent = campingSite.direction || "제공된 정보 없음";
  $reservationMethod.textContent = campingSite.resveCl || "제공된 정보 없음";
  // $facilities.textContent = campingSite.glampInnerFclty || "제공된 정보 없음";
  $facilities.textContent = campingSite.sbrsCl || "제공된 정보 없음";
  $cookingItems.textContent = campingSite.eqpmnLendCl || "제공된 정보 없음";
  $allowPets.textContent = campingSite.animalCmgCl || "제공된 정보 없음";

  $detailSection.classList.add("open");
};

const removeDetailSection = () => {
  $detailSection.classList.remove("open");
};

// const searchURL = `https://apis.data.go.kr/B551011/GoCamping/searchList?numOfRows=10&pageNo=1&MobileOS=ETC&MobileApp=LOCACAMP&serviceKey=${API_KEY_ENCODE}&_type=json&keyword=%EC%95%BC%EC%98%81%EC%9E%A5`;
let searchURL = new URL(`https://apis.data.go.kr`);
const fetchSearchData = async (keyword) => {
  // url.pathname = "/B551011/GoCamping/searchList";
  // url.searchParams.set("numOfRows", 10);
  // url.searchParams.set("pageNo", 1);
  // url.searchParams.set("MobileOS", mobileOS);
  // url.searchParams.set("MobileApp", mobileApp);
  // url.searchParams.set("serviceKey", API_KEY_ENCODE);
  // url.searchParams.set("_type", "json");
  // url.searchParams.set("keyword", keyword);
  searchURL.pathname = "/B551011/GoCamping/searchList";
  searchURL.searchParams.set("numOfRows", 10);
  searchURL.searchParams.set("pageNo", 1);
  searchURL.searchParams.set("MobileOS", mobileOS);
  searchURL.searchParams.set("MobileApp", mobileApp);
  searchURL.searchParams.set("serviceKey", API_KEY_DECODE);
  searchURL.searchParams.set("_type", "json");
  searchURL.searchParams.set("keyword", keyword);
  try {
    const res = await fetch(searchURL);
    const data = await res.json();
    // console.log(data.response.body.items.item);
    campingSites = data.response.body.items.item;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
  return campingSites;
};

// fetchSearchData("야영장");

const createList = (campingSite) => {
  if (!campingSites) return;
  const li = document.createElement("li");
  li.innerHTML = `
              <div class="name">
                ${campingSite.facltNm}<span class="induty">${
    campingSite.induty
  }</span>
              </div>
              <p class="addr">${campingSite.addr1}</p>
              <p class="tel">${
                campingSite.tel ? campingSite.tel : "연락처 정보 없음"
              }</p>
              <a href="#"><input type="hidden" value="${
                campingSite.contentId
              }" /></a>
            `;
  return li;
};
