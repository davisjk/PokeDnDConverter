var showing = "None"

function showInput() {
    $('#output').hide();
    $('#input').show();
}

function tsvToMarkup() {
    // if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
    //     alert("The File APIs are not fully supported in this browser.");
    //     return;
    // }

    $("#tsv").click();
    var file = $("#tsv")[0].files[0];
    if (file) {
        $("#file").html(file.name);

        var reader = new FileReader();
        reader.readAsText(file);
        reader.onload = function (e) {
            $("#output").html(e.target.result);
        }
    }
    else {
        $("#file").html("no file selected");
    }
}

function markupToTsv() {
    $("#output").html("Markup to TSV");
}
