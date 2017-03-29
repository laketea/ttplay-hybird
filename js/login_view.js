(function(mui, doc, $) {

	mui.init();

	var auths = [];
	
	var pop;

	//创建子页面，首个选项卡页面显示，其它均隐藏；
	mui.plusReady(function() {
		
		

		var settings = app.getSettings();
		var state = app.getState();
		
		bindReg();
		
		document.getElementById('reg-link').addEventListener('tap', function() {
			$('#login-card').hide();
			$('#reg-card').show();
		})
		
		document.getElementById('login-link').addEventListener('tap', function() {
			$('#login-card').show();
			$('#reg-card').hide();
		})

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
			plus.nativeUI.showWaiting();
			for(var i = 0; i < auths.length; i++) {
				if(auths[i].id == type) {
					s = auths[i];
					break;
				}
			}
			if(!s.authResult) {
				pop.close();
				s.login(function(e) {
					authUserInfo(type);
				}, function(e) {
					plus.nativeUI.closeWaiting();
					mui.toast("登录认证失败！");
				});
			} else {
				plus.nativeUI.closeWaiting();
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
				plus.nativeUI.closeWaiting();
				mui.toast("未授权登录！");
			} else {
				s.getUserInfo(function(e) {
					switch(s.id) {
						case 'weixin':
						console.log(JSON.stringify(s));
						//var _turl = 'https://api.weixin.qq.com/sns/userinfo?access_token='+s.authResult.access_token+'&openid='+s.authResult.openid+'&lang=zh_CN';
						//console.log("URL:"+_turl);
						//mui.ajax(_turl,{dataType:'json',type:'get',success:function(res){console.log(JSON.stringify(res));},error:function(err){console.log(JSON.stringify(err));}});
							packData(
								s.userInfo.openid,
								'WEIXIN',
								0,
								s.userInfo.nickname,
								s.userInfo.sex,
								s.userInfo.headimgurl,
								s.userInfo.country,
								s.userInfo.province,
								s.userInfo.city,
								s.userInfo.unionid
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
								'',
								s.userInfo.province,
								s.userInfo.city,
								''
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
								'',
								''
							);
						break;
					}
				}, function(e) {
					plus.nativeUI.closeWaiting();
					mui.toast("获取用户信息失败：" + e.message + " - " + e.code);
				});
			}
		}
		
		//封装API需要的数据，调用
		function packData(openid,type,cid, nickname,sex,avatar,country,province,city,unionid=null) {
			var authLoginInfo = {
				openid:openid,
				type:type,
				cid:cid,
				nickname:nickname,
				sex:sex,
				avatar:avatar,
				country:country,
				province:province,
				city:city,
				unionid:unionid,
			};
			apis.authLogin(authLoginInfo,function(res) {
					res.nickname = res.username;
					app.createState(res.data);
					plus.nativeUI.closeWaiting();
					mui.fire(plus.webview.getLaunchWebview(),"login");
					mui.toast("登陆成功！");
					//authLogout();
			}, function(error) {
					mui.toast("登陆失败！");
					plus.nativeUI.closeWaiting();
					authLogout();
				});
		}

		(function login() {

			pop = new popover('#login-pop');

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