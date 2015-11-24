
var handlers = [
	["/departments", departmentHandler],
	["/departments/.*", departmentHandler],
	["/departments/.*/.*", departmentHandler],
	["/collegian", collegianHandler],
	["/collegian/.*/.*", collegianHandler],
	["/download_photos", downloadPhotosHandler],
    ["/form/.*", formHandler],
	["/profile/.*/update", updateProfileHandler],
	["/profile/.*", profileHander],
	["/roles/.*", rolesHandler],
	["/roles/.*/.*", rolesHandler],
    ["/search/.*", searchHandler],
	["/super_search.*", superSearchHandler],
	["/upload/.*", uploadHandler],
	["/volunteer", volunteerHandler],
	["/.*", pageHandler],
	[".*", indexHandler]
];

function hasher() {
	checkLogin(function() {
		var title = window.location.hash.substr(1).replace(/\//g," | ").replace(/_/g," ").replace(/\./g," ").capitalize();
		document.title = config.title + title;

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

function collegianHandler(collegian) {
    function getYearByIssue(volume) {
        var s = 1915+(volume*1);
        return s+"-"+(s+1);
    }
    function setIssue(issue) {
        var cf = $("#collegianFrame").addClass("loading").find("iframe").attr("src",issue.url);
        document.getElementById("viewCollegianFullscreen").href = issue.url;
        document.getElementById("viewCollegianPDF").href = issue.pdf;
    }

    loader(main, "departments/collegian/index.html", function() {
        $("#collegianFrame iframe").load(function() {
            $(this).parent().removeClass("loading");
        }).parent().prepend(spinner);
        $.get(config.defaults.collegianURL+"?list", function(data) {
            data = JSON.parse(data);
            var issues = [];
            for (i in data) {
                var issue = {
                    name: data[i],
                    url: config.defaults.collegianURL+data[i],
                    volume: data[i].split("_")[2].substr(1)*1,
                    issue: data[i].split("_")[3].substr(1)*1,
                    thumb: config.defaults.collegianURL+data[i]+"/pageflipdata/page0_th.jpg",
                    cover: config.defaults.collegianURL+data[i]+"/pageflipdata/page0.jpg"
                }
                issue.pdf = config.defaults.collegianURL.replace("archives","pdfs")+getYearByIssue(issue.volume)+"/"+issue.name+".pdf";
                issues.push(issue);
            }
            issues = issues.sort(function(a,b) {
                if (a.volume == b.volume) return a.issue < b.issue;
                else return a.volume < b.volume;
            });

            setIssue(issues[0]);
            var ic = $("#collegianArchives");
            for (var i = 0; i < issues.length; i++) {
                if ((i > 0 && issues[i].volume != issues[i-1].volume) || i == 0) {
                    ic.append("<hr><h4>Volume "+issues[i].volume+"</h4><hr>");
                }
                var block = $("<li id='issue_"+i+"'><img src='"+issues[i].thumb+"'><h5>Issue "+issues[i].issue+"</h5></li>")
                block.click(function() {
                    var issue = issues[$(this).attr("id").replace("issue_","")];
                    setIssue(issue);
                });
                ic.append(block);
            }
        });
	});
}

function departmentHandler(department, page) {
    if (department == undefined) department = "";
    if (page == undefined) page = "index";
    loader(main, "departments/"+department+"/"+page+".html", function(xhr) {
        if (xhr.status == 404) window.location.href = "#/departments";
    });
}

function downloadPhotosHandler() {
	if (!user) {
		window.location.href = "#";
		return;
	}
	loader(main, "static/html/roles/download_photos.html", function() {
		$.get(config.defaults.mediaURL+"listProfilePhotos.php?wwuid="+user.wwuid+"&year="+config.defaults.year).then(function(data) {
			$.each(JSON.parse(data), function(i, d) {
				var url = config.defaults.mediaURL+"img-sm/"+d;
				$("#profilePhotos").append("<li><a href='"+url.replace("img-sm/","")+"' download='"+url.split("/").reverse()[0]+"' target='_blank'><img src='"+url+"'></a></li>");
			});
		});
	});
}

function formHandler(id) {
    var knownForms = [
        {"id": "e668070a-cff1-4999-8c42-32fa060d2f5b", "name": "district3"}
    ];
    if (!user) {
        window.location.href = "#";
        return;
    }
    for (var k in knownForms) {
        if (knownForms[k].name == id) {
            window.location.href = "#/form/"+knownForms[k].id;
            return;
        }
    }
    getForm(id, main);
}

function pageHandler(path1, path2) {
  var path = path1+(path2 ? "/"+path2 : "")+".html";
  loader(main, "static/html/"+path, function(xhr) {
    if (xhr.status > 400)
      window.location.href = "#";
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
            $("#getVolunteerData").click(function() {
                $.ajax({
					url: config.server+"volunteer/"+data.wwuid,
					beforeSend: setAuthHeaders,
					success: function(data) {
                        $("#getVolunteerData").replaceWith("<br><h4>Volunteer Data</h4><ul id='volunteerData'></ul>");
                        $.each(data, function(key, value) {
                            if (value !== "" && value !== "0" && value !== "False" && ["id","user_id","wwuid","updated_at"].indexOf(key) < 0)
                            $("#volunteerData").append("<li>"+key+" = "+(value == "1" ? "True" : value)+"</li>");
                        });
                    }
                });
            });
        }, true);
    });
}

function rolesHandler(role, opt) {
  if (role == undefined || role.length < 4)
    var role = "administrator";
	role = role.replace(" ","_").toLowerCase();
  if (!user || (user.roles.indexOf("administrator") < 0 && user.roles.indexOf(role) < 0)) {
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
        url: config.server+"role/"+role,
        method: "POST",
				beforeSend: setAuthHeaders,
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
		if (role == "download_photos") {
			if (!opt || opt.length !== 7) opt = user.wwuid;
			$.get(config.defaults.mediaURL+"listProfilePhotos.php?wwuid="+opt+"&year="+config.defaults.year).then(function(data) {
				$.each(JSON.parse(data), function(i, d) {
					var url = config.defaults.mediaURL+"img-sm/"+d;
					$("#profilePhotos").append("<li><a href='"+url.replace("img-sm/","")+"' target='_blank'><img src='"+url+"'></a></li>");
				});
			});
		}
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
				"<a href='#/super_search' class='button expand warning'>Or try a Super Search!</a>"+
        "</div></div>");
      setData();
      return;
    } else if (data.length == 1) {
      window.location.href = "#/profile/"+data[0].username+((y && y != config.defaults.year) ? "/"+y : "");
      return;
    }
		data = data.sort(function(a, b) {
			if (a.views*1 > b.views*1) return -1;
			else if (b.views*1 > a.views*1) return 1;
			else return 0;
		});
    for (var d = 0; d < data.length; d++) {
      var tag = data[d].username.replace(/\./g,"-");
      var link = "#/profile/"+data[d].username+((y && y != config.defaults.year) ? "/"+y : "");
      sr.append("<li><a id='profile-"+tag+"' href='"+link+"'>"+
        "<div class='profile-photo fill'></div>"+
        "<h5 class='profile-full_name' style='color:white;'></h5>"+
        "</a></li>");
      setProfileData(data[d], $("#profile-"+tag));
    }
    setData();
  });
}

function superSearchHandler() {
  function newRow() {
    var columns = ["name","gender","birthday","email","phone","website","majors","minors","graduate","preprofessional","class_standing","high_school","class_of","relationship_status","attached_to","quote","quote_author","hobbies","career_goals","favorite_music","favorite_movies","favorite_books","favorite_food","pet_peeves","personality"];
    var newinput = $("<div class='row collapse prefix'>"+
              "<div class='small-4 columns'>"+
                "<select class='prefix set-key'>"+
                  columns.map(function(c, i) { return "<option value='"+c+"'>"+c.replace("_"," ").capitalize()+"</option>"})+
                "</select>"+
              "</div>"+
              "<div class='small-8 columns insert-input-here'></div>"+
            "</div>");
		setInputByKey(newinput, "name");
		$("#superSearchForm").append(newinput);
		$("#superSearchForm select.set-key").change(function() {
			setInputByKey($(this).parent().parent(), $(this).val());
		});
  }
  loader(main, "static/html/super_search.html", function() {
    newRow();
    $("#superSearchForm").submit(function(event) {
      event.preventDefault();
      var qString = [];
			$.each($(this).serializeArray(), function(i, obj) {
				if (obj.name == "name") qString.push(obj.value);
				else qString.push(obj.name+"="+obj.value);
			});
			var year = $("#searchYearInput").val();
			if (year == config.defaults.year) year = "";
			window.location.href = "#/search/"+qString.join(";")+"/"+year;
    });
		$("#addAField").click(function() { newRow(); });
		$("#searchButton").click(function() { $("#superSearchForm").submit(); });
  });
}

function uploadHandler(x, y) {
  loader(main, "static/html/upload.html");
}

function updateProfileHandler(username) {
    if (!user || (username !== user.username && user.roles.indexOf("administrator") < -1)) {
        indexHandler();
        return;
    }
    loader(main, "static/html/profile.html #updateForm", function() {
        getProfile(username, undefined, function(data) {
            setProfileData(data, main);
        }, true);
        $("#updateForm").submit(function() {
            updateProfile(username);
            return false;
        });
        $("#goToVolunteerLink").on("click", function(event) {
            event.preventDefault();
            updateProfile(username, true);
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
