
function indexHandler() {
  $("#background").removeClass("hash");
  loader(main,main.data("html"));
}

function profileHander(username, year) {
  loader(main, "static/html/profile.html #full-profile", function() {
    getProfile(username, year, function(data) {
      setProfileData(data, main);
    });
  });
}

function updateProfileHandler(username) {
  updateProfile(username);
}

function searchHandler(q, y) {
  y = 1415;
  main.html("<div id='searchResults' class='row'></div>");
  var sr = $("#searchResults");
  getProfile(q, y, function(data) {
    for (d in data.results) {
      var tag = data.results[d].username.replace(/\./g,"-");
      sr.append("<div id='profile-"+tag+"' class='medium-3 small-6 columns'><div class='profile-photo fill'></div></div>");
      setProfileData(data.results[d], $("#profile-"+tag));
    }
  });
}
