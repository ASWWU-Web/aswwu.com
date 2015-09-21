
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
  loader(main, "static/html/"+path);
}

function profileHander(username, year) {
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
      updateProfile(name,"send");
      return false;
    });
  });
}

function searchHandler(q, y) {
  if (!y)
    y = config.defaults.year;
  main.html("<div class='row'><ul id='searchResults' class='small-block-grid-2 medium-block-grid-3 large-block-grid-4'></ul></div>");
  var sr = $("#searchResults");
  getProfile(q, y, function(data) {
    if (data.results.length == 0) {
      main.html("<div class='row'><div class='small-10 small-offset-1 columns'><br>"+
        "<h2 style='color:white;'>Nothing to see here. Try searching again</h2>"+
        "<input type='text' class='autocomplete-search autofocus' placeholder='Searcheth again!'>"+
        "</div></div>");
      setData();
      return;
    } else if (data.results.length == 1) {
      window.location.href = "#/profile/"+data.results[0].username+((y && y != config.defaults.year) ? "/"+y : "");
      return;
    }
    for (d in data.results) {
      var tag = data.results[d].username.replace(/\./g,"-");
      var link = "#/profile/"+data.results[d].username+((y && y != config.defaults.year) ? "/"+y : "");
      sr.append("<li><a id='profile-"+tag+"' href='"+link+"'>"+
        "<div class='profile-photo fill'></div>"+
        "<h5 class='profile-fullname' style='color:white;'></h5>"+
        "</a></li>");
      setProfileData(data.results[d], $("#profile-"+tag));
    }
  });
}

function volunteerHandler() {
  if (!user.wwuid) {
    main.html("<div class='row'><div class='small-12 columns'>"+
      "<h1 style='color:white;'>You must login to access this page</h1><br>"+
      "<h3><a href='#' data-reveal-id='login-modal' style='color:white;'>Login</a></h3>"+
      "</div></div>");
    return;
  }
  loader(main, "static/html/volunteer.html", function() {
    getVolunteer(function(data) {
      setVolunteerData($("#volunteerForm .small-12"), data);
    });
  });
}
