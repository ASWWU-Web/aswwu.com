
var handlers = [
    ["/departments", departmentHandler],
    ["/departments/.*", departmentHandler],
    ["/departments/.*/.*", departmentHandler],
    ["/collegian", collegianHandler],
    ["/collegian/.*/.*", collegianHandler],
    ["/collegian_article/.*/.*/.*/.*", collegianArticleHandler],
    ["/collegian_articles_by_section/.*", collegianFindArticleHandler],
    ["/election", electionHandler],
    ["/senate_election", senateElectionHandler],
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

function collegianHandler(sv,si) {
    var sections = ["ACA/SM", "Alumni Note", "Art", "Backpage", "Blast from the Past", "Creative Writing", "Columns", "Culture", "Diversions", "Editor's Note", "Feature", "Food", "Humor", "News", "Opinion", "We of WWU", "Religion", "Science and Tech", "Sports"];
    function getYearByIssue(volume) {
        var s = 1915+(volume*1);
        return s+"-"+(s+1);
    }
    function setIssue(issue) {
        var cf = $("#collegianFrame").addClass("loading").find("iframe").attr("src",issue.url);
        // document.getElementById("viewCollegianFullscreen").href = issue.url;
        // document.getElementById("viewCollegianPDF").href = issue.pdf;
        var $toc = $("#tableOfContents");
        $toc.html('<h4>Table of Contents</h4>');
        $.each(sections, function(i,section) {
            var $div = $("<div class='large-12 medium-4 small-6 columns'></div>");
            $div.append($("<button class='button tiny' style='width:100%;'>"+section+"</button>").click(function() {
              window.location.href = '#/collegian_articles_by_section/'+section;
              // $('#section-title').html('<h4 style="color: black;">'+section+' <small><i>in Volume '+issue.volume+', Issue '+issue.issue+'</h4>');
              // $.get(config.server+"collegian_search/?volume="+issue.volume+"&issue="+issue.issue+"&section="+section, function(data) {
              //     $('#article-list').html('<ul></ul>');
              //     $.each(data.articles, function(i,d) {
              //         $('#article-list ul').append(
              //             "<li><a href='#/collegian_article/"+d.volume+"/"+d.issue+"/"+d.section.replace(/\//g,'|')+"/"+encodeURI(d.title)+"'>"+d.title+"</a></li>"
              //         );
              //     });
              //     if ($("#article-list ul").children().length == 0) {
              //         $("#article-list").append("<li><a>No articles, yet!</a></li>");
              //     }
              //     $('#article-modal a').click(function() {
              //       $('#article-modal').foundation('reveal','close');
              //     })
              //     $('#article-modal').foundation('reveal','open');
              // });
            }));
            // $div.append("<button data-dropdown='"+section.replace(/ /g,'_').replace(/\//g,'')+"-links' class='button tiny dropdown'>"+section+"</button>");
            // $div.append("<ul id='"+section.replace(/ /g,'_').replace(/\//g,'')+"-links' data-dropdown-content class='f-dropdown'></ul>");
            $toc.append($div);
        });
        // $.get(config.server+"collegian_search/?volume="+issue.volume+"&issue="+issue.issue, function(data) {
        //     $('#article-list').html('<ul></ul>');
        //     $.each(data.articles, function(i,d) {
        //         // $("#"+d.section.replace(/ /g,"_").replace(/\//g,'')+"-links").append(
        //         $('#article-list ul').append(
        //             "<li><a href='#/collegian_article/"+d.volume+"/"+d.issue+"/"+d.section.replace(/\//g,'|')+"/"+d.title+"'>"+d.title+"</a></li>"
        //         );
        //     });
        //     $.each(sections, function(i,s) {
        //         // if ($("#"+s.replace(/ /g,"_").replace(/\//g,"")+"-links").children().length == 0) {
        //         //     $("#"+s.replace(/ /g,"_").replace(/\//g,"")+"-links").append("<li><a>No articles, yet!</a></li>");
        //         // }
        //         if ($("#article-list ul").children().length == 0) {
        //             $("#article-list").append("<li><a>No articles, yet!</a></li>");
        //         }
        //     });
        //     $(document).foundation('dropdown', 'reflow');
        // });
    }

    loader(main, "departments/collegian/index.html", function() {
        $("#collegianFrame iframe").load(function() {
            $(this).parent().removeClass("loading");
        }).parent().prepend(spinner);
        $.get(config.defaults.collegianURL+"?list", function(data) {
            data = JSON.parse(data);
            var issues = [];
            var current = "";
            for (i in data) {
                var inum = data[i].split('i')[1];
                if (inum.length == 1) {
                  data[i].replace("i"+inum, "i0"+inum);
                }
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
                if (current == "" || (issue.volume >= current.volume && issue.issue >= current.issue))
                    current = issue;
            }
            issues = issues.sort(function(a,b) {
                if (a.volume == b.volume) return b.issue - a.issue;
                else return b.volume - a.volume;
            });

            if (sv && si) {
                sv = sv.replace("v","");
                si = si.replace("i","");
                var selected = issues.filter(function(a) {return a.volume == sv && a.issue == si;});
                if (selected.length == 1) current = selected[0];
            }

            setIssue(current);
            var ic = $("#collegianArchives");
            for (var i = 0; i < issues.length; i++) {
                if ((i > 0 && issues[i].volume != issues[i-1].volume) || i == 0) {
                    ic.append("<hr><h4>&nbsp;&nbsp;Volume "+issues[i].volume+"</h4><hr>");
                }
                var block = $("<li id='issue_"+i+"'><img src='"+issues[i].thumb+"'><h5>Issue "+issues[i].issue+"</h5></li>")
                block.click(function() {
                    var issue = issues[$(this).attr("id").replace("issue_","")];
                    window.location = '#/collegian/'+issue.volume+'/'+issue.issue;
                    // setIssue(issue);
                });
                ic.append(block);
            }
        });
	});
}

function collegianArticleHandler(volume,issue,section,title) {
    loader(main, "departments/collegian/article.html", function(xhr) {
        $.get(config.server+"collegian_search/?volume="+volume+"&issue="+issue+"&section="+section.replace(/\|/g,'/')+"&title="+title, function(data) {
            if (data.articles && data.articles.length == 1) {
                var article = data.articles[0];
                $.each(article, function(key, value) {
                    $("#collegian-"+key).html(value);
                });
                var link = encodeURIComponent(window.location.href);
                document.getElementById('fb-link').href += link;
                document.getElementById('tw-link').href += link;
            }
        });
    });
}

function collegianFindArticleHandler(section) {
  if (section == "ACA") section = "ACA/SM";
  main.html('<div class="row"><h2>Articles in '+section.capitalize()+'</h2><hr><ul></ul></div>');
  var div = "<div class='small-12 columns'><h3><span class='article-title'></span><i style='font-size: 0.75em;'> by: </i><span class='article-author'></span> (Volume <span class='article-volume'></span>, Issue <span class='article-issue'></span>)</h3></div>";
  $.get(config.server+"collegian_search/?section="+section.replace(/\|/g,'/'), function(data) {
    data.articles = data.articles.sort(function(a,b) {
      return b.issue*1-a.issue*1;
    });
    $.each(data.articles, function(i, article) {
      var articleDiv = $("<li><a href='#/collegian_article/"+article.volume+"/"+article.issue+"/"+article.section.replace(/\//g,'|')+"/"+encodeURI(article.title)+"'>"+div+"</a></li>");
      $.each(article, function(key, value) {
        articleDiv.find('.article-'+key).html(value);
      });
      $('main ul').append(articleDiv);
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

function electionHandler() {
  if (!user.wwuid) {
      main.html("<div class='row'><div class='small-12 columns'>"+
                  "<h1 style='color:white;'>You must login to access this page</h1><br>"+
                  "<h3><a href='https://saml.aswwu.com?redirectURI=/#/election' style='color: white;'>Login</a></h3>"+
                  "</div></div>");
      return;
  }
  loader(main, "static/html/election.html", function() {
    var electionData = {president: '', executive_vp: '', social_vp: '', spiritual_vp: ''};
    function setElectionSelects() {
      $(".selected").removeClass('selected');
      $.each(electionData, function(k, v) {
        if ($('[data-name="'+v+'"]').length == 0) {
          $('input[data-position="'+k+'"]').val(v.capitalize());
        } else {
          $('input[data-position="'+k+'"]').val('');
          $('[data-name="'+v+'"]').addClass('selected');
        }
      });
    }
    $('.profile').click(function() {
      var position = $(this).data('position');
      var name = $(this).data('name');
      electionData[position] = name;
      setElectionSelects();
    });
    $("input").blur(function() {
      var position = $(this).data('position');
      var value = $(this).val();
      if (value != "" && position != "") {
        electionData[position] = value.toLowerCase();
        setElectionSelects();
      }
    });
    $.ajax({
      url: config.server+"election",
      beforeSend: setAuthHeaders,
      method: "GET",
      success: function(data) {
        if (data.vote) {
          electionData = data.vote;
          setElectionSelects();
        }
      }
    });
    $("#electionForm").submit(function(event) {
      event.preventDefault();
      $.ajax({
        url: config.server+"election",
        beforeSend: setAuthHeaders,
        method: "POST",
        data: electionData,
        success: function(data) {
          if (data.vote) {
            $(".response").text("Thank you for your vote!").show().delay(2500).fadeOut();
            electionData = data.vote;
            setElectionSelects();
          } else {
            $(".errors").text(data.error.capitalize()).show().delay(2500).fadeOut();
          }
        }
      });
    });
  });
}

function senateElectionHandler() {
   if (!user.wwuid) {
      main.html("<div class='row'><div class='small-12 columns'>"+
                  "<h1 style='color:white;'>You must login to access this page</h1><br>"+
                  "<h3><a href='https://saml.aswwu.com?redirectURI=/#/senate_election' data-reveal-id='login-modal' style='color: white;'>Login</a></h3>"+
                  "</div></div>");
      return;
  }
  loader(main, "static/html/senate_election.html", function() {
    var votes = [];       // variable holding district 1-12 votes
    var SMvotes = [];     // variable holding district 13 votes
    var qResponse = "";   // variable holding response to question

    // Controls highlighting on profile pictures
    function reDraw() {
      $(".selected").removeClass('selected'); // Unselect all previous choices

      // Update districts 1-12
      $.each(votes, function(k, v) {
        $(".profile[data-name='"+v.name+"']").addClass('selected');
      });

      // Update district 13
      $.each(SMvotes, function(k, v) {
        $(".profile[data-name='"+v.name+"']").addClass('selected');
      });
    }

    // Clears textboxes that don't contain vote choices
    // function resetText() {
    //   var selDis;
    //
    //   // Check district 1-12 boxes
    //   if(votes.length > 0) {
    //     // select the textboxes for the appropriate district
    //     selDis = votes[0].district;
    //     var box1 = $("#"+selDis+"").find('.write-in1');
    //     var box2 = $("#"+selDis+"").find('.write-in2');
    //     // if there are two votes, check the boxes against both votes
    //     if(votes.length == 2) {
    //
    //       if((box1.val().toLowerCase() != votes[0].name) && (box1.val().toLowerCase() != votes[1].name)) {
    //         box1.val('');
    //       }
    //       if((box2.val().toLowerCase() != votes[0].name) && (box2.val().toLowerCase() != votes[1].name)) {
    //         box2.val('');
    //       }
    //     // if there is only one vote, only check the boxes against that vote
    //     } else {
    //       if(box1.val().toLowerCase() != votes[0].name) {
    //         box1.val('');
    //       }
    //       if(box2.val().toLowerCase() != votes[0].name) {
    //         box2.val('');
    //       }
    //     }
    //
    //     if(box1.val().toLowerCase() == box2.val().toLowerCase()) {
    //       box2.val('');
    //     }
    //
    //     // Remove any text that is written in other districts
    //     for(i = 1; i < 12; i++) {
    //       if(i != selDis) {
    //         $("#"+i+"").find('.write-in1').val('');
    //         $("#"+i+"").find('.write-in2').val('');
    //       }
    //     }
    //   }
    //   // Check district 13 boxes
    //   if(SMvotes.length > 0) {
    //     var box1 = $("#13").find('.write-in1');
    //     var box2 = $("#13").find('.write-in2');
    //     if(SMvotes.length == 2) {
    //
    //       if((box1.val().toLowerCase() != SMvotes[0].name) && (box1.val().toLowerCase() != SMvotes[1].name)) {
    //         box1.val('');
    //       }
    //       if((box2.val().toLowerCase() != SMvotes[0].name) && (box2.val().toLowerCase() != SMvotes[1].name)) {
    //         box2.val('');
    //       }
    //     } else {
    //       if(box1.val().toLowerCase() != SMvotes[0].name) {
    //         box1.val('');
    //       }
    //       if(box2.val().toLowerCase() != SMvotes[0].name) {
    //         box2.val('');
    //       }
    //     }
    //
    //     if(box1.val().toLowerCase() == box2.val().toLowerCase()) {
    //       box2.val('');
    //     }
    //   }
    //
    // }

    // hide and show districts based on drop-down box
    $('.district').hide();
    $('#districtChoice').change(function () {
      $('.district').hide();
      $('#'+$(this).val()).show();
    //   if(document.getElementById('SMcheck').checked) {
    //     $('#13').show();
    //   }
    });

    // // hide the SM district behind a checkbox
    // $('#SMcheck').change(function() {
    //   if(this.checked) {
    //     $('#13').show();
    //   } else {
    //     $('#13').hide();
    //     SMvotes.pop();
    //     SMvotes.pop();
    //     reDraw();
    //     resetText();
    //   }
    // });

    // control voting via profile clicks
    $('.profile').click(function() {
      var name = $(this).data('name');
      var district = $(this).data('district');

      // handle SM district votes
      if(district == 13) {
        SMvotes.unshift({'name': name});
        if(SMvotes.length > 2) {
          SMvotes.pop();
        }
        if(SMvotes.length == 2) {
          if(SMvotes[0].name == SMvotes[1].name) {
            SMvotes.pop();
          }
        }
        console.log('SM District votes:');
        console.log(SMvotes);
      // handle other district votes
      } else {
        votes.unshift({'name': name, 'district': district});
        // if you've voted more than twice, remove the first selection
        if(votes.length > 2) {
          votes.pop();
        }
        // if you've got two votes in
        if(votes.length == 2) {
            votes.pop();
          // only allow a person to be selected once
        //   if(votes[0].name == votes[1].name) {
        //     votes.pop();
        //   }
          // only allow two votes from the same district
          if((votes.length == 2) && (votes[0].district != votes[1].district)) {
            votes.pop(); //delete both choices and re-add the last choice
            votes.pop();
            votes.unshift({'name': name, 'district': district});
          }
        }
        console.log('District 1-12 votes:');
        console.log(votes);
      }
      reDraw();
    //   resetText();

    });

    // control voting based on write-in boxes
    $('[class^="write-in"]').blur(function() {
      var name = $(this).val();
      var district = $(this).parent().parent().attr('id');
      if(name != "") {
        if(district == 13) {
          SMvotes.unshift({'name': name.toLowerCase()});
          if(SMvotes.length > 2) {
            SMvotes.pop();
          }
          if(SMvotes.length == 2) {
            if(SMvotes[0].name == SMvotes[1].name) {
              SMvotes.pop();
            }
          }
          console.log('SM District votes:');
          console.log(SMvotes);
        } else {
          votes.unshift({'name': name.toLowerCase(), 'district': district});
          if(votes.length > 2) {
            votes.pop();
          }
          if(votes.length == 2) {
            if(votes[0].name == votes[1].name) {
              votes.pop();
            }
            if((votes.length == 2) && (votes[0].district != votes[1].district)) {
              votes.pop();
              votes.pop();
              votes.unshift({'name': name.toLowerCase(), 'district': district});
            }
          }
          console.log('District 1-12 votes:');
          console.log(votes);
        }
      }

      reDraw();
      resetText();

    });

    // get response to question
    $('.question').blur(function () {
      var answer = $(this).val();
      if(answer != "") {
        qResponse = answer;
        console.log('Answer');
        console.log(qResponse);
      }
    });

    //Submit ballot
    $("#senateForm").submit(function(event) {
      console.log("Submit");
      event.preventDefault();

      var dis;
      if(votes.length > 0) {
        dis = votes[0].district;
      }

      var getName = function(index, isSM){
         if(isSM){
             if(index in SMvotes && SMvotes[index] !== undefined){
                 return SMvotes[index].name;
             } else {
                 return "";
             }
         }else {
             if(index in votes && votes[index] !== undefined){
                 return votes[index].name;
             }else {
                 return "";
             }
         }
     };
    can1 = getName(0,false);
    can2 = getName(1,false);
    sm1 = getName(0,true);
    sm2 = getName(1,true);
    $.ajax({
    url: config.server+"senate_election/vote/" + user.username,
    beforeSend: setAuthHeaders,
    method: "POST",
    data: {"wwuid": user.wwuid, "candidate_one": can1, "candidate_two": can2, "sm_one": sm1, "sm_two": sm2, "new_department": qResponse, "district": dis},
    success: function(data) {
        if (data.vote) {
            $(".response").text("Thank you for your vote!").show().delay(2500).fadeOut();
        } else {
            $(".error").text(data.error.capitalize()).show().delay(2500).fadeOut();
        }
    },
    error: function(data) {
        $(".error").text(data.statusText).show().delay(2500).fadeOut();
    }
      });
    });
  });
}

function formHandler(id) {
    var knownForms = [
      {"id": "e814923b-2c36-43ca-883b-f0875941ee1e", "name": "raft_trip"},
      {"id": "685ba151-fab4-4aa9-9c0e-a71bef33dfb4", "name": "surf_trip"}
    ];
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
    if (role == "collegian_admin") {
        role = "collegian";
        var collegianAdmin = true;
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
                    if (data.errors || data.error) {
                        if (data.errors)
                            var errors = data.errors.join("<br>");
                        else
                            var errors = data.error;
                        $form.find(".errors").text(errors).show().delay(2500).fadeOut();
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
		} else if (role == "collegian") {
            $("#findCollegianArticlesForm").submit(function(e) {
                e.preventDefault();
                var data_string = $(this).serializeArray().map(function(a) {
                    return a.name+"="+a.value;
                }).join("&");
                if (!collegianAdmin) data_string += "&author="+user.full_name;
                $.get(config.server+"collegian_search/?"+data_string, function(data) {
                    $("#results").html('');
                    $.each(data.articles, function(i, ca) {
                        $("#results").append("<div class='row'>"+
                            "<div class='small-12 columns align-left'>"+
                                "<i>"+ca.title+"</i> by <a href='#/profile/"+ca.author+"' target='_blank'>"+ca.author+"</a>"+
                                " - Volume: "+ca.volume+", Issue: "+ca.issue+", Section: "+ca.section+" - "+
                            "</div></div>");
                        $("#results > div:last-child > div").append($("<button class='small'>Edit</button>").click(function() {
                            $("#addOrUpdate input, #addOrUpdate select").each(function(i, inp) {
                                inp.value = ca[inp.name];
                            });
                            // tinymce.get("contentTinyMCE").setContent(ca.content);
                        }));
                    });
                });
            });
        }
    });
}

var searchResults;
var searchYear;
function searchHandler(q, y) {
	  searchResults = null;
    searchYear = y;
    if (!y) y = config.defaults.year;
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
        main.append(spinner);
    		searchResults = data;
    		nextProfile = 0;
    		$(window).off("scroll");
    		$(window).scrollStopped(checkBottom);
      	addMoreProfiles();
        setData();
    });
}

var nextProfile = 0;
function addMoreProfiles() {
	var y = searchYear;
	var sr = $("#searchResults");
	if(sr.length ==0) {
		$(window).off("scroll");
		return;
	}
	var countTo = nextProfile + 23;
	for (var d = nextProfile; d <= countTo; d++) {
		if(d >= searchResults.length) {
			$(".spinner").remove();
			$(window).off("scroll");
			return;
		}
		nextProfile++;
		var tag = searchResults[d].username.replace(/\./g,"-");
		var link = "#/profile/"+searchResults[d].username+((y && y != config.defaults.year) ? "/"+y : "");
		sr.append("<li><a id='profile-"+tag+"' href='"+link+"'>"+
			"<div class='profile-photo fill'></div>"+
			"<h5 class='profile-full_name' style='color:white;'></h5>"+
			"</a></li>");
		setProfileData(searchResults[d], $("#profile-"+tag));
	}
}
$.fn.scrollStopped = function(callback) {
  var that = this, $this = $(that);
  $this.scroll(function(ev) {
    clearTimeout($this.data('scrollTimeout'));
    $this.data('scrollTimeout', setTimeout(callback.bind(that), 250, ev));
  });
};




function checkBottom() {
	var totalHeight, currentScroll, visibleHeight;
	if (document.documentElement.scrollTop)
		{ currentScroll = document.documentElement.scrollTop; }
	else
		{ currentScroll = document.body.scrollTop; }
	totalHeight = $("#searchResults").height();
	visibleHeight = document.documentElement.clientHeight;

	if (totalHeight <= currentScroll + visibleHeight )
	{
		addMoreProfiles();
	}
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
                    "<h3><a href='https://saml.aswwu.com?redirectURI=/#/volunteer' data-reveal-id='login-modal' style='color: white;'>Login</a></h3>"+
                    "</div></div>");
        return;
    }
    loader(main, "static/html/volunteer.html", function() {
        getVolunteer(function(data) {
            setVolunteerData($("#volunteerForm .small-12"), data);
        });
    });
}
