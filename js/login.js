(function($, doc) {
	var app = window.app;
	$.plusReady(function() {
		plus.screen.lockOrientation("portrait-primary");
		var settings = app.getSettings();
		var state = app.getState();
		var mainPage = $.preload({
			"id": 'main',
			"url": 'main.html'
		});
		var main_loaded_flag = false;
		mainPage.addEventListener("loaded", function() {
			main_loaded_flag = true;
		});
		var toMain = function() {
			//使用定时器的原因：
			//可能执行太快，main页面loaded事件尚未触发就执行自定义事件，此时必然会失败
			var id = setInterval(function() {
				if(main_loaded_flag) {
					clearInterval(id);
					$.fire(mainPage, 'show', null);
					mainPage.show("pop-in");
				}
			}, 20);
		};

		//		toMain();
		//检查 "登录状态/锁屏状态" 开始
		if(settings.autoLogin && state.token) {
			toMain();
		} else {}
		// close splash
		setTimeout(function() {
			//关闭 splash
			plus.navigator.closeSplashscreen();
		}, 600);
		//检查 "登录状态/锁屏状态" 结束
		var loginButton = doc.getElementById('login');
		var accountBox = doc.getElementById('account');
		var passwordBox = doc.getElementById('password');
		var autoLoginButton = doc.getElementById("autoLogin");
		var regButton = doc.getElementById('reg');
		var forgetButton = doc.getElementById('forgetPassword');
		loginButton.addEventListener('click', function(event) {
			var loginInfo = {
				username: accountBox.value,
				password: passwordBox.value,
				cid: 1,
				ccid: 2
			};
			if(loginInfo.username.length < 5) {
				return plus.nativeUI.toast('账号最短为 5 个字符');
			}
			if(loginInfo.password.length < 6) {
				return plus.nativeUI.toast('密码最短为 6 个字符');
			}
			apis.login(loginInfo, function(res) {
				app.createState(res.data);
				toMain();
			}, function(error) {
				if(error) {
					plus.nativeUI.toast(error.msg);
					return;
				}
			});
		});
		//		$.enterfocus('#login-form input', function() {
		//			$.trigger(loginButton, 'tap');
		//		});
		autoLoginButton.classList[settings.autoLogin ? 'add' : 'remove']('mui-active')
		autoLoginButton.addEventListener('toggle', function(event) {
			setTimeout(function() {
				var isActive = event.detail.isActive;
				settings.autoLogin = isActive;
				app.setSettings(settings);
			}, 50);
		}, false);
		regButton.addEventListener('tap', function(event) {
			$.openWindow({
				url: 'reg.html',
				id: 'reg',
				preload: true,
				show: {
					aniShow: 'pop-in'
				},
				styles: {
					popGesture: 'hide'
				},
				waiting: {
					autoShow: false
				}
			});
		}, false);
		
		var backButtonPress = 0;
		$.back = function(event) {
			backButtonPress++;
			if(backButtonPress > 1) {
				plus.runtime.quit();
			} else {
				plus.nativeUI.toast('再按一次退出应用');
			}
			setTimeout(function() {
				backButtonPress = 0;
			}, 1000);
			return false;
		};
		
	
	});

}(mui, document));