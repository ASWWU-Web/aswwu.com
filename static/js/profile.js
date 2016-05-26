
function getProfile(name, year, cb, p) {
	if (!year || year.toString().length != 4)
		year = config.defaults.year;
	$.ajax({
		url: config.server+(p ? "profile/" : "search/")+year+"/"+name,
		beforeSend: setAuthHeaders,
		dataType: "JSON",
		type: "GET",
        cache: false,
		success: function(data) {
			if (typeof cb == "function")
				cb(data);
		}, error: function(data) {
			console.error(data);
		}
	});
}

function setInputByKey(obj, key, value) {
	if (key == "majors" || key == "minors" || key == "attached_to" || key == "name") var input = $("<input type='text' class='autocomplete'>");
	else if (profileFields[key] && profileFields[key].length > 1) var input = $("<select></select>");
	else if (key == "birthday") var input = $('<input type="text" class="datepicker" data-date-format="mm-dd">');
	else var input = $("<input type='text'>");
	obj.find(".insert-input-here").html(input);

	if (profileFields[key] && profileFields[key].length > 1) {
		obj.find("select").not(".set-key").html(profileFields[key].map(function(v) {
			v = v.capitalize();
			return '<option value="'+v+'">'+v+'</option>';
		}));
	}
	var autocomplete_field = profileFields[key];
	if (key == "attached_to" || key == "name") {
		autocomplete_field = function(request, response) {
				dbSearch(request.term, "profiles", response, true);
		}
	}
	setAutoComplete(obj.find("input.autocomplete"), autocomplete_field);
	setAutoComplete(obj.find("input.autocomplete-multiple"), autocomplete_field,true);

	obj.find("input[type=text], select").not(".set-key").val(value).attr("name",key).attr("placeholder",key.replace("_"," ").capitalize());
	obj.find(".value").text(value);
	obj.find(".key").text(key.replace("_"," ").capitalize());
	obj.find("input.datepicker").fdatepicker();
}

function setProfileData(data,div) {
	if (user.status == "Student")
		div.find(".hide-for-students").remove();
	if (!data.results && !data.username)
		var profile = {"full_name": "Profile Not Found", "photo": null};
	else if (data.results && data.results.length > 1) {
		var profile = {"full_name": "Too Many Profiles Found","photo": null};
	} else if (data.results) {
		var profile = data.results[0];
	} else {
		var profile = data;
	}
	if (!profile.full_name || profile.full_name.length < 5)
		profile.full_name = profile.username.replace(/\./g," ");

	$.each(profile, function(key,value) {
		if (value == "None") value = "";
		var obj = div.find(".profile-"+key);
		if (obj.hasClass("as-input")) {
			if (key == "photo") {
				var photoObj = obj;
				$.ajax({
					url: config.defaults.mediaURL+"listProfilePhotos.php?wwuid="+profile.wwuid+"&year="+config.defaults.year,
					method: "GET",
					success: function(data) {
						var label = function(link) {
							return "<label>"+
								"<input type='radio' name='photo' value='"+link+"' "+(value == link ? "checked" : "")+">"+
								"<img src='"+config.defaults.mediaURL+"img-sm/"+link+"' onclick='this.previousElementSibling.checked = true;'>"+
								"</label>";
						}
						var photos = JSON.parse(data);
						photos.push(config.defaults.profilePhoto);
						for (var p in photos) {
							photoObj.append(label(photos[p]));
						}
						dbSearch(profile.username, config.defaults.year*1-101, function(data) {
							for (var i = 0; i < data.results.length; i++) {
								if (profile.username == data.results[i].username) {
									var p = data.results[i].photo || "";
									if (p.length > 1 && p.search(config.defaults.profilePhoto.split("/").reverse()[0]) < 0) {
										if (p.search("/"+config.defaults.year+"/") < 0)
											photoObj.append(label(p));
									}
									return;
								}
							}
						});
					}
				});
			} else {
					setInputByKey(obj, key, value);
			}
			return;
		}

		if (key !== "photo" && (!value || value == "" || value.length < 2)) return;
		if (key == "photo") {
			obj.html("<div class='spinner'></div><img>");
			for (var i = 1; i < 6; i++)
				obj.find("div").append("<div class='rect"+i+"'>");
			obj.find("img").hide().load(function() {
				$(this).prev().remove();
				$(this).fadeIn();
			}).attr("src", function() {
				return config.mu.sm+(value || config.defaults.profilePhoto);
			});
		} else if (key == "phone") {
			obj.html("<a href='tel:"+value+"'>"+value+"</a>");
		} else if (key == "email") {
			obj.html("<a href='mailto:"+value+"'>"+value+"</a>");
		} else if (key == "website") {
			obj.html("<a href='http://"+value.replace(/http:\/\/|https:\/\//, "")+"' target='_blank'>"+value+"</a>");
		} else if (key == "attached_to") {
			obj.html("<a href='#/search/"+value+"'>"+value+"</a>");
		} else if (key == "birthday") {
			var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
			obj.html("<a href='#/search/birthday="+value+"'>"+months[value.split("-")[0]*1-1]+" "+value.split("-")[1]+"</a>");
		} else if (key.search("favorite") > -1 || key.search("hobbies") > -1) {
			obj.html(value.split(", ").map(function(v) {
				return "<a href='#/search/"+key+"="+v+"'>"+v+"</a>";
			}).join(", "));
		} else if (["full_name","username"].indexOf(key) > -1) {
			obj.text(value);
		} else {
			obj.html("<a href='#/search/"+key+"="+value+"'>"+value+"</a>");
		}

		if (obj.hasClass("with-label")) {
			obj.prepend("<i><small class='label-profile'>"+key.replace("_"," ").capitalize()+" - </small></i> ");
		}
	});
}

function updateProfile(name, goToVolunteer) {
	var data = $("#updateForm").serializeArray();
	var profile_data = {};
	$.each(data, function(i,d) {
		profile_data[d.name] = d.value;
	});
	$.ajax({
		url: config.server+"update/"+name,
		beforeSend: setAuthHeaders,
		dataType: "JSON",
		data: profile_data,
		type: "POST",
		success: function(data) {
			if (goToVolunteer)
				window.location.href = "#/volunteer";
			else
				window.location.href = window.location.href.replace("/update","");
		}, error: function(data) {
			console.error(data);
		}
	});
}

function dbSearch(q, limits, cb, autocomplete) {
	if ((!q || q.length == 0) && !autocomplete) {
		q = " ";
	}
	if (limits == config.defaults.year)
		limits = "profiles";
	if (limits !== "profiles" || q.split("=").length > 1) {
		getProfile(q, limits, cb);
		return;
	}

	q = q.replace("%20"," ");
	var data = {"results": listOfUsers};
	data = data.results.filter(function(u) {
		var q1 = q.split(" ")[0].toLowerCase();
		var q2 = q.split(" ").reverse()[0];
		q2 = q2.toLowerCase();
		var u1 = u.username.split(".")[0].toLowerCase();
		var u2 = u.username.split(".").reverse()[0].toLowerCase();
		var f1 = u.full_name.split(" ")[0] || u1;
		var f2 = u.full_name.split(" ").reverse()[0] || u2;
		f1 = f1.toLowerCase();
		f2 = f2.toLowerCase();
		return (u1.indexOf(q1) == 0 || u2.indexOf(q1) == 0 || f1.indexOf(q1) == 0 || f2.indexOf(q1) == 0) &&
						(u1.indexOf(q2) == 0 || u2.indexOf(q2) == 0 || f1.indexOf(q2) == 0 || f2.indexOf(q2) == 0);
	}).sort(function(a, b) {
		if (a.views*1 > b.views*1) return -1;
		else if (b.views*1 > a.views*1) return 1;
		else return 0;
	});
	if (autocomplete) {
		var r = [], l = "";
		if (limits.split(",").length > 1)
			l = " ["+limits.split(",")[1]+"]";
		for (var d = 0; d < Math.min(data.length,10); d++) {
			var dt = {"username": data[d].username, "full_name": data[d].full_name};
			dt.username = dt.username.replace("."," ").capitalize();
			if (dt.username !== dt.full_name && dt.username.toLowerCase() !== dt.full_name.toLowerCase() && dt.full_name.length > 5) {
				r.push({"label": dt.full_name+l, "value": dt.username+l});
			}
			r.push({"label": dt.username+l, "value": dt.username+l});
		}
		data = r;
	}
	if (typeof cb == "function")
		cb(data);
}
