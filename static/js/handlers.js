
function indexHandler() {
  $("#background").removeClass("hash");
  loader(main, "static/html/home.html", function() {
    setData();
  });
  if (window.location.hash.length > 1) {
    window.location.hash = "";
  }
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
    if (data.results.length == 1) {
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
