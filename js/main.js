(function($, doc) {

	mui.init();
	var subpages = ['index.html', 'gift.html', 'community.html', 'user.html'];
	var subpage_style = {
		top: '0px',
		bottom: '51px'
	};

	var aniShow = {};
	var loginView;

	//创建子页面，首个选项卡页面显示，其它均隐藏；
	mui.plusReady(function() {

		var self = plus.webview.currentWebview();

		window.addEventListener('show', function(event) {
			mui.trigger(document.getElementById("defaultTab"), 'tap');
		});
		
		//退出登陆时候，给个子页面发送reset消息
		window.addEventListener('logout', function(event) {
			mui.fire(plus.webview.getWebviewById('index_sub.html'),'reset:user');
			mui.fire(plus.webview.getWebviewById('gift_sub.html'),'reset:user');
			mui.fire(plus.webview.getWebviewById('user_sub.html'),'reset:user');
			mui.trigger(document.getElementById("defaultTab"), 'tap');
		});
		
		window.addEventListener('login', function(event) {
			mui.fire(plus.webview.getWebviewById('index_sub.html'),'reset:user');
			mui.fire(plus.webview.getWebviewById('gift_sub.html'),'reset:user');
			mui.fire(plus.webview.getWebviewById('user_sub.html'),'reset:user');
			if(plus.webview.getWebviewById('game.html')){
				mui.fire(plus.webview.getWebviewById('game.html'),'reset:user');
			}
		});
		
		window.addEventListener('showLogin', function(){
			loginView.show();
			mui.fire(loginView,"showLogin");
		});
		for(var i = 0; i < 4; i++) {
			var temp = {};
			var sub = plus.webview.create(subpages[i], subpages[i], subpage_style);
			if(i > 0) {
				sub.hide();
			} else {
				temp[subpages[i]] = "true";
				mui.extend(aniShow, temp);
			}
			self.append(sub);
		}
		
		loginView = plus.webview.create('login_view.html','login_view.html',{
			top: '0px',
			bottom: '0px',
			background: 'transparent'
		});
		loginView.hide();
		self.append(loginView);
		

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
	//当前激活选项
	var activeTab = subpages[0];
	var title = document.getElementById("title");
//	var pop = new popover('#login-pop');
	
	//选项卡点击事件
	mui('.mui-bar-tab').on('tap', 'a', function(e) {
		var targetTab = this.getAttribute('href');
		plus.webview.close("game.html");
		if(targetTab == 'community.html') {
			mui.openWindowWithTitle({
			    url:'https://buluo.qq.com/mobile/barindex.html?_bid=128&_wv=1027&bid=365166',
			    id:'community'
			},{
			    title:{//标题配置
			        text:"社区",//标题文字
			    },
			    back:{//左上角返回箭头
			        image:{
			            base64Data:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAb1BMVEUAAAAAev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8AAACubimgAAAAI3RSTlMAGfUTGfQTGPMSGPIYGhgaGBsXGxcbFxwXHBccFhwWHRYdHWufDPQAAAABYktHRACIBR1IAAAAB3RJTUUH4QETEBwooeTlkQAAAJVJREFUSMft1EkSgkAQRNFGUXFWHBDBibr/HTUwD5B/48Ig1y+io7u6MqUhf5hsNEY+j5hMgZ/FJ8Xc9ovos3T96utjbfqN/Nb0O/m96Uv5g+mP8ifTn+Ur01/ka9Nf5RvTt/I309/lH6Z/yr9Mn+Q71/MT8B34K/E58Enzv8R/K98HvnF8p3lr8F7izce7lbf3kJ/lDQp9HdBhgg3PAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDE3LTAxLTE5VDE2OjI4OjQwKzA4OjAwpTDFwQAAACV0RVh0ZGF0ZTptb2RpZnkAMjAxNy0wMS0xOVQxNjoyODo0MCswODowMNRtfX0AAAAASUVORK5CYII='
			        },
			        click:function(){
			        	var NW = plus.webview.getWebviewById('community');
			        	NW.canBack(function(event) {
						    var canBack = event.canBack;
						    if(canBack) {
						        NW.back();
						    } else {
						        NW.hide();
						    }
						});
			        }
			    }
			})	
			return;
		}
		if(targetTab == 'user.html' && !app.isLogged()){
			loginView.show();
			mui.fire(loginView,"showLogin");
			return;
		}else{
//			loginView.hide();
//			mui.fire(loginView,"hideLogin");
		}
		
		if(targetTab == activeTab) {
			return;
		}

		//显示目标选项卡
		//若为iOS平台或非首次显示，则直接显示
		if(mui.os.ios || aniShow[targetTab]) {
			plus.webview.show(targetTab);
		} else {
			//否则，使用fade-in动画，且保存变量
			var temp = {};
			temp[targetTab] = "true";
			mui.extend(aniShow, temp);
			plus.webview.show(targetTab, "fade-in", 300);
		}
		//隐藏当前;
		plus.webview.hide(activeTab);
		//更改当前活跃的选项卡
		activeTab = targetTab;
	});
	//自定义事件，模拟点击“首页选项卡”
	mui('.mui-bar-tab').on('tap', '.mui-tab-item', function(){
		if(this.getAttribute('href') === 'community.html') return;
		var tabs = document.getElementsByClassName('mui-tab-item');
		for(  var i=0, l=tabs.length; i<l; i++){
			tabs[i].classList.remove('mui-actives')
		}
		this.classList.add('mui-actives');
	})
	document.addEventListener('gohome', function() {
		var defaultTab = document.getElementById("defaultTab");
		//模拟首页点击
		mui.trigger(defaultTab, 'tap');
		//切换选项卡高亮
		var current = document.querySelector(".mui-bar-tab>.mui-tab-item.mui-actives");
		if(defaultTab !== current) {
			current.classList.remove('mui-actives');
			defaultTab.classList.add('mui-actives');
		}
	});
}(mui, document));