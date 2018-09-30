function register()
{
	var id = document.getElementById("id").value;
	var pw = document.getElementById("pw").value;
	var pwConfirm = document.getElementById("pwConfirm").value;
	var msg = document.getElementById("msg");
	var resultMsg = document.getElementById("resultMsg");

	if(id.length == 0)
	{
		resultMsg.innerHTML = "<font size=2 color=red>아이디 필드를 입력해주세요.</font>";
		return;
	}

	if(success != 1)
	{
		resultMsg.innerHTML = "<font size=2 color=red>주소를 입력해주세요.</font>";
		return;
	}

	if(pw != pwConfirm)
	{
		msg.innerHTML = "<font size=2 color=red>비밀번호가 일치하지 않습니다.</font>";
		return;
	}

	$.ajax({
	    type: 'POST',
	    cache: false,
	    url: "/store/auth/register",
	    data: {
			   "id": $("#id").val(),
			   "pw": $("#pw").val(),
			   "storeName": $("#storename").val(),
			   "phoneNumber": $("#storePhoneNumber").val(),
			   "ceoPhoneNumber": $("#storeCEOPhoneNumber").val(),
			   "address": _roadFullAddr,
			   "roadAddress": _roadAddr,
			   "detailAddress": _detailAddress,
			   "entX": _entX,
			   "entY": _entY,
			   "registerKey": $("#registerKey").val()
		},
		success : function(data, status, xhr)
		{
		   if(data.result == "success")
		   {
			   alert('회원가입 성공');
			   resultMsg.innerHTML = "<font size=2 color=green>회원가입 성공</font>";
		   }
		   else
			   resultMsg.innerHTML = "<font size=2 color=red>" + data.msg + "</font>";
		}

	});
}
