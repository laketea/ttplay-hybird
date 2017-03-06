(function(mui, doc, $) {

	mui.init();

	var auths = [];

	//创建子页面，首个选项卡页面显示，其它均隐藏；
	mui.plusReady(function() {

		var settings = app.getSettings();
		var state = app.getState();

		plus.oauth.getServices(function(services) {
			auths = services;
		}, function(e) {
			alert("获取登录服务列表失败：" + e.message + " - " + e.code);
		});

		document.getElementById('weixin').addEventListener('tap', function() {
			console.log("微信");
			authLogin('weixin');
		})
		document.getElementById('qq').addEventListener('tap', function() {
			console.log("QQ");
			authLogin('qq');
		})
		document.getElementById('sinaweibo').addEventListener('tap', function() {
			console.log("微博");
			authLogin('sinaweibo');
		})

		// 登录操作
		function authLogin(type) {
			var s;
			for(var i = 0; i < auths.length; i++) {
				if(auths[i].id == type) {
					s = auths[i];
					break;
				}
			}
			if(!s.authResult) {
				s.login(function(e) {
					mui.toast("登录认证成功！");
					authUserInfo(type);
				}, function(e) {
					mui.toast("登录认证失败！");
				});
			} else {
				mui.toast("已经登录认证！");
			}
		}
		//注销
		function authLogout() {
			for(var i in auths) {
				var s = auths[i];
				if(s.authResult) {
					s.logout(function(e) {
						console.log("注销登录认证成功！");
					}, function(e) {
						console.log("注销登录认证失败！");
					});
				}
			}
		}
		// 微信登录认证信息
		function authUserInfo(type) {
			var s;
			for(var i = 0; i < auths.length; i++) {
				if(auths[i].id == type) {
					s = auths[i];
					break;
				}
			}
			if(!s.authResult) {
				mui.toast("未授权登录！");
			} else {
				s.getUserInfo(function(e) {
					var josnStr = JSON.stringify(s.userInfo);
					var jsonObj = s.userInfo;
					console.log("获取用户信息成功：" + josnStr);
//					showData(type, jsonObj);
					authLogout();
				}, function(e) {
					alert("获取用户信息失败：" + e.message + " - " + e.code);
				});
			}
		}
		// 显示用户头像信息
//		function showData(type, data) {
//			switch(type) {
//				case 'weixin':
//					headImage.src = data.headimgurl;
//					break;
//				case 'qq':
//					headImage.src = data.figureurl_qq_2;
//					break;
//				case 'sinaweibo':
//					headImage.src = data.avatar_large;
//					break;
//				default:
//					break;
//			}
//		}

		(function login() {

			var pop = new popover('#login-pop');

			window.openLogin = function() {
				pop.open();
			}

			window.closeLogin = function() {
				pop.close();
			}

			window.addEventListener('showLogin', function() {
				window.openLogin();
			});

			window.addEventListener('hideLogin', function() {
				window.closeLogin();
			});

			document.getElementById("tagYgLogin").addEventListener('tap', function() {
				$(".custom-login-box").toggle();
			});

			pop.open();

			var doc = document;

			//检查 "登录状态/锁屏状态" 结束
			var loginButton = doc.getElementById('login');
			var accountBox = doc.getElementById('account');
			var passwordBox = doc.getElementById('password');
			//	var autoLoginButton = doc.getElementById("autoLogin");
			//	var regButton = doc.getElementById('reg');
			//	var forgetButton = doc.getElementById('forgetPassword');
			loginButton.addEventListener('tap', function(event) {
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
				plus.nativeUI.showWaiting();
				apis.login(loginInfo, function(res) {
					res.nickname = res.username;
					app.createState(res.data);
					plus.nativeUI.closeWaiting();
					pop.close();
				}, function(error) {
					plus.nativeUI.closeWaiting();
					pop.close();
					if(error) {
						plus.nativeUI.toast(error.msg);
						return;
					}
				});
			});

		})();

	});

}(mui, document, $));