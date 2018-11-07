console.log(daum);

let markers = [];
let circles = [];
let infowindows = [];
let polygons = [];
let num = 1;
let geocoder = new daum.maps.services.Geocoder();

const mapContainer = document.getElementById('map'); // 지도를 표시할 div
const mapOption = {
  center: new daum.maps.LatLng(37.48403, 126.894125), // 지도의 중심좌표
  level: 4, // 지도의 확대 레벨
  mapTypeId: daum.maps.MapTypeId.ROADMAP // 지도종류
};

// 지도를 생성한다
const map = new daum.maps.Map(mapContainer, mapOption);

// 지도 타입 변경 컨트롤을 생성한다
const mapTypeControl = new daum.maps.MapTypeControl();
// 지도의 상단 우측에 지도 타입 변경 컨트롤을 추가한다
map.addControl(mapTypeControl, daum.maps.ControlPosition.TOPRIGHT);

const searchAddrFromCoords = (coords, callback) => {
  // 좌표로 행정동 주소 정보를 요청합니다
  geocoder.coord2RegionCode(coords.getLng(), coords.getLat(), callback);
}
const searchDetailAddrFromCoords = (coords, callback) => {
  // 좌표로 법정동 상세 주소 정보를 요청합니다
  geocoder.coord2Address(coords.getLng(), coords.getLat(), callback);
}

// const manager = new daum.maps.drawing.DrawingManager({
//   map: map,
//   drawingMode: [
//     daum.maps.drawing.OverlayType.MARKER,
//     daum.maps.drawing.OverlayType.CIRCLE
//   ]
// });

const shuffle = () => {
  return ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
}

const mEvent = () => {

  daum.maps.event.addListener(map, 'click', (mouseEvent) => {
    // 클릭한 위치의 좌표
    //mouseEvent.latLng



    searchDetailAddrFromCoords(mouseEvent.latLng, async (result, status) => {
      if (status === daum.maps.services.Status.OK) {
        let detailAddr = !!result[0].road_address ? '<div> 도로명주소 : ' + result[0].road_address.address_name + '</div>' : '';
        detailAddr += ' <div> 지번 주소 : ' + result[0].address.address_name + '</div>';

        let add = '<div class="bAddr">' + detailAddr + '</div>';
        await addMarker(mouseEvent.latLng, add);
        console.log(mouseEvent.latLng);
        await countMarker();
      }
    });
  });

  $("#initAll").click(() => {
    console.log("init");
    for (let i in markers) {
      markers[i].setMap(null);
      circles[i].setMap(null);
      infowindows[i].close;
    }
    markers = [];
    circles = [];
    infowindows = [];
    //map.Gb = [];
    num = 1;
    countMarker();
  });
}

const countMarker = () => {
  let cnt = markers.length;
  $('#markerCnt').text(cnt);
  console.log(cnt);
}

const setCircleColor = (group) => {
  if (group === "lora") {
    return "#ffcb11"
  } else if (group === "ble") {
    return "#56b6fc"
  } else if (group === "wifi") {
    return "#fc5656"
  }
}
const getRadius = () => {
  let rad = document.querySelector('input[name="rad"]:checked').value;
  if (rad != "") myradius = rad;
  return rad;
}

const addMarker = (position, add) => {

  const group = document.getElementById('markerGroup').value;
  const color = setCircleColor(group);
  let radius = getRadius()
  let content = '<div class = "hAddr">' + num + '번째 마커 [ ' + group + ' ]</div>' + add;
  // 지도에 원을 표시한다
  let circle = new daum.maps.Circle({
    center: position, // 지도의 중심 좌표
    radius: radius, // 원의 반지름 (단위 : m)
    fillOpacity: 0.3, // 채움 불투명도
    strokeWeight: 1, // 선의 두께
    strokeOpacity: 1, // 선 투명도
    strokeStyle: 'solid', // 선 스타일
    fillColor: color,
    strokeColor: color
  });

  let markerID = group + "_" + shuffle();
  let markerUrl = 'http://image.flaticon.com/icons/svg/787/787535.svg',
    markerSize = new daum.maps.Size(30, 31),
    markerOption = {
      offset: new daum.maps.Point(15, 31)
    };
  let markerImage = new daum.maps.MarkerImage(markerUrl, markerSize, markerOption);

  let marker = new daum.maps.Marker({
    position: position,
    clickable: true,
    draggable: false,
    image: markerImage,
    id: markerID
  })

  let infowindow = new daum.maps.InfoWindow({
    content: content,
    removable: true
  });

  marker.setMap(map);
  circle.setMap(map);

  markers.push(marker);
  markers[markers.length - 1].id = markerID;
  circles.push(circle);
  infowindows.push(infowindow);

  num += 1;
  daum.maps.event.addListener(marker, 'click', () => {
    // 마커 위에 인포윈도우를 표시합니다
    infowindow.open(map, marker);
  });
  daum.maps.event.addListener(marker, 'rightclick', (mouseEvent) => {
    let index = markers.map(x => x.id).indexOf(marker.id);
    removeMarker(index);
    countMarker();
  });
  const removeMarker = (index) => {
    marker.setMap(null);
    circles[index].setMap(null);
    infowindow.close();
    markers.splice(index, 1);
    circles.splice(index, 1);
    infowindows.splice(index, 1);
  }

}

let getGeoData = (level) => {
		$.getJSON('/geo/'+level+'.geojson', function (geojson) {
			var data = geojson.features, geo = {};
			$.each(data, function(idx, region){
				var geometry = region.geometry, properties = region.properties;
				geo[properties.code] = {
						name : properties.name,
						code : properties.code,
						type : geometry.type,
						polygonObj : (geometry.type != 'MultiPolygon') ? makePolygon(geometry.coordinates) : makeMultiPolygon(geometry.coordinates)
				};
			});
		});
}

let makePolygon = function(coordinates){
	var path = [];
	var clat1 = 180.0, clat2 = 0.0, clng1 = 180.0, clng2 = 0.0;
	$.each(coordinates[0], function(seq, coordinate){
		// path 생성
		path.push(new daum.maps.LatLng(coordinate[1], coordinate[0]));
		// Center lat, lng 계산
		clat1 = (coordinate[1] < clat1) ? coordinate[1] : clat1;
		clat2 = (coordinate[1] > clat2) ? coordinate[1] : clat2;
		clng1 = (coordinate[0] < clng1) ? coordinate[0] : clng1;
		clng2 = (coordinate[0] > clng2) ? coordinate[0] : clng2;
	});

	return {
		polygon : new daum.maps.Polygon({
	    	map : map,
	        path: path,
	        strokeWeight: 1,
	        strokeColor: '#004c80',
	        strokeOpacity: 1,
	        fillColor: '#fff',
	        fillOpacity: 0.1
	    }),
		clat : clat1 + ((clat2 - clat1) / 2),
		clng : clng1 + ((clng2 - clng1) / 2)
	};
};

let makeMultiPolygon = function(coordinates){

	var tmp = [], dlat = 0.0;
	var clat1 = 180.0, clat2 = 0.0, clng1 = 180.0, clng2 = 0.0;
	$.each(coordinates, function(seq, coordinate){
		var polygon = makePolygon(coordinate);
		tmp.push(polygon);
	});

	$.each(tmp, function(seq, polygon){
		clat1 = (polygon.clat < clat1) ? polygon.clat : clat1;
		clat2 = (polygon.clat > clat2) ? polygon.clat : clat2;
		clng1 = (polygon.clng < clng1) ? polygon.clng : clng1;
		clng2 = (polygon.clng > clng2) ? polygon.clng : clng2;
		polygons.push(polygon.polygon);
	});

	return {
		polygon : polygons,
		clat : clat1 + ((clat2 - clat1) / 2),
		clng : clng1 + ((clng2 - clng1) / 2)
	};
};


const hidePoly = () =>{
  for(let i in polygons){
    polygons[i].setMap(null);
  }
  polygons = [];
}

$('input[name="addcache"]').change( ()=>{
  if($('input[name="addcache"]').is(':checked')){
    let level = $('input[name="addcache"]:checked')[0].id;
    getGeoData(level);
    console.log($('input[name="addcache"]').is(':checked'));
  }
  else{
    console.log($('input[name="addcache"]').is(':checked'));
    hidePoly()
  }

})

mEvent();
