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


function target_minus(target, price) {
	if(target)
	{
		var doc = Number(target.innerText);

		var totalPrice = Number($('#totalPriceStr').text().split('원')[0]);

		if(doc >= 1)
		{
			target.textContent = doc - 1;
			$('#totalPriceStr').text((totalPrice - price) + '원');
		}
	}
}

function target_plus(target, price) {
	if(target)
	{
		var doc = Number(target.innerText);
		target.textContent = doc + 1;

		var totalPrice = Number($('#totalPriceStr').text().split('원')[0]);

		$('#totalPriceStr').text((totalPrice + price) + '원');
	}
}


$(document).ready(function() {
	var minus = $('.amount_select .minus');
	var plus = $('.amount_select .plus');

	minus.click(function() {
		var idx = minus.index(this);
		var priceElem = $('.amount .price_str')[idx];
		var target = $('.amount_select .amount_num_str')[idx];
		target_minus(target, Number(priceElem.innerText.replace(/,/, '').split('원')[0]));
	});

	plus.click(function() {
		var idx = plus.index(this);
		var priceElem = $('.amount .price_str')[idx];
		var target = $('.amount_select .amount_num_str')[idx];
		target_plus(target, Number(priceElem.innerText.replace(/,/, '').split('원')[0]));
	});
});
