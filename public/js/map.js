var getParameters = function (paramName) {
	var url = location.href;
	// ? 기준으로 나눈후 & split
	var parameters = (url.slice(url.indexOf('?') + 1, url.length)).split('&');

	// 나누어진 값의 비교를 통해 paramName 으로 요청된 데이터의 값만 return
	for (var i = 0; i < parameters.length; i++) {
		var varName = parameters[i].split('=')[0];

		if (varName.toUpperCase() == paramName.toUpperCase())
			return decodeURIComponent(parameters[i].split('=')[1]);
	}
};

function showMap() {
	var mapOptions = {
	    scaleControl: false,
	    logoControl: false,
	    mapDataControl: false,
	    zoomControl: true
	};

	var map = new naver.maps.Map('map', mapOptions);
	var myaddress = getParameters('addr');// 도로명 주소나 지번 주소만 가능 (건물명 불가!!!!)

	var _storeName = getParameters('storeName');
	var _detailAddress = getParameters('detailAddress');

	naver.maps.Service.geocode({address: myaddress}, function(status, response) {
		if (status !== naver.maps.Service.Status.OK) {
			return alert(myaddress + '의 검색 결과가 없거나 기타 네트워크 에러');
		}
		var result = response.result;

		var myaddr = new naver.maps.Point(result.items[0].point.x, result.items[0].point.y);
		map.setCenter(myaddr); // 검색된 좌표로 지도 이동
		// 마커 표시
		var marker = new naver.maps.Marker({
			position: myaddr,
			map: map
		});
		// 마커 클릭 이벤트 처리
		naver.maps.Event.addListener(marker, "click", function(e) {
			if (infowindow.getMap()) {
				infowindow.close();
			} else {
				infowindow.open(map, marker);
			}
		});
		// 마크 클릭시 인포윈도우 오픈
		var infowindow = new naver.maps.InfoWindow({
			content: '<div class=\"info\"><h4>' + _storeName + '</h4><div class=\"addr\">'+ myaddress + '</br>' + _detailAddress + '</div><img class=\"storeImg\" src=\"http://acha.io:3000/static/img/store.jpg\"></div>'
		});
	});
}
