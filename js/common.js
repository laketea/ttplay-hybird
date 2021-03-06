var iconHost = "http://www.91quyou.cn/Uploads/Game/";

function renderGameItem(item, recently, isMyGames) {
	var html = [],
		$item,
		now = Date.now();
	item.tags = item.tags || '';
	html.push('<div class="media game-list-item">');
	html.push('<div class="media-left media-middle" data-gameid="' + item.id + '" style="position:relative;">');
	html.push('<img style="border-radius:15px;border:none;" class="media-object game-icon" src="http://www.91quyou.cn/Uploads/Game/' + item.icon + '" />')
	html.push('</div>');
	html.push('<div class="media-body" data-gameid="' + item.icon + '">');
	if(recently) {
		if(isMyGames) {
			item.sname = "最近登陆" + getDateTime(item.lasttime * 1000).date;
		}
		html.push('<p class="game-title">');
		html.push(item.name || item.gname);
		html.push('</p>');
		html.push('<p class="game-load"><span>' +
			item.sname + '</span></p>');
	} else {
		html.push('<p class="game-title">');
		html.push(item.name || item.gname);
		if(item.tags.indexOf('RM') > -1) {
			html.push('<span class="hot">热</span>');
		}
		if(item.tags.indexOf('TJ') > -1) {
			html.push('<span class="recommend">荐</span>');
		}
		html.push('</p>');
		html.push('<p class="game-desc" id="texts" style="height:2.8em;">');
		html.push(item.des);
		html.push('</p>')
	}

	html.push('</div>')
	html.push('<div class="media-right media-middle">');

	var startTime = (item.startime || 0) * 1000;
	if(!recently || (recently && startTime <= now) || isMyGames) {
		if(item.status == 0) {
			html.push('<a style="background-color: #ddd;" class="game-enter-button" href="javascript:void(0);" role="button" external="true">正在接入</a>');
		} else {
			html.push('<a class="game-enter-button" ready="true"  href="javascript:void(0);" role="button" external="true">进 入</a>')
		}
		if(recently) {
			html.push('<div class="opened-time" style="padding-top:1rem;font-size:.3rem;white-space:nowrap;color:#a1a1a1;">已开服' + getDateDiff(startTime, now) + '</div>'); //已开服
		}
	} else {
		var datetime = getDateTime(startTime);
		//显示开服时间
		html.push('<div class="regular-time"><p>' + datetime.date + '</p><p>' + datetime.time + '</p></div>');
	}

	html.push('</div></div>');
	$item = $(html.join(""));
	$item.on('tap', function(e) {
		e.stopPropagation();
		toGameDetail(item);
	});
	$item.find('.game-enter-button').on('tap', function(e) {
		e.stopPropagation();
		if(this.getAttribute("ready")) {
			playGame(item);
		} else {
			mui.alert("努力接入中......");
		}

	});
	return $item;
}
function renderNewsItem(item) { 
	var type = null;
		if( item.type == '公告' ){
			type = 'news-r';
		}else if( item.type == '活动' ){
			type = 'news-a';
		}
	var html = '<li class="mui-table-view-cell news-li" data-url="'+item.url+'">'+
				'<span class="'+type+'">'+item.type+'</span>'+
					'<span>'+item.title+'</span>'+
					'<span>'+getDateTime(item.intime*1000).date+'</span>'+
				'</li>'
	
	return $(html);
}

//渲染游戏列表
function renderGameList($parent, lists, isAppend, recently, isMyGames) {
	if(!isAppend) {
		$parent.empty();
	}
	mui.each(lists, function(index, item) {
		$parent.append(renderGameItem(item, recently, isMyGames));
	});
}

//渲染新闻列表
function renderNewsList($parent, lists, isAppend) {
	if(!isAppend) {
		$parent.empty();
	}
	mui.each(lists, function(index, item) {
		$parent.append(renderNewsItem(item));
	});
}

function renderLastGameItem(item) {
	var itemHtml = '<li>' +
		'<a herf="">' +
		'<img style="border-radius:15px;" src="' + iconHost + item.icon + '">' +
		'</a><p>' + item.name + '</p></li>';
	var $item = $(itemHtml);

	$item.on('tap', function() {
		toGameDetail(item);
	});
	return $item;
}

//渲染最近玩的游戏
function renderLastGames($parent, lists) {
	$parent.empty();
	mui.each(lists, function(index, item) {
		$parent.append(renderLastGameItem(item));
	});
}

function toGameDetail(game) {
	var currentWebview = plus.webview.currentWebview();
	if(currentWebview.id == 'game') {
		mui.fire(currentWebview, 'reload', game);
	} else {
		mui.openWindow({
			url: './game.html',
			id: 'game.html',
			styles: {
				top: '0px',
				bottom: '51px'
			},
			extras: {
				game: game
			}
		});
	}

}

//渲染礼品中的礼品列表
function renderGiftList($parent, lists, isAppend) {
	if(!isAppend) {
		$parent.empty();
	}
	mui.each(lists, function(index, item) {
		$parent.append(renderGiftItem(item));
	});
}

function renderGiftItem(item) {
	var html = [];
	var percent = (item.surplus / item.total).toFixed(2) * 100;
	html.push('<div class="media game-list-item">')
	html.push('<div class="media-left media-middle" data-gameid="' + item.gid + '" style="position:relative;">');
	html.push('<img style="border-radius:15px;" class="media-object game-icon" src="http://www.letsv.com/Uploads/Game/' + item.icon + '" alt="">')
	html.push('</div>');
	html.push('<div class="media-body" data-gameid="' + item.gid + '">');
	html.push('<p class="game-title">' + item.name + '</p>');
	html.push('<p class="game-load"><span>' + item.content + '</span></p>')
	html.push('<div class="table-model-pro"><i style="width:' + (100 - percent) + '%"></i></div>');
	html.push('<p class="game-desc">礼包码剩余' + percent + '%</p>');
	html.push('</div>');
	html.push('<div class="media-right media-middle"><a class="game-enter-button" role="button" external="true">领 号</a></div>');
	html.push('</div>');
	var $item = $(html.join(''));
	$item.on('tap', function(e) {
		e.stopPropagation();
		toGameDetail(item);
	});
	$item.find('.game-enter-button').on('tap', function(e) {
		e.stopPropagation();
		if(!window.app.getState().id ){
			if(window.loginView){
				window.loginView.show();
				mui.fire(window.loginView,"showLogin");
			}else{
				mui.fire(plus.webview.getLaunchWebview(),'showLogin');
			}
			return;
		}
		apis.presentGift({
			mid: app.getState().id,
			pid: item.id,
			doletime: Date.now()
		}, function(res) {
			mui.prompt("请点击输入框复制礼包码每个帐号只能领取一次", res.number, "详情", ['取消', '复制'], function() {
				mui.os.android?copyToClipAndroid(res.number):copyToClipIos(res.number);
			}, 'div');

			document.querySelector('.mui-popup-input input').value = res.number;
			$('.mui-popup-input input').attr("readonly", true);
		});
	});

	function copyToClipAndroid(text) {
		var Context = plus.android.importClass("android.content.Context");
		var main = plus.android.runtimeMainActivity();
		var clip = main.getSystemService(Context.CLIPBOARD_SERVICE);
		plus.android.invoke(clip, "setText", text);
		mui.toast('复制成功！');
	}

	function copyToClipIos(text) {
		var UIPasteboard = plus.ios.importClass("UIPasteboard");
		var generalPasteboard = UIPasteboard.generalPasteboard();
		// 设置/获取文本内容:
		generalPasteboard.setValueforPasteboardType(text, "public.utf8-plain-text");
		mui.toast('复制成功！');
		//var value = generalPasteboard.valueForPasteboardType("public.utf8-plain-text");
	}

	return $item;
}

// 渲染游戏详情中的礼包列表
function renderGameGiftList($parent, lists) {
	mui.each(lists, function(index, item) {
		$parent.append(renderGameGiftItem(item));
	});
}

function renderGameGiftItem(item) {
	var html = [];
	var percent = (item.surplus / item.total).toFixed(2) * 100;
	html.push('<div class="media game-list-item">')
	html.push('<div class="media-body" data-gameid="' + item.gid + '">');
	html.push('<p class="game-title">' + item.name + '</p>');
	html.push('<p class="game-load"><span>' + item.content + '</span></p>')
	html.push('<div class="table-model-pro"><i style="width:' + (100 - percent) + '%"></i></div>');
	html.push('<p class="game-desc">此礼包还剩余' + item.surplus + '个</p>');
	html.push('</div>');
	html.push('<div class="media-right media-middle"><a class="game-enter-button" role="button" external="true">领 号</a></div>');
	html.push('</div>');
	var $item = $(html.join(''));
	$item.on('tap', function(e) {
		e.stopPropagation();
		toGameDetail(item);
	});
	$item.find('.game-enter-button').on('tap', function(e) {
		e.stopPropagation();
		if(!window.app.getState().id ){
			if(window.loginView){
				window.loginView.show();
				mui.fire(window.loginView,"showLogin");
			}else{
				mui.fire(plus.webview.getLaunchWebview(),'showLogin');
			}
			return;
		}
		apis.presentGift({
			mid: app.getState().id,
			pid: item.id,
			doletime: Date.now()
		}, function(res) {
			mui.prompt("请点击输入框复制礼包码每个帐号只能领取一次", res.number, "详情", ['取消', '复制'], function() {
				mui.os.android?copyToClipAndroid(res.number):copyToClipIos(res.number);
			}, 'div');
			document.querySelector('.mui-popup-input input').value = res.number;
		});
	});

	function copyToClipAndroid(text) {
		var Context = plus.android.importClass("android.content.Context");
		var main = plus.android.runtimeMainActivity();
		var clip = main.getSystemService(Context.CLIPBOARD_SERVICE);
		plus.android.invoke(clip, "setText", text);
		mui.toast('复制成功！');
	}

	function copyToClipIos(text) {
		var UIPasteboard = plus.ios.importClass("UIPasteboard");
		var generalPasteboard = UIPasteboard.generalPasteboard();
		// 设置/获取文本内容:
		generalPasteboard.setValueforPasteboardType(text, "public.utf8-plain-text");
		mui.toast('复制成功！');
		//var value = generalPasteboard.valueForPasteboardType("public.utf8-plain-text");
	}

	return $item;
}

function getDateDiff(start, end) {
	var diffTimes = 0,
		diff = 0;
	start = parseInt(start);
	end = parseInt(end);

	diffTimes = end - start;
	diff = Math.floor(diffTimes / (24 * 3600 * 1000));
	if(diff > 1) {
		return diff + "天";
	}
	diff = Math.floor(diffTimes / (3600 * 1000));
	if(diff > 1) {
		return diff + "小时";
	}
	diff = Math.floor(diffTimes / (60 * 1000));
	return diff + "分钟";
}

function getDateTime(times) {
	var now = new Date(parseInt(times));
	var year = now.getFullYear();
	var month = now.getMonth() + 1;
	var day = now.getDate();
	var hour = now.getHours();
	var minute = now.getMinutes();
	var second = now.getSeconds();
	if(month.toString().length == 1) {
		var month = '0' + month;
	}
	if(day.toString().length == 1) {
		var day = '0' + day;
	}
	if(hour.toString().length == 1) {
		var hour = '0' + hour;
	}
	if(minute.toString().length == 1) {
		var minute = '0' + minute;
	}
	if(second.toString().length == 1) {
		var second = '0' + second;
	}
	var date = year + '-' + month + '-' + day;
	var time = hour + ':' + minute + ':' + second;
	return {
		date: date,
		time: time
	};
}

function playGame(item) {
	if(!window.app.getState().id){
		if(window.loginView){
			window.loginView.show();
			mui.fire(window.loginView,"showLogin");
		}else{
			mui.fire(plus.webview.getLaunchWebview(),'showLogin');
		}
		return;
	}
	plus.nativeUI.showWaiting();
	apis.playGame({
		gid: item.gid || item.id,
		mid: window.app.getState().id
	}, function(res) {
		console.log(JSON.stringify(res));
		plus.nativeUI.closeWaiting();
		mui.openWindow({
			url: 'play.html',
			id: 'play',
			createNew: true,
			extras: {
				game: {
					url: res.gameurl,
					name: item.name || item.gname
				}
			},
			waiting: {
				autoShow: true
			}
		});
/*		mui.openWindowWithTitle({
		    url:'play.html',
		    id:"play",
		    extras:{
				game: {
					url: res.gameurl,
					name: item.name || item.gname
				}
		    }
		},{
		    title:{//标题配置
		        text: item.name || item.gname,//标题文字
		    },
		    back:{//左上角返回箭头
		        image:{
		            base64Data:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAb1BMVEUAAAAAev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8Aev8AAACubimgAAAAI3RSTlMAGfUTGfQTGPMSGPIYGhgaGBsXGxcbFxwXHBccFhwWHRYdHWufDPQAAAABYktHRACIBR1IAAAAB3RJTUUH4QETEBwooeTlkQAAAJVJREFUSMft1EkSgkAQRNFGUXFWHBDBibr/HTUwD5B/48Ig1y+io7u6MqUhf5hsNEY+j5hMgZ/FJ8Xc9ovos3T96utjbfqN/Nb0O/m96Uv5g+mP8ifTn+Ur01/ka9Nf5RvTt/I309/lH6Z/yr9Mn+Q71/MT8B34K/E58Enzv8R/K98HvnF8p3lr8F7izce7lbf3kJ/lDQp9HdBhgg3PAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDE3LTAxLTE5VDE2OjI4OjQwKzA4OjAwpTDFwQAAACV0RVh0ZGF0ZTptb2RpZnkAMjAxNy0wMS0xOVQxNjoyODo0MCswODowMNRtfX0AAAAASUVORK5CYII='
		        },
		        click:function(){
		        	var NW = plus.webview.getWebviewById('play');
		        	try{
		        		console.log(JSON.stringify(plus.webview.currentWebview()) )
		        		NW.close();
		        		//plus.cache.clear( function(){console.log('清除缓存')})
		        		//plus.webview.currentWebview().reload(true);
		        	}catch(e){
		        		console.log( JSON.stringify(e) );
		        	}
		        }
		    }
		})		*/	
	}, function() {
		plus.nativeUI.closeWaiting();
	});
}