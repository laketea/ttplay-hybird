(function(mui, doc, $) {
	var apis = window.apis,
		app = window.app,
		user = app.getState(),
		type = '';

	var userNameBox = doc.querySelector(".vip-name");
	var avatarBox = doc.querySelector(".avatar");
	var muiSliderGroupBox = doc.querySelector('.mui-slider-group');
	var gameListTitle = doc.querySelector('.games-list-title');
	var firstLoad = true;

	var pageCache = {
		'HOT': 0,
		'PUTAWAY': 0,
		'OPENING': 0
	};

	var maxPageCache = {
		'GIFT': 100,
		'TODAY': 100,
		'LASTWEEK': 100
	};

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

	//下拉刷新
	function pulldownRefresh() {
		var readyNum = 0;
		pageCache = {
			'HOT': 0,
			'PUTAWAY': 0,
			'OPENING': 0
		};
		maxPageCache = {
			'GIFT': 100,
			'TODAY': 100,
			'LASTWEEK': 100
		};
		loadSliders(checkReady);
		//如果用户未登录，则不获取最近玩的数据
		if(user.id){
		    loadLastGame(checkReady);
		}else{
			setTimeout(function(){
				checkReady();
			$('#lastPlayedRegion').hide();
			});
			
		}
		
		loadGame({
			isAppend: false,
			checkReady: checkReady
		});

		function checkReady(isLastPage) {
			var loginPage;
			readyNum++;
			if(readyNum == 3) {
				mui('#refreshContainer').pullRefresh().endPulldownToRefresh();
				if(firstLoad){
					//给mainPage发送页面ajax获取成功的消息
					loginPage = plus.webview.getLaunchWebview();
					mui.fire(loginPage,'ajaxLoaded');
				}
				firstLoad = false;
			}
			if(isLastPage) {
				mui('#refreshContainer').pullRefresh().endPullupToRefresh(isLastPage);
			}else{
				mui('#refreshContainer').pullRefresh().refresh(true);
			}
		}
	}

	//上拉加载
	function pullupRefresh() {
		if(maxPageCache[type] <= pageCache[type]) {
			mui('#refreshContainer').pullRefresh().endPullupToRefresh(true);
			return;
		}
		loadGame({
			isAppend: true,
			checkReady: checkReady
		});

		function checkReady(isLastPage) {
			mui('#refreshContainer').pullRefresh().endPullupToRefresh(isLastPage);
		}
	}

	function loadSliders(checkReady) {
		// slider
		apis.getSliders(function(res) {
			var sliders = res.lists;
			muiSliderGroupBox.innerHTML = '';
			addSliderItem(sliders[sliders.length - 1], true);
			mui.each(sliders, function(index, game) {
				addSliderItem(game)
			});
			addSliderItem(sliders[0], true);

			mui('.mui-slider').slider({
				interval: 15000 //自动轮播周期，若为0则不自动播放，默认为0；
			});

			checkReady();

			function addSliderItem(game, isDuplicate) {
				var item = doc.createElement("div");
				var link = doc.createElement("a");
				var image = new Image();
				image.src = 'http://www.91quyou.cn/' + game.thumb;
				item.setAttribute("class", "mui-slider-item  " + (isDuplicate ? 'mui-slider-item-duplicate' : ''));
				muiSliderGroupBox.appendChild(item);
				item.appendChild(link);
				link.appendChild(image);
				link.addEventListener("tap", function() {
					toGameDetail({
						gid: game.gid
					});
				});
			}

		}, function() {
			checkReady();
		});
	}

	//最近在玩
	function loadLastGame(checkReady) {
		apis.getPlayedGames({
			mid: user.id
		}, function(res) {
			if(res.lists && res.lists.length){
				$('#lastPlayedRegion').show();
			}else{
				$('#lastPlayedRegion').hide();
			}
			renderLastGames($('.recent-games-list'), res.lists);
			checkReady();
		}, function() {
			checkReady();
		});
	};

	function loadGame(options) {
		type = type || 'HOT';
		var recently = type == 'OPENING';
//		firstLoad && plus.nativeUI.showWaiting();
		//资讯的页面
		if( type == 'INFOR'){
			apis.getNews({
			/*	type:type,
				page:pageCache[type]+1*/
			},function(res){
				alert(1)
			},function(e){
				alert(2)
				options.checkReady();
			});
		}else{
			apis.getGames({
				type: type,
				page: pageCache[type]+1
			}, function(res) {
				renderGameList($(".games-list-content"), res.lists, options.isAppend, recently);
				maxPageCache[type] = Math.ceil(parseInt(res.total || 0) / res.pagesize);
				pageCache[type] = parseInt(res.page);
				var isLastPage = pageCache[type] >= maxPageCache[type];
	//			firstLoad && plus.nativeUI.closeWaiting();
				options.checkReady(isLastPage);
			}, function() {
	//			firstLoad && plus.nativeUI.closeWaiting();
				options.checkReady();
			});			
		}

	}
	
	function renderHeader(){
		user = app.getState()
		userNameBox.innerHTML = user.nickname;
		avatarBox.src = user.avatar;
	}

	mui.plusReady(function() {

		renderHeader();
		
		window.addEventListener('reset:user', function(){
			renderHeader();
			pulldownRefresh();
		});

		pulldownRefresh();

		//获取游戏
		mui(".user-tab-bar").on('tap', '.user-game-tab', function(event) {
			type = this.getAttribute("data-type");
			gameListTitle.innerHTML = {
				'HOT': '热门推荐',
				'PUTAWAY': '最新上架',
				'OPENING': '最新开服',
				'INFOR':'最新资讯'
			}[type];
			removeClass(doc.querySelector('.active'), 'active');
			addClass(this, 'active');
			mui('#refreshContainer').pullRefresh().refresh(true);
			firstLoad = true;
			pulldownRefresh();
		});
		//显示二维码
		$('#openPopover').on('tap', function(){
			var mask = mui.createMask( hideQrcode );
			mask.show();
			$('#my-qrcode').show();
		})
		function hideQrcode(){
			$('#my-qrcode').hide();
		}
		//资讯
/*		doc.querySelector(".tab-last-infor").addEventListener('tap', function() {
			mui.alert("正在建设中...");
		});*/
	});

}(mui, document, $));