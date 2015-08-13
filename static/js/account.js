var user = {};

function au(check) {
	var w = sessionStorage.wwuid || "";
	if (w == "undefined") w = "";
	var t = sessionStorage.token || "";
	if (t == "undefined") t = "";
	if (check && (t == "" || w == ""))
		return false;
	return config.server+"?wwuid="+w+"&token="+t;
}

function checkLogin(callback) {
	if (!au(true)) {
		processLogin("");
		if (typeof callback == "function")
			callback("");
		return;
	}
	$.ajax({
		url: au()+"&verify",
		dataType: "JSON",
		type: "GET",
		success: function(data) {
			processLogin(data);
			if (typeof callback == "function")
				callback(data);
		}
	});
}

function processLogin(newUser) {
	user = newUser;
	sessionStorage.wwuid = user.wwuid;
	sessionStorage.token = user.token;
	if (typeof navInit == "function")
		navInit();
}

function login(form) {
	$.ajax({
		url: config.server+"?cmd=login",
		dataType: "JSON",
		data: form.serialize(),
		type: "POST",
		success: function(data) {
			$("#login-form").removeClass("loading");
			if (!data || data.errors) {
				$("#login-form input[type=text]").focus();
				$("#login-modal .errors h5").text(data.errors);
			} else {
				$("#login-modal").foundation("reveal","close");
				processLogin(data.user);
			}
		}, error: function(data) {
			console.error(data);
		}
	});
}

function logout() {
	processLogin("");
}
