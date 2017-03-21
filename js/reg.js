(function(mui, doc) {
	var apis = window.apis,
		app = window.app;

	window.bindReg = function() {

		var toLogin = function() {
			$(".custom-login-box").show();
			$('#login-card').show();
			$('#reg-card').hide();
		};

		var regButton = doc.getElementById('reg-btn');
		var usernameBox = doc.getElementById('username_reg');
		var passwordBox = doc.getElementById('password_reg');
		
		var repeatPasswordBox = doc.getElementById('repeatpassword_reg');
		var authCodeBox = doc.getElementById("authcode_reg");
		var repeatPasswordRowBox = doc.getElementById("repeat-password-row");
		var authCodeRowBox = doc.getElementById("auth-code-row");
		var mobileReg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$/;
		
		usernameBox.addEventListener("blur", function() {
			var userName = usernameBox.value;
			if(userName && mobileReg.test(userName)) {
				
				authCodeRowBox.style.display = 'block';
				repeatPasswordRowBox.style.display = 'none';
			} else {
				authCodeRowBox.style.display = 'none';
				repeatPasswordRowBox.style.display = 'block';
			}
		})

		regButton.addEventListener("tap", function() {
			var regInfo = {
				username: usernameBox.value,
				password: passwordBox.value,
				cid: 1,
				ccid: 2,
				mobile: 0,
				authCode: authCodeBox.value
			};

			if(regInfo.username.length < 6 || regInfo.username.length > 20) {
				plus.nativeUI.toast("用户名为6-20位");
				return;
			}

			if(mobileReg.test(regInfo.username)) {
				regInfo.mobile = regInfo.username
			} else {
				regInfo.mobile = 0;
			}

			if(regInfo.password.length < 6) {
				plus.nativeUI.toast("密码不能小于6位");
				return;
			}

			if(!mobileReg.test(regInfo.username) && regInfo.password !== repeatPasswordBox.value) {
				plus.nativeUI.toast("两次输入密码不一致");
				return;
			}

			apis.reg(regInfo, function() {
				mui.alert("注册成功，请登录!", "恭喜", "确定", function() {
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
			var mobile = usernameBox.value;
			if(!mobile || !mobileReg.test(mobile)) {
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
	};

}(mui, document));