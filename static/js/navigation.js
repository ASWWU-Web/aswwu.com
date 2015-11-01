function navInit() {

	var accountLinks = $(".top-bar-section .right, #homeLinks");
	accountLinks.find(".accountLinks").remove();
	var d = new Date();
	var birthdate = ("0"+(d.getMonth()+1)).substr(-2)+"-"+("0"+d.getDate()).substr(-2);

	if (user.username) {
		var profile = "<a href='#/profile/"+user.username+"'><div class='profile-photo inline' style='background-image:url("+config.mu.xs+(user.photo || config.defaults.profilePhoto)+");'></div>"+user.full_name+"</a>";
		accountLinks.prepend("<li class='has-dropdown accountLinks'>"+profile+"<ul class='dropdown'></ul></li>");
		accountLinks = accountLinks.find(".accountLinks > ul");
		accountLinks.append("<li><a href='#/profile/"+user.username+"/update'>Update Profile</a></li>");
		accountLinks.append("<li><a href='#/search/birthday="+birthdate+"'>Birthdays</a></li>");
		accountLinks.append("<li><a href='#/super_search/'>Super Search</a></li>");
		accountLinks.append("<li><a href='#/download_photos'>Download Photos</a></li>");
		accountLinks.append("<li><a href='./' onclick='logout();'>Logout</a></li>");
		if (user.roles.length > 0) {
			accountLinks.append("<li class='divider'></li>");
			for (var i = 0; i < user.roles.length; i++) {
				if (user.roles[i].length > 5)
					accountLinks.append("<li><a href='#/roles/"+user.roles[i].replace(" ","_").toLowerCase()+"'>"+user.roles[i].replace("_"," ").capitalize()+" Page</a></li>");
			}
		}
	} else {
		accountLinks.prepend("<li class='has-dropdown accountLinks'><a href='#' data-reveal-id='login-modal'>Login</a><ul class='dropdown'></ul></li>");
		accountLinks = accountLinks.find(".accountLinks > ul");
		accountLinks.append("<li><a href='#/search/birthday="+birthdate+"'>Birthdays</a></li>");
		accountLinks.append("<li><a href='#/super_search/'>Super Search</a></li>");
	}


	$("#login-form").submit(function(event) {
		event.preventDefault();
		$(this).addClass("loading");
		login($(this));
	});
	$(document).on('opened.fndtn.reveal', '[data-reveal]', function () {
		$(this).find("input[type=text]").focus();
	});


	$(document).foundation("reflow");

}
