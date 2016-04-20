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

function getToken() {
	var t = localStorage.token || "";
	if (t == "undefined" || t.split("|").length < 3) t = "";
	return t;
}

function setAuthHeaders(request) {
	request.setRequestHeader("token",getToken());
}

function checkLogin(callback) {
	if (getToken() == "") {
		processLogin("");
		if (typeof callback == "function")
			callback("");
		return;
	}
	$.ajax({
		url: config.server+"verify",
		beforeSend: setAuthHeaders,
		dataType: "JSON",
		type: "GET",
    cache: false,
		success: function(data) {
			if (data.error) processLogin("","");
			processLogin(data, getToken());
			if (typeof callback == "function")
				callback(data);
		},
    error: function(data) {
			processLogin("","");
			if (typeof callback == "function")
				callback({});
    }
	});
}

function processLogin(new_user, token) {
	if (new_user.roles)
		new_user.roles = new_user.roles.split(",");
	user = new_user;
	localStorage.token = token;
	localStorage.user = JSON.stringify(new_user);
}

var currentlyLoggingIn = false;
function login(form) {
	$("#login-modal .errors h5").text("");
	if (currentlyLoggingIn) return;
	currentlyLoggingIn = true;
	$.ajax({
		url: config.server+"login",
		dataType: "JSON",
		data: form.serialize(),
		type: "POST",
		success: function(data) {
			currentlyLoggingIn = false;
			$("#login-form").removeClass("loading");
			if (!data || data.error) {
				$("#login-form input[type=text]").focus();
				$("#login-modal .errors h5").text(data.error);
			} else {
				$("#login-modal").foundation("reveal","close");
				processLogin(data.user,data.token);
				location.reload();
			}
		}, error: function(data) {
			currentlyLoggingIn = false;
			console.error(data);
		}
	});
}

function logout() {
	processLogin("","");
	location.reload();
}
