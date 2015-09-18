
var loadCount = 0;
var main;

String.prototype.capitalize = function() {
	if (this.length <= 1) return this;
	var words = this.split(" ");
	for (var i in words)
		if (words[i][0].match(/[A-Za-z]/))
			words[i] = words[i].replace(new RegExp(words[i][0]),words[i][0].toUpperCase());
	return words.join(" ");
}

var handlers = [
	["/profile/.*/update", updateProfileHandler],
	["/profile/.*", profileHander],
	["/search/.*", searchHandler],
	["/upload/.*", uploadHandler],
	[".*", indexHandler]
];

function hasher() {
	checkLogin(function() {
		var hash = window.location.hash.substr(1);
		for (var h in handlers) {
			var path = handlers[h][0].replace(/\//g,"\\\/");
			var r = new RegExp(path);
			var m = hash.match(path);
			if (m && m[0] === hash) {
				m = path.split("\\\/");
				hash = hash.split("/").filter(function(i) { return m.indexOf(i) < 0; });
				$("#background").addClass("hash");
				handlers[h][1].apply(this, hash);
				return true;
			}
		}
	});
}

$(document).ready(function() {
	main = $("main");

	$("#background").html("<img>");
	$("#background img").hide().load(function() {
		$(this).fadeIn();
	}).attr("src",function() {
		return config.mu.bg;
	});

	checkLogin(function(data) {
		$("[data-html]").each(function(i,div) {
			loadCount++;
			var url = div.getAttribute("data-html");
			loader($("[data-html='"+url+"']"),url,initialize);
		});

		loadCount += config.files.js.length;
		$.each(config.files.js, function(i, jsUrl) {
			$.getScript(jsUrl, initialize);
		});
	});

	$.each(config.files.css, function(i,cssUrl) {
		$("head").append("<link href='"+cssUrl+"' rel='stylesheet'>");
	});

});

function initialize() {

	if (loadCount > 1) {
		loadCount--;
		return false;
	}

	setData();

	$("head").append('<meta name="description" content="'+config.title+': '+config.description+'" />');
	$("head").append('<link rel="icon" href="'+config.favicon+'"  type="image/x-icon">');
	$("head").append('<link rel="shortcut-icon" href="'+config.favicon+'"  type="image/x-icon">');
	$("head").append('<link rel="apple-touch-icon" href="'+config.favicon+'">');
	document.title = config.title;

	$(document).foundation();
	navInit();

	window.onhashchange = hasher;
	if (window.location.hash.substr(1) !== "")
		hasher();

}

function setData() {
	$.each(config, function(key,value) {
		$(".data-"+key).text(value);
	});
	if (user.wwuid) {
		$(".hide-for-logged-in").remove();
	} else {
		$(".hide-for-logged-out").remove();
	}
	if (typeof navInit === "function")
		navInit();
	$(".datepicker").fdatepicker();

	// var $searchDivs = $("div.search").filter(function(i, div) {
	// 	return !div.className.match("already-set");
	// });
	// $searchDivs.html("<input><div></div>");
	// $searchDivs.find("input").keyup(function(e) {
	// 	if (e.keyCode == 13) {
	// 		window.location.href="#/search/"+$(this).val();
	// 		return;
	// 	}
	// 	var rbox = $(this).next();
	// 	var searchLimits = function(div) {
	// 		return div.parent().data("search-limits") || "profiles";
	// 	};
	// 	searchLimits = searchLimits($(this));
	// 	dbSearch($(this).val(), searchLimits, function(data) {
	// 		rbox.empty();
	// 		if (data.results) {
	// 			$.each(data.results, function(i, r) {
	// 				if (searchLimits.split(",").length == 2)
	// 					r.year = searchLimits.split(",")[1];
	// 				if (!r.fullname)
	// 					r.fullname = r.username.replace("."," ").capitalize();
	// 				rbox.append("<a href='#/profile/"+r.username+"/"+(r.year ? r.year+"/" : "")+"'>"+r.fullname+"</a>");
	// 			});
	// 		}
	// 	});
	// });
	// $searchDivs.addClass("already-set");
}

function dbSearch(q, limits, cb) {
	$.ajax({
		url: au()+"&cmd=search&q="+q+"&limits="+limits,
		dataType: "JSON",
		type: "GET",
		success: function(data) {
			if (typeof cb == "function")
				cb(data);
		}, error: function(data) {
			console.error(data);
		}
	});
}

function loader(div,url,cb) {
	div.empty();
	var spinner = $("<div class='spinner'></div>");
	for (var i = 1; i <= 5; i++) {
		spinner.append("<div class='rect"+i+"'></div>");
	};
	div.append(spinner);
	div.load(url,function(){
		if (cb && typeof cb === "function") cb();
		setData();
	});
}
