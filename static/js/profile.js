
function getProfile(name, year, cb) {
	var limits = "profiles";
	if (year && year.toString().length == 4)
		limits = "archives,"+year;
	console.log("searching",limits,name);
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
	if (!data.results && !data.username)
		var profile = {"fullname": "Profile Not Found", "photo": null};
	else if (data.results && data.results.length > 1) {
		var profile = {"fullname": "Too Many Profiles Found","photo": null};
	} else if (data.results) {
		var profile = data.results[0];
	} else {
		var profile = data;
	}
	$.each(profile, function(key,value) {
		var obj = div.find(".profile-"+key);
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
	});
}

function updateProfile(name,cmd) {
	if (cmd == "send") {
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
				console.log(data);
			}, error: function(data) {
				console.error(data);
			}
		});
	} else {
		getProfile(name,undefined,function(data) {
			if (data.results)
				var profile = data.results[0];
			var $form = $("<form id='updateForm'>");
			$.each(profile, function(key,value) {
				$form.append("<input type='text' name='"+key+"' value='"+(value ? value : "")+"' placeholder='"+key+"'>");
			});
			$form.append("<input type='submit' value='Save'>");
			$("main").empty();
			$("main").append($form);
			$("#updateForm").submit(function() {
				updateProfile(name,"send");
				return false;
			});
		});
	}
}
