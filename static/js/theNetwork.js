
var loadCount = 0;
var main;

var handlers = [
	["/profile/.*/update", updateProfileHandler],
	["/profile/.*", profileHander],
	["/search/.*", searchHandler],
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
	$("div.search").html("<input><div></div>");
	$("div.search input").keyup(function(e) {
			var rbox = $(this).next();
			dbSearch($(this).val(), $(this).parent().data("search-limits"), function(data) {
				rbox.empty();
				if (data.results) {
					$.each(data.results, function(i, r) {
						rbox.append("<a href='#profile/"+(r.year ? r.year+"/" : "")+r.username+"'>"+r.fullname+"</a>");
					});
				}
			});
	});
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
