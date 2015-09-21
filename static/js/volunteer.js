
function getVolunteer(cb) {
	$.ajax({
		url: au()+"&cmd=volunteers",
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
	if (data.volunteer_info) {
		$.each(data.volunteer_info, function(key, value) {
			var $obj = div.find(".volunteer-"+key);
			var ck = key.replace(/_/g," ").capitalize();
			$obj.find("input[type=checkbox]").attr("name",key).prop("checked", (value == 1));
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
			url: au()+"&cmd=volunteers",
			method: "POST",
			data: {"volunteer_data": JSON.stringify(volunteerData)},
			success: function(data) {
				location.reload();
			},
			error: function(data) {
				console.error(data);
			}
		});
	});
}
