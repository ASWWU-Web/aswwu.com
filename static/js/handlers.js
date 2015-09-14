
function indexHandler() {
  $("#background").removeClass("hash");
  loader(main,main.data("html"));
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
  updateProfile(username);
}

function searchHandler(q, y) {
  y = 1415;
  main.html("<div id='searchResults' class='row'></div>");
  var sr = $("#searchResults");
  getProfile(q, y, function(data) {
    if (data.results.length == 1) {
      window.location.href = "#/profile/"+data.results[0].username+(y ? "/"+y : "");
      return;
    }
    for (d in data.results) {
      var tag = data.results[d].username.replace(/\./g,"-");
      sr.append("<div id='profile-"+tag+"' class='medium-3 small-6 columns'><div class='profile-photo fill'></div></div>");
      setProfileData(data.results[d], $("#profile-"+tag));
    }
  });
}
