function navInit() {

	var accountLinks = $(".top-bar-section .right, #homeLinks");
	accountLinks.find(".accountLinks").remove();

	if (user.username) {
		var profile = "<a href='#/profile/"+user.username+"'><div class='profile-photo inline' style='background-image:url("+config.mu.xs+(user.photo || config.defaults.profilePhoto)+");'></div>"+user.fullname+"</a>";
		accountLinks.prepend("<li class='has-dropdown accountLinks'>"+profile+"<ul class='dropdown'></ul></li>");
		accountLinks = accountLinks.find(".accountLinks > ul");
		accountLinks.append("<li><a href='#/profile/"+user.username+"/update'>Update Profile</a></li>");
		accountLinks.append("<li><a href='./' onclick='logout();'>Logout</a></li>");
	} else {
		accountLinks.prepend("<li class='accountLinks'><a href='#' data-reveal-id='login-modal'>Login</a></li>");
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
