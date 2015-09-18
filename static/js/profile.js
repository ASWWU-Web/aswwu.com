
function getProfile(name, year, cb) {
	var limits = "profiles";
	if (year && year.toString().length == 4)
		limits = "archives,"+year;
	$.ajax({
		url: au()+"&cmd=search&limits="+limits+"&q="+name,
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

function setProfileData(data,div) {
	if (user.status == "Student")
		div.find(".hide-for-students").remove();
	if (!data.results && !data.username)
		var profile = {"fullname": "Profile Not Found", "photo": null};
	else if (data.results && data.results.length > 1) {
		var profile = {"fullname": "Too Many Profiles Found","photo": null};
	} else if (data.results) {
		var profile = data.results[0];
	} else {
		var profile = data;
	}
	if (!profile.fullname || profile.fullname.length < 5)
		profile.fullname = profile.username.replace(/\./g," ");

	$.each(profile, function(key,value) {
		var obj = div.find(".profile-"+key);
		if (obj.hasClass("as-input")) {
			if (profileFields[key] && profileFields[key].length > 1) {
				obj.find("select").html(profileFields[key].map(function(v) {
					v = v.capitalize();
					return '<option value="'+v+'">'+v+'</option>';
				}));
			}
			if (key == "photo") {
				var photoObj = obj;
				$.ajax({
					url: config.defaults.mediaURL+"listProfilePhotos.php?wwuid="+user.wwuid+"&year="+"1415",//config.defaults.year,
					method: "GET",
					success: function(data) {
						var photos = JSON.parse(data);
						photos.push(config.defaults.profilePhoto);
						for (var p in photos) {
							photoObj.append("<div><label>"+
								"<input type='radio' name='photo' value='"+photos[p]+"' "+(value == photos[p] ? "checked" : "")+">"+
								"<img src='"+config.defaults.mediaURL+"img-sm/"+photos[p]+"'>"+
								"</label></div>");
						}
					}
				});
				return;
			}
			obj.find("input[type=text], select").val(value).attr("name",key).attr("placeholder",key.replace("_"," ").capitalize());
			obj.find(".value").text(value);
			obj.find(".key").text(key.replace("_"," ").capitalize());
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
			obj.html("<a href='"+value+"' target='_blank'>"+value+"</a>");
		} else {
			obj.text(value);
		}

		if (obj.hasClass("with-label")) {
			obj.prepend("<i><small class='label-profile'>"+key.replace("_"," ").capitalize()+" - </small></i> ");
		}
	});
}

function updateProfile(name,cmd) {
	var data = $("#updateForm").serializeArray();
	var profile_data = {};
	$.each(data, function(i,d) {
		profile_data[d.name] = d.value;
	});
	$.ajax({
		url: au()+"&cmd=search&limits=profiles&q="+name,
		dataType: "JSON",
		data: {profile_data: JSON.stringify(profile_data)},
		type: "POST",
		success: function(data) {
			window.location.href = window.location.href.replace("/update","");
			// console.log(data);
		}, error: function(data) {
			console.error(data);
		}
	});
}
