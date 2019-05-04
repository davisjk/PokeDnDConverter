var showing = "None";

$(document).ready(function () {
    $("#tsv-markup #file").change(function () {
        var tsv = $("#tsv-markup #file")[0].files[0];
        if (tsv) {
            var reader = new FileReader();
            reader.readAsText(tsv);
            reader.onload = function (e) {
                $("#tsv-markup #input").html(e.target.result);
                $("#tsv-markup #output").html(generateMarkup(e.target.result));
            }
        }
        else {
            $("#tsv-markup #input").html("").hide();
            $("#tsv-markup #output").html("").hide();
        }
    })
})

$(document).ready(function () {
    $("#markup-tsv #file").change(function () {
        var markup = $("#markup-tsv #file")[0].files[0];
        if (markup) {
            var reader = new FileReader();
            reader.readAsText(markup);
            reader.onload = function (e) {
                $("#markup-tsv #input").html(e.target.result);
                $("#markup-tsv #output").html(generateTsv(e.target.result));
            }
        }
        else {
            $("#markup-tsv #input").html("").hide();
            $("#markup-tsv #output").html("").hide();
        }
    })
})

function tsvToMarkup() {
    if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
        alert("The File APIs are not fully supported in this browser.");
        return;
    }

    $("#tsv").addClass("underline");
    $("#markup").removeClass("underline");
    $("#markup-tsv").hide();
    $("#tsv-markup").show();
    showing = "tsv-markup";
}

function markupToTsv() {
    if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
        alert("The File APIs are not fully supported in this browser.");
        return;
    }

    $("#markup").addClass("underline");
    $("#tsv").removeClass("underline");
    $("#tsv-markup").hide();
    $("#markup-tsv").show();
    showing = "markup-tsv";
}

function showInput() {
    if (showing == "tsv-markup") {
        $("#tsv-markup #output").hide();
        $('#tsv-markup #input').show();
    }
    else if (showing == "markup-tsv") {
        $('#markup-tsv #output').hide();
        $('#markup-tsv #input').show();
    }
}

function showOutput() {
    if (showing == "tsv-markup") {
        $("#tsv-markup #input").hide();
        $('#tsv-markup #output').show();
    }
    else if (showing == "markup-tsv") {
        $('#markup-tsv #input').hide();
        $('#markup-tsv #output').show();
    }
}

function download() {
    if (showing == "tsv-markup") {
        var contents = $('#tsv-markup #output').text();
    }
    else if (showing == "markup-tsv") {
        var contents = $('#markup-tsv #output').text();
    }
}

function generateMarkup(tsv) {
    // TODO
    console.log("generate markup");
}

function generateTsv(markup) {
    // TODO
    console.log("generate tsv");
}
