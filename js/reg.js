(function($, doc) {
	var apis = window.apis,
		app = window.app;

	$.plusReady(function() {

		var loginPage = $.preload({
			"id": 'login',
			"url": 'login.html'
		});
		var toLogin = function() {
			var id = setInterval(function() {
				clearInterval(id);
				$.fire(loginPage, 'show', null);
				loginPage.show("pop-in");
			}, 20);
		};

		var regButton = doc.getElementById('reg');
		var usernameBox = doc.getElementById('username');
		var passwordBox = doc.getElementById('password');
		var repeatPasswordBox = doc.getElementById('repeatpassword');
		var mobileBox = doc.getElementById("mobile");
		var authCodeBox = doc.getElementById("authCode");
		var mobileReg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$/;

		regButton.addEventListener("tap", function() {
			var regInfo = {
				username: usernameBox.value,
				password: passwordBox.value,
				mobile: mobileBox.value,
				authCode: authCodeBox.value,
				cid: 1,
				ccid: 2
			};

			if(regInfo.username.length < 6 || regInfo.username.length > 20) {
				plus.nativeUI.toast("用户名为6-20位");
				return;
			}

			if(!regInfo.mobile || !mobileReg.test(regInfo.mobile)) {
				plus.nativeUI.toast("手机号格式错误");
				return;
			}

			if(regInfo.password.length < 6) {
				plus.nativeUI.toast("密码不能小于6位");
				return;
			}

			if(regInfo.password !== repeatPasswordBox.value) {
				plus.nativeUI.toast("两次输入密码不一致");
				return;
			}

			apis.reg(regInfo, function() {
				$.alert("注册成功，请登录!", "恭喜", "确定", function() {
					toLogin();
				});
			}, function(error) {
				plus.nativeUI.toast(error.msg);
			});

		});

		var captchBtn = doc.getElementById('captch-label'),
			waitBtn = doc.getElementById('wait-label'),
			seconds = doc.getElementById('seconds');
		var remainSeconds = 60,
			timeId = null;

		captchBtn.addEventListener('tap', function() {
			var mobile = mobileBox.value;
			if(!mobile || !mobileReg.test(mobile)){
				plus.nativeUI.toast("手机号格式错误");
				return;
			}
			apis.captch(function() {
				plus.nativeUI.toast("发送成功");
			}, function(error) {
				plus.nativeUI.toast(error.msg || '发送失败');
			});
			seconds.innerHTML = remainSeconds;
			captchBtn.style.display = 'none';
			waitBtn.style.display = 'block';
			timeId = setInterval(function() {
				remainSeconds--;
				seconds.innerHTML = remainSeconds;
				if(remainSeconds == 0) {
					remainSeconds = 60;
					captchBtn.style.display = 'block';
					waitBtn.style.display = 'none';
					clearInterval(timeId);
				}
			}, 1000);
		});
	})

}(mui, document));