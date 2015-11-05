
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
                div.html("<form id='form_"+id+"' class='small-12 columns'><div class='row'><h2>"+data.form.title+"</h2></div></form>");
                var questions = data.questions;
                for (var i=0; i<questions.length; i++)
                    addQuestion(questions[i]);
                div.find("form").append("<div class='row'><button class='success expand' type='submit'>Save and Close!</button></div>");
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
                    $.each(data, function(key, value) {
                        var success = 0;
                        $.ajax({
                            url: config.server+"answer/"+key,
                            beforeSend: setAuthHeaders,
                            method: "PUT",
                            data: {'value': value},
                            dataType: "JSON",
                            success: function(data) {
                                success++;
                                if (success == questions.length) {
                                    window.location.href = "#";
                                }
                            },
                            error: function(data) {
                                console.error(data);
                            }
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
    if (question.type == "radio" || question.type == "checkbox") {
        var pv = question.possible_values.split(",").map(function(a) {
            return $.trim(a);
        });
        $q.append("<div class='small-12 columns'><label><h3>"+question.label+"</h3>"+(question.placeholder.length > 4 ? "<h5>("+question.placeholder+")</h5>" : "")+"</label></div>");
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
    }
    $form.append($q);
}
