
function getVolunteer(cb) {
	$.ajax({
		url: config.server+"volunteer/"+user.wwuid,
		beforeSend: setAuthHeaders,
		method: "GET",
		dataType: "JSON",
		success: function(data) {
			if (typeof cb == "function")
				cb(data);
		},
		error: function(data) {
			console.error(data);
		}
	});
}

function setVolunteerData(div, data) {
	if (data) {
		$.each(data, function(key, value) {
			var $obj = div.find(".volunteer-"+key);
			var ck = key.replace(/_/g," ").capitalize().replace(/ Slash /g,"/");
			$obj.find("input[type=checkbox]").attr("name",key).prop("checked", (value == 'True'));
			$obj.find("input[type=text]").val(value).attr("placeholder",ck).attr("name",key);
			$obj.find(".key").text(ck);
		});
	}
	$("#volunteerForm").submit(function(event) {
		event.preventDefault();
		var volunteerData = {};
		$.each($(this).find("input[type=checkbox]"), function(v, k) {
			k = $("#"+k.id);
			volunteerData[k.attr("name")] = (k.prop("checked") ? "1" : "0");
		});
		$.each($(this).find("input[type=text]"), function(v, k) {
			volunteerData[k.name] = k.value;
		});
		$.ajax({
			url: config.server+"volunteer",
			beforeSend: setAuthHeaders,
			method: "POST",
			data: volunteerData,
			success: function(data) {
				window.location.href = "";
			},
			error: function(data) {
				console.error(data);
			}
		});
	});
}
