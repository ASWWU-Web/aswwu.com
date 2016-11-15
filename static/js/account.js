var user = {};

function getToken() {
	var t = Cookies.get("token") || "";
	if (t == "undefined" || t.split("|").length < 3) t = "";
	return t;
}

function setToken(token) {
	Cookies.set("token", token, {"domain": config.cookie});
}

function setAuthHeaders(request) {
	request.setRequestHeader("Authorization", "HMAC "+getToken());
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
			processLogin((data.user ? data.user : data), (data.token ? data.token : getToken()));
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
	setToken(token);
	localStorage.user = JSON.stringify(new_user);
}

function logout() {
	processLogin("","");
	location.reload();
}
