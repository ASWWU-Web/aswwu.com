var user = {};

function au(check) {
	var w = localStorage.wwuid || "";
	if (w == "undefined") w = "";
	var t = localStorage.token || "";
	if (t == "undefined") t = "";
	if (check && (t == "" || w == ""))
		return false;
	return config.server+"?token="+w+t;
}

function checkLogin(callback) {
	if (!au(true)) {
		processLogin("");
		if (typeof callback == "function")
			callback("");
		return;
	}
	if (localStorage.user && localStorage.user.length > 10) {
		var data = JSON.parse(localStorage.user);
		if (localStorage.loginTime*1 > (new Date()).getTime()-600000) {
			processLogin(data);
			if (typeof callback == "function") callback(data);
			return;
		}
	}
	$.ajax({
		url: au()+"&verify",
		dataType: "JSON",
		type: "GET",
		success: function(data) {
			localStorage.loginTime = (new Date()).getTime();
			processLogin(data);
			if (typeof callback == "function")
				callback(data);
		}
	});
}

function processLogin(newUser) {
	user = newUser;
	localStorage.wwuid = user.wwuid;
	localStorage.token = user.token;
	localStorage.user = JSON.stringify(newUser);
}

var currentlyLoggingIn = false;
function login(form) {
	$("#login-modal .errors h5").text("");
	if (currentlyLoggingIn) return;
	currentlyLoggingIn = true;
	$.ajax({
		url: config.server+"?cmd=login",
		dataType: "JSON",
		data: form.serialize(),
		type: "POST",
		success: function(data) {
			currentlyLoggingIn = false;
			$("#login-form").removeClass("loading");
			if (!data || data.errors) {
				$("#login-form input[type=text]").focus();
				$("#login-modal .errors h5").text(data.errors);
			} else {
				$("#login-modal").foundation("reveal","close");
				processLogin(data.user);
				location.reload();
			}
		}, error: function(data) {
			currentlyLoggingIn = false;
			console.error(data);
		}
	});
}

function logout() {
	processLogin("");
	location.reload();
}
