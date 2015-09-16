function navInit() {

	var accountLinks = $(".top-bar-section .left");
	accountLinks.empty();

	if (user.username) {
		var profile = "<a href='#/profile/"+user.username+"'><div class='profile-photo inline' style='background-image:url("+config.mu.xs+(user.photo || config.defaults.profilePhoto)+");'></div>"+user.fullname+"</a>";
		accountLinks.append("<li class='has-dropdown'>"+profile+"<ul class='dropdown'></ul></li>");
		accountLinks = accountLinks.find("li > ul");
		accountLinks.append("<li><a href='#/profile/"+user.username+"/update'>Update Profile</a></li>");
		accountLinks.append("<li><a href='./' onclick='logout();'>Logout</a></li>");
	} else {
		accountLinks.append("<li><a href='#' data-reveal-id='login-modal'>Login</a></li>");
		// sidebar.prepend("<li class='prot'><a href='#/upload/'>Upload Photos</a></li>");
	}

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
