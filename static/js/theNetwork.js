
var loadCount = 0;
var main;

String.prototype.capitalize = function() {
	if (this.length <= 1) return this;
	var words = this.split(" ");
	for (var i in words)
		if (words[i][0] && words[i][0].match(/[A-Za-z]/))
			words[i] = words[i].replace(new RegExp(words[i][0]),words[i][0].toUpperCase());
	return words.join(" ");
}

$(document).ready(function() {
	main = $("main");

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

var listOfUsers = [];
function initialize() {

	if (loadCount > 1) {
		loadCount--;
		return false;
	}

	window.onhashchange = hasher;
	$.ajax({
		url: config.server+"?cmd=search&q=.&limits=profiles&list",
		method: "GET",
		dataType: "JSON",
		success: function(data) {
			listOfUsers = data.results.filter(function(f) { return f != null; });
			setData();
			if (window.location.hash.substr(1) !== "")
				hasher();
		},
		error: function(data) {
			console.error(data);
		}
	});

	$("head").append('<meta name="description" content="'+config.title+': '+config.description+'" />');
	$("head").append('<link rel="icon" href="'+config.favicon+'"  type="image/x-icon">');
	$("head").append('<link rel="shortcut-icon" href="'+config.favicon+'"  type="image/x-icon">');
	$("head").append('<link rel="apple-touch-icon" href="'+config.favicon+'">');
	document.title = config.title;

	$(document).foundation();
	navInit();

}

function setData() {
	$.each(config, function(key,value) {
		$(".data-"+key).text(value);
	});
	if (user.wwuid) {
		$(".hide-for-logged-in").remove();
		for (var i = 0; i < user.roles.length; i++) {
			$(".show-for-role.role-"+user.roles[i]).addClass("keepMe");
		}
	} else {
		$(".hide-for-logged-out").remove();
	}
	$(".hide").hide();
	$(".show-for-role").not(".keepMe").remove();
	if (typeof navInit === "function")
		navInit();
	$(".datepicker").not(".profile").fdatepicker();
	$(".slickSlider").not(".slick-initialized").slick({autoplay: true, nextArrow: "", prevArrow: ""});

	setAutoComplete($("input.autocomplete-search"), function(request, response) {
		var limits = this.element[0].dataset.searchLimits || "profiles";
		dbSearch(request.term, limits, response, true);
	});
	$("input.autocomplete-search").not(".no-search").on("keydown", function(event) {
		if (event.keyCode == $.ui.keyCode.ENTER) {
			window.location.href = "#/search/"+$(this).val().replace(" \[","/").replace("]","");
			event.preventDefault();
		}
	});

	var f = $(".autofocus").last();
	if (f.attr("id") != $(".top-bar-section .autofocus").last().attr("id") || $("body").width() > 640) {
		f.focus();
	}
}

function loader(div,url,cb) {
	$('#spinner').fadeIn();
	$(div).fadeOut(function() {
		div.empty();
		div.load(url, function(response, status, xhr) {
			if (cb && typeof cb === "function") cb(xhr);
			$('#spinner').fadeOut();
			$(div).fadeIn(setData);

		});

	});

}

function setAutoComplete($obj, source, multiple) {
	if (!multiple) {
		if (typeof source == "obj") {
			$obj.autocomplete(source);
		} else {
			$obj.autocomplete({ source: source });
		}
	} else {
		$obj.bind("keydown", function( event ) {
			if ( event.keyCode === $.ui.keyCode.TAB &&
					$( this ).autocomplete( "instance" ).menu.active ) {
				event.preventDefault();
			}
		}).autocomplete({
			minLength: 0,
			source: function( request, response ) {
				response( $.ui.autocomplete.filter(
					source, request.term.split(/,\s*/).pop()) );
			},
			focus: function() {
				return false;
			},
			select: function( event, ui ) {
				var terms = this.value.split(/,\s*/);
				terms.pop();
				terms.push( ui.item.value );
				terms.push( "" );
				this.value = terms.join( ", " );
				return false;
			}
		});
	}
}
