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
		window.addEventListener("ajaxLoaded", function() {
			main_loaded_flag = true;
		});
		

		var toMain = function(callback) {
			//使用定时器的原因：
			//可能执行太快，main页面loaded事件尚未触发就执行自定义事件，此时必然会失败
			var id = setInterval(function() {
				if(main_loaded_flag) {
					clearInterval(id);
					$.fire(mainPage, 'show', null);
					mainPage.show("pop-in");
					callback && callback();
				}
			}, 20);
		};

		var cacheState = app.getState();
		//检查 "登录状态/锁屏状态" 开始
//		if(cacheState && cacheState.hasOwnProperty('id')) {
			toMain(closeSplash);
//		} else {
//			closeSplash();
//		}

		function closeSplash() {
			setTimeout(function() {
				plus.navigator.closeSplashscreen();
			}, 600);
		}

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
					autoSho4w: false
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