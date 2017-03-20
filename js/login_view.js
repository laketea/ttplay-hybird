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

					switch(s.id) {
						case 'weixin':
							packData(
								s.userInfo.openid,
								'WEIXIN',
								0,
								s.userInfo.nickname,
								s.userInfo.sex,
								s.userInfo.headimgurl,
								s.userInfo.country,
								s.userInfo.province,
								s.userInfo.city
							);
						break;
						case 'qq':
							var g = 2;
							if(s.userInfo.gender == '男') {
								g = 1;
							}else if(s.userInfo.gender == '女') {
								g = 0;
							}
							packData(
								s.authResult.openid,
								'QQ',
								0,
								s.userInfo.nickname,
								g,
								s.userInfo.figureurl_qq_2,
								s.userInfo.country,
								s.userInfo.province,
								s.userInfo.city
							);
						break;
						case 'sinaweibo':
							packData(
								s.authResult.uid,
								'WEIBO',
								0,
								s.userInfo.name,
								s.userInfo.sex,
								s.userInfo.avatar_large,
								s.userInfo.location,
								'',
								''
							);
						break;
					}

					//console.log(JSON.stringify(s));
					//var josnStr = JSON.stringify(s.userInfo);
					//var jsonObj = s.userInfo;
					//console.log("获取用户信息成功：" + josnStr);
//					showData(type, jsonObj);
					//注销登录
					//authLogout();
				}, function(e) {
					alert("获取用户信息失败：" + e.message + " - " + e.code);
				});
			}
		}
		
		//封装API需要的数据，调用
		function packData(openid,type,cid, nickname,sex,avatar,country,province,city) {
			var authLoginInfo = {
				openid:openid,
				type:type,
				cid:cid,
				nickname:nickname,
				sex:sex,
				avatar:avatar,
				country:country,
				province:province,
				city:city
			};
			console.log('请求数据：'+JSON.stringify(authLoginInfo));
			apis.authLogin(authLoginInfo,function(res) {
					console.log(res.status);
					//res.nickname = res.username;
					//app.createState(res.data);
					//plus.nativeUI.closeWaiting();
					//pop.close();
					//mui.fire(plus.webview.getLaunchWebview(),"login");
				}, function(error) {
					//plus.nativeUI.closeWaiting();
					//pop.close();
					//if(error) {
					//	plus.nativeUI.toast(error.msg);
						//return;
				}
			});
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
					cid: 0,
					ccid: 0
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
					mui.fire(plus.webview.getLaunchWebview(),"login");
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