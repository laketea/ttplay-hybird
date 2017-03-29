(function(mui, doc, $) {
	var apis = window.apis,
		app = window.app;

	var page = 0;
	var maxPage = 100;
	var firstLoad = true;

	var user = app.getState();
	var userNameBox = doc.querySelector(".vip-name");
	var avatarBox = doc.querySelector(".avatar");
	var idBox = doc.querySelector(".user-id .value");

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
				contentnomore: '', //可选，请求完毕若没有更多数据时显示的提醒内容；
				callback: pullupRefresh
			}
		}
	});

	function pulldownRefresh() {
		page = 0;
		maxPage = 100;
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
		if(maxPage <= page) {
			mui('#refreshContainer').pullRefresh().endPullupToRefresh(true);
			return;
		}
		load(ready, true);

		function ready(isLastPage) {
			mui('#refreshContainer').pullRefresh().endPullupToRefresh(isLastPage);
		}
	}

	function load(ready, isAppend) {
		firstLoad && plus.nativeUI.showWaiting();
		apis.getPlayedGames({
			mid: user.id,
			page: page + 1
		}, function(res) {
			renderGameList($(".games-list-content"), res.lists, isAppend, true, true);
			maxPage = Math.ceil(parseInt(res.total || 0) / res.pagesize);
			page = parseInt(res.page);
			var isLastPage = page >= maxPage;
			firstLoad && plus.nativeUI.closeWaiting();
			ready(isLastPage);
		}, function() {
			firstLoad && plus.nativeUI.closeWaiting();
			ready();
		});
	}
	
	function renderHeader() {
		user = app.getState();
		userNameBox.innerHTML = ("昵称：" + user.nickname);
		idBox.innerHTML = user.id;
		avatarBox.src = user.avatar;
		
	}

	mui.plusReady(function() {

		renderHeader();
		
		window.addEventListener('reset:user', function(){
			renderHeader();
			if(user.id){
				pulldownRefresh();
			}
		});

		doc.querySelector('.btnLogout').addEventListener('tap', function() {
			mui.confirm('是否确认退出？', '提示', ['确定', '取消'], function(res) {
				if(res.index == 0) {
					app.clearState();
					mui.fire(plus.webview.getLaunchWebview(),"logout");
				}
			}, 'div');
		});
		pulldownRefresh();

	});

}(mui, document, $));