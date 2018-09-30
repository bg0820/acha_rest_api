var log = require('../Log');

module.exports = {

	errorProcessing: function(_error, res, req)
	{
		var errorMsg = '';
		var errorCode = _error;
		switch(_error)
		{
			// 0 ~ 99 중요 에러 코드
			case 0:
				break;
			// 100 ~ 199 글로벌 에러 코드
			case 100:
				errorMsg = '누락된 파라미터 값';
				break;
			case 101:
				errorMsg = '키값 일치하지 않음';
				break;
			case 102:
				errorMsg = '토큰 누락 또는 존재하지 않는 토큰';
				break;
			case 103:
				errorMsg = '토큰 만료 재발급 필요';
				break;
			case 104:
				errorMsg = '올바르지 않은 status 코드';
				break;
			case 105:
				errorMsg = '알림톡 서버 장애';
				break;
			// store/auth/login
			case 200:
				errorMsg = '로그인 실패, 아이디 비밀번호 올바르지 않음';
				break;
			// store/auth/register
			case 300:
				errorMsg = '존재하는 아이디 입니다.';
				break;
			// store/reserv
			case 400:
				errorMsg = '현재 시간, 1시간전 이후로 예약이 가능합니다.';
				break;
			// store/reserv/inquery
			case 500:
				errorMsg = '예약 아이디가 잘못되었습니다.';
				break;
			// store/setting[POST]
			case 600:
				errorMsg = '알림 주기 설정 개수가 너무 많습니다.';
				break;
			// user/reserv/search
			case 700:
				errorMsg = 'phoneNumber 와 kakaoUserKey 에 해당하는 사용자가 존재하지 않음';
				break;
			// user/reserv/match
			case 800:
				errorMsg = '매칭되는 예약정보가 존재하지 않음';
				break;
			case 801:
				errorMsg = 'userId에 해당하는 사용자가 없음';
				break;
			// user/reserv/currentstatus
			case 900:
				errorMsg = '매칭되는 예약정보가 존재하지 않음';
				break;
			case 1000:
				errorMsg = '핸드폰번호가 잘못 되었습니다.';
				break;
			default:
				errorMsg = 'catch 알수 없는 오류 자세한 내용 콘솔 참조';
				errorCode = -1;
				break;
		}

		res.send({ result : 'failed', code: errorCode, msg: errorMsg});

		if(req.body)
			log.error(req.originalUrl, _error, req.body);
		else
			log.error(req.originalUrl, _error, req.query);
	}

}
