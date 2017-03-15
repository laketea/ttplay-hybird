(function(mui, doc, $) {
	var apis = window.apis,
		app = window.app,
		type = 'GIFT',
		firstLoad = true;

	var pageCache = {
		'GIFT': 0,
		'TODAY': 0,
		'LASTWEEK': 0
	}

	var maxPageCache = {
		'GIFT': 100,
		'TODAY': 100,
		'LASTWEEK': 100
	};

	var user = app.getState();
	var userNameBox = doc.querySelector(".vip-name");
	var avatarBox = doc.querySelector(".avatar");
	var muiSliderGroupBox = doc.querySelector('.mui-slider-group');
	var gameListTitle = doc.querySelector('.games-list-title');

	mui.init({
		pullRefresh: {
			container: '#refreshContainer', //待刷新区域标识，querySelector能定位的css选择器均可，比如：id、.class等
			down: {
				callback: pulldownRefresh
			},
			up: {
				height: 50, //可选.默认50.触发上拉加载拖动距离
				auto: false, //可选,默认false.自动上拉加载一次
				contentrefresh: "正在加载...", //可选，正在加载状态时，上拉加载控件上显示的标题内容
				contentnomore: '没有更多数据了', //可选，请求完毕若没有更多数据时显示的提醒内容；
				callback: pullupRefresh
			}
		}
	});

	function pulldownRefresh() {
		pageCache = {
			'GIFT': 0,
			'TODAY': 0,
			'LASTWEEK': 0
		};
		maxPageCache = {
			'GIFT': 100,
			'TODAY': 100,
			'LASTWEEK': 100
		};
		load(ready, false);

		function ready(isLastPage) {
			firstLoad = false;
			mui('#refreshContainer').pullRefresh() && mui('#refreshContainer').pullRefresh().endPulldownToRefresh();
			if(isLastPage) {
				mui('#refreshContainer').pullRefresh().endPullupToRefresh(isLastPage);
			}else{
				mui('#refreshContainer').pullRefresh().refresh(true);
			}
		}
	}

	function pullupRefresh() {
		if(maxPageCache[type] <= pageCache[type]) {
			mui('#refreshContainer').pullRefresh().endPullupToRefresh(true);
			return;
		}
		load(ready, true);

		function ready(isLastPage) {
			mui('#refreshContainer').pullRefresh().endPullupToRefresh(isLastPage);
		}
	}

	function load(ready, isAppend) {
		if(type == 'GIFT') {
			loadGift(ready, isAppend);
		} else {
			loadGame(ready, isAppend);
		}
	}

	function loadGame(ready, isAppend) {
		firstLoad && plus.nativeUI.showWaiting();
		apis.getGames({
			type: type,
			page: pageCache[type]+1
		}, function(res) {
			renderGameList($(".games-list-content"), res.lists, isAppend, true);
			maxPageCache[type] = Math.ceil(parseInt(res.total || 0) / res.pagesize);
			pageCache[type] =parseInt(res.page);
			var isLastPage = pageCache[type] >= maxPageCache[type];
			firstLoad && plus.nativeUI.closeWaiting();
			ready(isLastPage);
		}, function() {
			firstLoad && plus.nativeUI.closeWaiting();
			ready();
		});
	}

	function loadGift(ready, isAppend) {
		firstLoad && plus.nativeUI.showWaiting();
		apis.getGifts({
			page: pageCache[type]+1
		},function(res) {
			renderGiftList($('.games-list-content'), res.lists, isAppend);
			maxPageCache[type] = Math.ceil(parseInt(res.total || 0) / res.pagesize);
			pageCache[type] =parseInt(res.page);
			var isLastPage = pageCache[type] >= maxPageCache[type];
			firstLoad && plus.nativeUI.closeWaiting();
			ready(isLastPage);
		}, function() {
			firstLoad && plus.nativeUI.closeWaiting();
			ready();
		});
	}
	
	function renderHeader() {
		user = app.getState();
		userNameBox.innerHTML = user.nickname;
		avatarBox.src = user.avatar;
	}

	mui.plusReady(function() {

		renderHeader();
		
		window.addEventListener('reset:user', function(){
			renderHeader();
		});
		//获取游戏
		mui(".user-tab-bar").on('tap', '.user-tab', function(event) {
			type = this.getAttribute("data-type");
			removeClass(doc.querySelector('.active'), 'active');
			addClass(this, 'active');
			mui('#refreshContainer').pullRefresh().refresh(true);
			firstLoad = true;
			pulldownRefresh();
		});

		pulldownRefresh();
	});

}(mui, document, $));