
function getForm(id, div) {
    $.ajax({
        url: config.server+"form/"+id,
        beforeSend: setAuthHeaders,
        dataType: "JSON",
        success: function(data) {
            if (data.error) {
                console.error(data.error);
            } else {
                div.html('');
                div.html("<form id='form_"+id+"' class='small-12 columns'><div class='row'><h2>"+data.form.title.replace(/_/g, " ").capitalize()+"</h2></div><hr></form>");
                if (data.questions.length == 0) {
                  div.find('form').append('<div class="row"><h4>Sorry this form has been closed</h4></div>');
                  return;
                }
                var limits = data.form.limits.split(';').map(function(a) { return a.split('='); });
                if (data.submissions <= (limits.filter(function(a) { return a[0] == 'max'; })[0] || [,99999])[1]*1) {
                  div.find('form').append('<div class="row"><h4>All spots for this form have been filled. You will now be placed on a waitlist and receive an email if a spot opens up.</h4><hr></div>');
                }
                if (data.form.details.length > 4)
                  div.find("form").append("<div class='row'>"+data.form.details+"<hr></div>");
                var questions = data.questions;
                for (var i=0; i<questions.length; i++)
                    addQuestion(questions[i]);
                div.find("form").append("<br><div class='row'><button class='success expand' type='submit'>Save and Close!</button></div><br>");
                $("#form_"+id).submit(function(e) {
                    e.preventDefault();
                    var data = {};
                    $(this).serializeArray().map(function(a) {
                        var name = a.name.split("_")[1];
                        if (data[name] && data[name].length > 1)
                            data[name] += ",";
                        if (data[name])
                            data[name] += a.value;
                        else
                            data[name] = a.value;
                    });
                    var success = 0;
                    $.each(data, function(key, value) {
                      $.ajax({
                        url: config.server+"answer/"+key,
                        beforeSend: setAuthHeaders,
                        method: "PUT",
                        data: {'value': value},
                        dataType: "JSON",
                        success: function(data) {
                          success++;
                          if (success == questions.length) { window.location.href = "#"; }
                        },
                        error: function(data) { console.error(data); }
                      });
                    });
                });
            }
        }
    });
}

function addQuestion(question) {
    var $form = $("#form_"+question.form_id);
    var $q = $("<div class='row'></div>");
    var limits = {};
    question.limits.split(";").map(function(a) {
        var opts = a.split("=");
        if (opts.length == 2)
            limits[opts[0]] = opts[1];
    });
    if (question.type == "radio" || question.type == "checkbox" || question.type) {
        if (question.possible_values == 'None') question.possible_values = '';
        var pv = question.possible_values.split(",").map(function(a) {
            return $.trim(a);
        });
        $q.append("<div class='small-12 columns'><label><h4>"+question.label.capitalize()+"</h4>"+(question.placeholder.length > 4 ? "<h5>("+question.placeholder+")</h5>" : "")+"</label></div>");
        for (var i = 0; i < pv.length; i++) {
          $q.find("div").append("<input type='"+question.type+"' value='"+pv[i]+"' name='question_"+question.id+"' id='question_"+question.id+i+"'><label for='question_"+question.id+i+"'><h4>"+pv[i]+"</h4></label>");
        }
        if (question.type == "checkbox" && limits["max"] !== undefined) {
            var selected = [];
            $q.find("input").click(function(e) {
                if (selected.indexOf(this.id) > -1) {
                    var id = this.id;
                    selected = selected.filter(function(a) { return a !== id; });
                    return;
                }
                selected.push(this.id);
                if (selected.length > limits["max"]) {
                    $("#"+selected.shift()).attr("checked", false);
                }
            });
        }
        $.ajax({
            url: config.server+"question/"+question.id,
            beforeSend: setAuthHeaders,
            method: "GET",
            dataType: "JSON",
            success: function(data) {
              data.answers.map(function(a, i) {
                $('#question_'+data.question.id+i).val(a.value);
              });
            },
            error: function(data) { console.error(data); }
        });
    }
    $form.append($q);
}
