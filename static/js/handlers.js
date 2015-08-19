
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
