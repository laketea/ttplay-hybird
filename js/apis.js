(function($, owner) {
	var apiHost = "http://test.letsv.com/",
		sign = "9CLm76**$L&a&Tsjb6Ivc#vdnDcoSH3C";

	owner.login = function(data, done, failed) {
		return post("/Api/App/isLogin", data, done, function(error) {
			if(error.status == 0) {
				error.msg = "此帐号不存在";
			} else if(error.status == 2) {
				error.msg = "用户名或密码错误";
			}
			failed(error);
		});
	};

	owner.reg = function(data, done, failed) {
		return post("/Api/App/register", data, done, function(error) {
			if(error.status == 0) {
				error.msg = "注册失败";
			} else if(error.status == 2) {
				error.msg = "此帐号已存在";
			}
			failed(error);
		});
	};

	owner.getPlayedGames = function(data, done, failed) {
		return get("/Api/App/historyGames", data, done, failed)
	}

	owner.getGames = function(type, done, failed) {
		return get("/Api/App/getGames", {
			type: type
		}, done, failed);
	}

	owner.getGameDetail = function(gid, done, failed) {
		return get("/Api/App/getGame", {
			gid: gid
		}, done, failed);
	}
	
	owner.getNews = function(done,failed){
		return get("/Api/App/getNews",done,failed)
	}
	
	owner.playGame = function(data,done,failed){
		return post("/Api/App/loginGame",data,done,failed);
	}
	
	owner.getGifts = function(){
		return get("/Api/App/gift",done,failed);
	}
	
	owner.presentGift = function(data,done,failed){
		return post("/Api/App/getGift",data,done,failed);
	}

	owner.captch = function(data, done, failed) {
		return post("/Api/App/AuthCode", data, done, failed);
	};

	function post(url, data, done, failed) {
		ajax("post", url, data, done, failed);
	};

	function get(url, data, done, failed) {
		ajax("get", url, data, done, failed);
	}

	function ajax(type, url, data, done, failed) {
		if(!data) {
			failed = done;
			done = data;
		}
		data = data || {};
		data.sign = sign;
		done = done || $.noop;
		failed = failed || $.noop;
		return $.ajax(apiHost + url, {
			data: data,
			type: type,
			dataType: 'json',
			success: function(res) {
				if(res.status == 1) {
					done(res);
				} else if(res.status == -1) {
					failed({
						status: res.status,
						msg: "请求超时"
					});
				} else if(res.status == -2) {
					failed({
						status: res.status,
						msg: "授权失败"
					});
				} else {
					failed({
						status: res.status
					});
				}
			},
			error: function(error) {
				failed({
					status: -3,
					msg: "请求错误"
				});
			}
		});
	}

}(mui, window.apis = {}));