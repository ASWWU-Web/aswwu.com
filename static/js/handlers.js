
var handlers = [
	["/departments", departmentHandler],
	["/departments/.*", departmentHandler],
	["/collegian", collegianHandler],
	["/collegian/.*/.*", collegianHandler],
	["/profile/.*/update", updateProfileHandler],
	["/profile/.*", profileHander],
	["/roles/.*", rolesHandler],
  ["/search/.*", searchHandler],
	["/super_search", superSearchHandler],
	["/upload/.*", uploadHandler],
	["/volunteer", volunteerHandler],
	["/.*", pageHandler],
	[".*", indexHandler]
];

function hasher() {
	checkLogin(function() {
		var hash = window.location.hash.substr(1);
		for (var h in handlers) {
			var path = handlers[h][0].replace(/\//g,"\\\/");
			var r = new RegExp(path);
			var m = hash.match(path);
			if (m && m[0] === hash) {
				m = path.split("\\\/");
				hash = hash.split("/").filter(function(i) { return m.indexOf(i) < 0; });
				$("#background").addClass("hash");
				handlers[h][1].apply(this, hash);
				return true;
			}
		}
	});
}

function indexHandler() {
  $("#background").removeClass("hash");
  loader(main, "static/html/home.html", function() {
    setData();
  });
  if (window.location.hash.length > 1) {
    window.location.hash = "";
  }
}

function pageHandler(path1, path2) {
  var path = path1+(path2 ? "/"+path2 : "")+".html";
  loader(main, "static/html/"+path, function(xhr) {
    if (xhr.status > 400)
      window.location.href = "#";
  });
}

function rolesHandler(role) {
  if (role == undefined || role.length < 4)
    var role = "administrator";
  if (!user && user.roles.indexOf("administrator") < 0 && user.roles.indexOf(role) < 0) {
    window.location.hash = "";
    return;
  }
  loader(main, "static/html/roles/"+role+".html", function(xhr) {
    if (xhr.status == 404) {
      window.location.href = "#";
      return;
    }
    setData();
    main.find("form").not(".no-set").submit(function(event) {
      event.preventDefault();
      var $form = $(this);
      $.ajax({
        url: au()+"&cmd=roles&role="+role,
        method: "POST",
        dataType: "JSON",
        data: $(this).serializeArray(),
        success: function(data) {
          if (data.errors) {
            $form.find(".errors").text(data.errors.join("<br>")).show().delay(1000).fadeOut();
          } else if (data.response) {
            $form.find(".response").text(data.response.capitalize()).show().delay(1000).fadeOut();
            $form.trigger("reset");
          } else {
            $form.trigger("reset");
            console.log(data);
          }
        },
        error: function(data) {
          console.error(data);
        }
      });
    });
  });
}

function profileHander(username, year) {
  if (username.split(" ").length > 1) {
    window.location.href = window.location.href.replace(username,username.replace(" ",".").toLowerCase());
    return;
  }
  loader(main, "static/html/profile.html #full-profile", function() {
    getProfile(username, year, function(data) {
      setProfileData(data, main);
    });
  });
}

function uploadHandler(x, y) {
  loader(main, "static/html/upload.html");
}

function updateProfileHandler(username) {
  if (username !== user.username) {
    indexHandler();
    return;
  }
  loader(main, "static/html/profile.html #updateForm", function() {
    getProfile(username, undefined, function(data) {
      setProfileData(data, main);
    });
    $("#updateForm").submit(function() {
      updateProfile(name);
      return false;
    });
    $("#goToVolunteerLink").on("click", function(event) {
      event.preventDefault();
      updateProfile(name, true);
    });
  });
}

function searchHandler(q, y) {
  if (!y)
    y = config.defaults.year;
  main.html("<div class='row'><ul id='searchResults' class='small-block-grid-2 medium-block-grid-3 large-block-grid-4'></ul></div>");
  var sr = $("#searchResults");
  dbSearch(q, y, function(data) {
    if (data.results) data = data.results;
    if (data.length == 0) {
      main.html("<div class='row'><div class='small-10 small-offset-1 columns'><br>"+
        "<h2 style='color:white;'>Nothing to see here. Try searching again</h2>"+
        "<input type='text' class='autocomplete-search autofocus' placeholder='Searcheth again!'>"+
        "</div></div>");
      setData();
      return;
    } else if (data.length == 1) {
      window.location.href = "#/profile/"+data[0].username+((y && y != config.defaults.year) ? "/"+y : "");
      return;
    }
    for (var d = 0; d < data.length; d++) {
      var tag = data[d].username.replace(/\./g,"-");
      var link = "#/profile/"+data[d].username+((y && y != config.defaults.year) ? "/"+y : "");
      sr.append("<li><a id='profile-"+tag+"' href='"+link+"'>"+
        "<div class='profile-photo fill'></div>"+
        "<h5 class='profile-fullname' style='color:white;'></h5>"+
        "</a></li>");
      setProfileData(data[d], $("#profile-"+tag));
    }
    setData();
  });
}

function superSearchHandler() {
  function newRow() {
    var columns = ["fullname","class_standing"];
    $("#superSearchForm").append("<div class='row collapse prefix'>"+
              "<div class='small-4 columns'>"+
                "<select class='prefix'>"+
                  columns.map(function(c, i) { return "<option value='"+c+"'>"+c.replace("_"," ").capitalize()+"</option>"})+
                "</select>"+
              "</div>"+
              "<div class='small-8 columns'>"+
                "<input type='text'>"+
              "</div>"+
            "</div>");
		$("#superSearchForm select").change(function() {
			$(this).parent().next().find("input").attr("name",$(this).val());
		});
  }
  loader(main, "static/html/super_search.html", function() {
    newRow();
    $("#superSearchForm").submit(function(event) {
      event.preventDefault();
      var qString = [];
			$.each($(this).serializeArray(), function(i, obj) {
				qString.push(obj.name+"="+obj.value);
			});
			window.location.href = "#/search/"+qString.join(";");
    });
  });
}

function volunteerHandler() {
  if (!user.wwuid) {
    main.html("<div class='row'><div class='small-12 columns'>"+
      "<h1 style='color:white;'>You must login to access this page</h1><br>"+
      "<h3><a href='#' data-reveal-id='login-modal' style='color: white;'>Login</a></h3>"+
      "</div></div>");
    return;
  }
  loader(main, "static/html/volunteer.html", function() {
    getVolunteer(function(data) {
      setVolunteerData($("#volunteerForm .small-12"), data);
    });
  });
}

function departmentHandler(department) {
  if (department == undefined) department = "";
  loader(main, "static/html/departments/"+department+"/index.html", function(xhr) {
    if (xhr.status == 404) window.location.href = "#/departments";
  });
}

function collegianHandler(collegian) {
  loader(main, "static/html/departments/collegian/index.html");
}
