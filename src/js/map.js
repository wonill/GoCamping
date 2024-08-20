import {
  fetchCampingData,
  setDetailSection,
  closeDetailSection,
  fillListSection,
  fetchSearchData,
} from "./data.js";

export { deactivateCampSite, clearMarkers, createMarkers };

const markerSvgString = `<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M3 31.5V27C3 26.675 3.05 26.3625 3.15 26.0625C3.25 25.7625 3.4 25.475 3.6 25.2L16.125 8.32502L14.4 6.00002C14.275 5.82502 14.1875 5.64402 14.1375 5.45702C14.0875 5.27002 14.075 5.08252 14.1 4.89452C14.125 4.70652 14.1875 4.52502 14.2875 4.35002C14.3875 4.17502 14.525 4.02502 14.7 3.90002C15.05 3.65002 15.425 3.55002 15.825 3.60002C16.225 3.65002 16.55 3.85002 16.8 4.20002L18 5.81252L19.2 4.20002C19.45 3.85002 19.775 3.65002 20.175 3.60002C20.575 3.55002 20.95 3.65002 21.3 3.90002C21.65 4.15002 21.85 4.47502 21.9 4.87502C21.95 5.27502 21.85 5.65002 21.6 6.00002L19.875 8.32502L32.4 25.2C32.6 25.475 32.75 25.7625 32.85 26.0625C32.95 26.3625 33 26.675 33 27V31.5C33 31.925 32.8565 32.2815 32.5695 32.5695C32.2825 32.8575 31.926 33.001 31.5 33H4.5C4.075 33 3.719 32.856 3.432 32.568C3.145 32.28 3.001 31.924 3 31.5ZM12.3375 30H23.6625L18 22.0875L12.3375 30Z" fill="#F56652"/>
</svg>`;

const markerImageSrc = "data:image/svg+xml;base64," + btoa(markerSvgString);

let map;
let center;
let markers = new Map();
let overlays = [];
let activeId = "";

const kakaoMap = document.getElementById("kakaoMap");
const refreshMapBtn = document.getElementById("refreshMapBtn");
const closeBtn = document.getElementById("close");
const $searchInput = document.querySelector(".search > input");
const $list = document.querySelector(".list");

function centerMapOnMarker(id) {
  const marker = markers.get(id);
  const markerPosition = marker.getPosition();
  const mapBounds = map.getBounds();

  if (!mapBounds.contain(markerPosition)) {
    map.setCenter(markerPosition);
  } else {
    const mapCenter = map.getCenter();
    const proj = map.getProjection();
    const markerPos = proj.pointFromCoords(markerPosition);
    const centerPos = proj.pointFromCoords(mapCenter);

    const mapWidth = kakaoMap.clientWidth;
    const mapHeight = kakaoMap.clientHeight;

    const distanceX = Math.abs(markerPos.x - centerPos.x);
    const distanceY = Math.abs(markerPos.y - centerPos.y);

    const threshold = Math.min(mapWidth, mapHeight) * 0.25;

    if (distanceX > threshold || distanceY > threshold) {
      map.panTo(markerPosition);
    }
  }
}

const deactivateCampSite = () => {
  activeId = "";
  for (let i = 0; i < overlays.length; i++) {
    overlays[i].setMap(null);
  }
  closeDetailSection();
};
window.deactivateCampSite = deactivateCampSite;

const activateCampSite = (campingSite) => {
  activeId = campingSite.contentId;
  for (let i = 0; i < overlays.length - 1; i++) {
    overlays[i].setMap(null);
  }
  console.log(overlays.length);
  overlays = [overlays.pop()];
  setDetailSection(campingSite);
};

const createCustomOverlay = (marker, campingSite) => {
  let overlay;
  kakao.maps.event.addListener(marker, "mouseover", function () {
    let content =
      `<div class="info_window_wrap">` +
      `    <div class="info_window_info">` +
      `        <div class="info_window_title">` +
      campingSite.facltNm +
      `            <div class="info_window_close" onclick="deactivateCampSite()" title="닫기"></div>` +
      "        </div>" +
      `        <div class="info_window_body">` +
      `            <div class="info_window_img">` +
      `                <img src="${
        campingSite.firstImageUrl
          ? campingSite.firstImageUrl
          : // : "/src/assets/images/no_image.png"
            "https://us.123rf.com/450wm/koblizeek/koblizeek2208/koblizeek220800254/190563481-no-image-vector-symbol-missing-available-icon-no-gallery-for-this-moment-placeholder.jpg"
      }" width="73" height="70">` +
      "           </div>" +
      `            <div class="info_window_desc">` +
      `                <div class="info_window_ellipsis">${campingSite.addr1}</div>` +
      `                <div class="info_window_jibun info_window_ellipsis">${campingSite.induty}</div>` +
      `                <div><a href="${
        campingSite.homepage || "javascript:void(0);"
      }" ${
        campingSite.homepage ? 'target="_blank"' : ""
      } class="info_window_link">홈페이지</a></div>` +
      "            </div>" +
      "        </div>" +
      "    </div>" +
      "</div>";

    overlay = new kakao.maps.CustomOverlay({
      content: content,
      position: marker.getPosition(),
    });
    overlay.setMap(map);
    overlays.push(overlay);
  });
  kakao.maps.event.addListener(marker, "mouseout", function () {
    if (activeId != campingSite.contentId) {
      overlay.setMap(null);
    }
  });
  kakao.maps.event.addListener(marker, "click", function () {
    centerMapOnMarker(campingSite.contentId);
    activateCampSite(campingSite);
  });
};

const getRadius = () => {
  const bounds = map.getBounds();
  const southWest = bounds.getSouthWest(); // 남서쪽 꼭지점
  const radius = new kakao.maps.Polyline({
    path: [
      new kakao.maps.LatLng(southWest.getLat(), southWest.getLng()),
      new kakao.maps.LatLng(center.getLat(), center.getLng()),
    ],
  }).getLength();
  return radius;
};

const createMarkers = async (keyword) => {
  const campingSites = keyword
    ? await fetchSearchData(keyword)
    : await fetchCampingData(center, getRadius());
  if (!campingSites) return;
  let marker;
  for (let i = 0; i < campingSites.length; i++) {
    let imageSize = new kakao.maps.Size(25, 25);
    let markerImage = new kakao.maps.MarkerImage(markerImageSrc, imageSize);
    marker = new kakao.maps.Marker({
      map,
      position: new kakao.maps.LatLng(
        campingSites[i].mapY,
        campingSites[i].mapX
      ),
      title: campingSites[i].facltNm,
      image: markerImage,
    });
    markers.set(campingSites[i].contentId, marker);
    createCustomOverlay(marker, campingSites[i]);
  }
};

const clearMarkers = () => {
  if (markers.size) {
    for (const marker of markers.values()) {
      marker.setMap(null);
    }
    markers.clear();
  }
};

const initializeMap = async (lat, lng) => {
  center = new kakao.maps.LatLng(lat, lng);
  let options = {
    center: center,
    level: 6,
  };
  console.log("현재 위치", lat, lng);
  map = new kakao.maps.Map(kakaoMap, options);
  let currentPositionMarker = new kakao.maps.Marker({
    map,
    position: center,
    title: "현재 위치",
  });
  await createMarkers();
  await fillListSection();

  let timer;
  kakao.maps.event.addListener(map, "bounds_changed", function () {
    clearTimeout(timer);
    timer = setTimeout(function () {
      refreshMapBtn.classList.add("on");
    }, 1000);
  });
};

const init = () => {
  let lat;
  let lng;

  const kakaoMapApiKey = import.meta.env.VITE_KAKAO_MAP_API_KEY;
  const script = document.createElement("script");
  script.type = "text/javascript";
  script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoMapApiKey}&autoload=false`;
  document.head.appendChild(script);
  script.onload = () => {
    kakao.maps.load(() => {
      window.kakao = kakao;
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
          lat = position.coords.latitude;
          lng = position.coords.longitude;

          initializeMap(lat, lng);
        });
      } else {
        lat = 37.498004414546934;
        lng = 127.02770621963765;

        initializeMap(lat, lng);
      }
    });
  };
};

refreshMapBtn.addEventListener("click", async () => {
  center = map.getCenter();
  $searchInput.value = "";
  await deactivateCampSite();
  await clearMarkers();
  await createMarkers();
  await fillListSection();
  refreshMapBtn.classList.remove("on");
});

closeBtn.addEventListener("click", () => {
  deactivateCampSite();
});

$list.addEventListener("mouseover", (e) => {
  const liElement = e.target.closest("li");
  if (!liElement || !liElement.dataset.id) return;
  const id = liElement.dataset.id;
  const marker = markers.get(id);
  if (marker) {
    kakao.maps.event.trigger(marker, "mouseover");
  }
});
$list.addEventListener("mouseout", (e) => {
  const liElement = e.target.closest("li");
  if (!liElement || !liElement.dataset.id) return;
  const id = liElement.dataset.id;
  const marker = markers.get(id);
  if (marker) {
    kakao.maps.event.trigger(marker, "mouseout");
  }
});
$list.addEventListener("click", (e) => {
  const aElement = e.target.closest("a");
  if (!aElement || !aElement.dataset.id) return;
  const id = aElement.dataset.id;
  const marker = markers.get(id);
  if (marker) {
    kakao.maps.event.trigger(marker, "click");
  }
});

init();
