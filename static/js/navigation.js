function navInit() {

	var sidebar = $(".right-off-canvas-menu .off-canvas-list");
	var label = sidebar.find(".top");
	sidebar.find(".prot").remove();
	if (user.username) {
		sidebar.prepend("<li class='prot'><a href='./' onclick='logout();'>Logout</a></li>");
		sidebar.prepend("<li class='prot'><a href='#profile/"+user.username+"/update'>Update Profile</a></li>");
		sidebar.prepend("<li class='prot'><a href='#profile/"+user.username+"'><div class='profile-photo inline' style='background-image:url("+config.mu.xs+(user.photo || config.defaults.profilePhoto)+");'></div>"+user.fullname+"</a></li>");
	} else {
		sidebar.prepend("<li class='prot'><a href='#' data-reveal-id='login-modal'>Login</a></li>");
	}

	label.remove();
	sidebar.prepend(label);

	$("#login-form").submit(function() {
		$(this).addClass("loading");
		login($(this));
		return false;
	});
	$(document).on('opened.fndtn.reveal', '[data-reveal]', function () {
		$(this).find("input[type=text]").focus();
	});


	$(document).foundation("reflow");

}
