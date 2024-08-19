import {
  fetchCampingData,
  setDetailSection,
  removeDetailSection,
} from "./data.js";

const markerSvgString = `<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M3 31.5V27C3 26.675 3.05 26.3625 3.15 26.0625C3.25 25.7625 3.4 25.475 3.6 25.2L16.125 8.32502L14.4 6.00002C14.275 5.82502 14.1875 5.64402 14.1375 5.45702C14.0875 5.27002 14.075 5.08252 14.1 4.89452C14.125 4.70652 14.1875 4.52502 14.2875 4.35002C14.3875 4.17502 14.525 4.02502 14.7 3.90002C15.05 3.65002 15.425 3.55002 15.825 3.60002C16.225 3.65002 16.55 3.85002 16.8 4.20002L18 5.81252L19.2 4.20002C19.45 3.85002 19.775 3.65002 20.175 3.60002C20.575 3.55002 20.95 3.65002 21.3 3.90002C21.65 4.15002 21.85 4.47502 21.9 4.87502C21.95 5.27502 21.85 5.65002 21.6 6.00002L19.875 8.32502L32.4 25.2C32.6 25.475 32.75 25.7625 32.85 26.0625C32.95 26.3625 33 26.675 33 27V31.5C33 31.925 32.8565 32.2815 32.5695 32.5695C32.2825 32.8575 31.926 33.001 31.5 33H4.5C4.075 33 3.719 32.856 3.432 32.568C3.145 32.28 3.001 31.924 3 31.5ZM12.3375 30H23.6625L18 22.0875L12.3375 30Z" fill="#F56652"/>
</svg>`;
// SVG를 Base64로 인코딩
const markerImageSrc = "data:image/svg+xml;base64," + btoa(markerSvgString);

let map;
let center;
let markers = new Map();
let overlays = [];
let activeId = "";

const kakaoMap = document.getElementById("kakaoMap");
const refreshMapBtn = document.getElementById("refreshMapBtn");
const closeBtn = document.getElementById("close");
// const $detailSection = document.querySelector(".detail-section");

function centerMapOnMarker(id) {
  const marker = markers.get(id);
  const markerPosition = marker.getPosition();
  const mapBounds = map.getBounds();

  // 마커가 지도 범위 내에 있는지 확인
  if (!mapBounds.contain(markerPosition)) {
    // 마커가 지도 밖에 있으면 해당 위치로 지도 중심 이동
    map.setCenter(markerPosition);
  } else {
    // 마커가 지도 안에 있지만 가장자리에 있는지 확인
    const mapCenter = map.getCenter();
    const proj = map.getProjection();
    const markerPos = proj.pointFromCoords(markerPosition);
    const centerPos = proj.pointFromCoords(mapCenter);

    // 지도 컨테이너의 크기 가져오기
    const mapWidth = kakaoMap.clientWidth;
    const mapHeight = kakaoMap.clientHeight;

    // 마커와 지도 중심 사이의 거리 계산
    const distanceX = Math.abs(markerPos.x - centerPos.x);
    const distanceY = Math.abs(markerPos.y - centerPos.y);

    // 지도 크기의 25% 이내에 마커가 있는지 확인
    const threshold = Math.min(mapWidth, mapHeight) * 0.25;

    if (distanceX > threshold || distanceY > threshold) {
      // 마커가 가장자리에 있으면 부드럽게 중심 이동
      map.panTo(markerPosition);
    }
  }
}

const deactivateCampSite = () => {
  activeId = "";
  for (let i = 0; i < overlays.length; i++) {
    overlays[i].setMap(null);
  }
  removeDetailSection();
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
          : "./src/assets/images/no_image.png"
      }" width="73" height="70">` +
      "           </div>" +
      `            <div class="info_window_desc">` +
      `                <div class="info_window_ellipsis">${campingSite.addr1}</div>` +
      `                <div class="info_window_jibun info_window_ellipsis">${campingSite.induty}</div>` +
      `                <div><a href="${campingSite.homepage}" target="_blank" class="info_window_link">홈페이지</a></div>` +
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

const createMarkers = async () => {
  const campingSites = await fetchCampingData(center, getRadius());

  let marker;
  for (let i = 0; i < campingSites.length; i++) {
    let imageSize = new kakao.maps.Size(25, 25);
    let markerImage = new kakao.maps.MarkerImage(
      markerImageSrc,
      imageSize // 마커 이미지의 크기
    );
    marker = new kakao.maps.Marker({
      map,
      position: new kakao.maps.LatLng(
        campingSites[i].mapY,
        campingSites[i].mapX
      ),
      title: campingSites[i].facltNm, // 마커의 타이틀, 마커에 마우스를 올리면 타이틀이 표시됩니다
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

function initializeMap(lat, lng) {
  center = new kakao.maps.LatLng(lat, lng);
  console.log(4);
  let options = {
    center: center,
    // center: new kakao.maps.LatLng(37.7278127, 127.5112565),
    level: 6,
  };
  console.log("현재 위치", lat, lng);
  map = new kakao.maps.Map(kakaoMap, options);
  let currentPositionMarker = new kakao.maps.Marker({
    map,
    position: center,
    title: "현재 위치",
  });
  createMarkers();

  let timer;
  kakao.maps.event.addListener(map, "bounds_changed", function () {
    clearTimeout(timer);
    timer = setTimeout(function () {
      refreshMapBtn.classList.add("on");
    }, 1000); // 300ms 후에 실행
  });
}

const init = () => {
  let lat;
  let lng;

  const kakaoMapApiKey = import.meta.env.VITE_KAKAO_MAP_API_KEY;
  const script = document.createElement("script");
  console.log(kakaoMapApiKey);
  script.type = "text/javascript";
  script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoMapApiKey}&autoload=false`;
  console.log("start");
  document.head.appendChild(script);
  script.onload = () => {
    console.log(1);
    kakao.maps.load(() => {
      console.log(2);
      if (navigator.geolocation) {
        console.log(3);
        navigator.geolocation.getCurrentPosition(function (position) {
          // 현재 위치로 카카오 맵 표시
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

refreshMapBtn.addEventListener("click", () => {
  center = map.getCenter();
  clearMarkers();
  createMarkers();
  refreshMapBtn.classList.remove("on");
});

closeBtn.addEventListener("click", () => {
  deactivateCampSite();
});

init();

// $info_window_close.addEventListener("click", () => {
//   closeOverlays();

// });

// setTimeout(() => {
//   // document.querySelector(".data-section").classList.add("open");
//   // // 현재 중심 좌표 가져오기
//   // const currentCenter = map.getCenter();
//   // const currentLng = currentCenter.getLng();
//   // const currentLat = currentCenter.getLat();
//   // // 현재 맵의 크기 가져오기
//   // const mapWidth =
//   //   map.getBounds().getNorthEast().getLng() -
//   //   map.getBounds().getSouthWest().getLng();
//   // // 12.5% 이동 거리 계산
//   // const moveDistance = mapWidth / 6; // 전체 너비의 12.5%
//   // // 새로운 경도 계산 (왼쪽으로 이동)
//   // const newLng = currentLng - moveDistance;
//   // // 새로운 중심 좌표 설정
//   // const newCenter = new kakao.maps.LatLng(currentLat, newLng);
//   // map.panTo(newCenter);
// }, 3000);
