(function(mui, doc, $) {
	var apis = window.apis,
		app = window.app,
		user = app.getState();

	var endLoading = 0;
	var maxPage = 100;
	var page = 0;
	var sendTitleName = null;
	var enterBtn = doc.querySelector('.detail-enter');
	var joinBtn = doc.querySelector('.detail-join');

	doc.querySelector(".vip-name").innerHTML = user.nickname;
	doc.querySelector(".avatar").src = user.avatar;

	mui.init({
		pullRefresh: {
			container: '#refreshContainer', //待刷新区域标识，querySelector能定位的css选择器均可，比如：id、.class等
			up: {
				height: 50, //可选.默认50.触发上拉加载拖动距离
				auto: false, //可选,默认false.自动上拉加载一次
				contentrefresh: "正在加载...", //可选，正在加载状态时，上拉加载控件上显示的标题内容
				contentnomore: '没有更多数据了', //可选，请求完毕若没有更多数据时显示的提醒内容；
				callback: pullupRefresh
			}
		}
	});

	function pageAjaxDone(isLastPage,isReload) {
		if(isReload && !isLastPage){
			mui('#refreshContainer').pullRefresh() && mui('#refreshContainer').pullRefresh().refresh(true);
		}else{
			mui('#refreshContainer').pullRefresh() && mui('#refreshContainer').pullRefresh().endPullupToRefresh(isLastPage);
		}
	}

	function pullupRefresh() {

		if(maxPage <= page) {
			mui('#refreshContainer').pullRefresh().endPullupToRefresh(true);
			return;
		}
		loadGames(pageAjaxDone, true);

	}

	mui.plusReady(function() {
		var self = plus.webview.currentWebview();
		var game = self.game;
		
		window.addEventListener('reload', function(event) {
			reload(event.detail);
		});
		
		window.addEventListener('reset:user', function(event) {
			user = app.getState();
			doc.querySelector(".vip-name").innerHTML = user.nickname;
			doc.querySelector(".avatar").src = user.avatar;
		});
		
		window.loginView = plus.webview.create('login_view.html','login_view.html',{
			top: '0px',
			bottom: '0px',
			background: 'transparent'
		});
		loginView.hide();
		self.append(loginView);
		
		doc.querySelector('.detail-enter').addEventListener('tap', function() {
			playGame({gid: game.gid || game.id, name: sendTitleName});
		});
		reload(game);
			//显示二维码
		$('#showqrcode').on('tap', function(){
			var mask = mui.createMask( hideQrcode );
			mask.show();
			$('#my-qrcode').show();
		})

		function hideQrcode(){
			$('#my-qrcode').hide();
		}
	});

	function loadGames(ready, isAppend ,isReload) {

		apis.getGames({
			type: 'HOT',
			page: page + 1
		}, function(res) {
			//render game;
			if(!isAppend) {
				$(".hot-game-list").empty();
			}
			renderGameList($(".hot-game-list"), res.lists, isAppend);
			maxPage = Math.ceil(parseInt(res.total || 0) / res.pagesize);
			page = parseInt(res.page);
			var isLastPage = page >= maxPage;
			endLoading++;
			checkEndLoading();
			ready(isLastPage,isReload);
		}, function() {
			endLoading++;
			checkEndLoading()
		});
	}

	function reload(game) {
		page = 0;
		maxPage = 100;
		endLoading = 0;
		var self = plus.webview.currentWebview();
		self.game = game;
		plus.nativeUI.showWaiting();
		
		if(window.loginView) {
			window.loginView.hide();
		}
		
		//获取游戏信息
		apis.getGameDetail(game.gid || game.id, function(res) {
			game = res.data;
			sendTitleName = game.name || game.sname;
			var icon = "http://www.91quyou.cn/Uploads/Game/" + game.icon;
			doc.querySelector(".gameHeader").style.backgroundImage = 'url(' + icon + ')'
			doc.querySelector(".gameHeaderPhoto img").src = icon;
			doc.querySelector(".game-name").innerHTML = game.name || game.sname;
			doc.querySelector('.game-desc').innerHTML = game.des;

			if(game.status === 0) {
				joinBtn.style.display = 'inline';
				enterBtn.style.display = 'none';
			} else {
				joinBtn.style.display = 'none';
				enterBtn.style.display = 'inline';
			}
			endLoading++;
			checkEndLoading();
		}, function() {
			endLoading++;
			checkEndLoading();
		});

		//获取游戏礼包
		apis.getGameGifts({
			gid: game.gid || game.id
		}, function(res) {
			$('.gift-list').empty();
			renderGameGiftList($('.gift-list'), res.lists);
			endLoading++;
			checkEndLoading()
		});

		loadGames(pageAjaxDone, false,true);

	}

	function checkEndLoading() {
		if(endLoading == 2) {
			plus.nativeUI.closeWaiting();
		}
	}

}(mui, document, $));