// define String.format if it isn't implemented yet
if (!String.prototype.format) {
    String.prototype.format = function () {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined' ? args[number] : match;
        });
    };
}

var showing = "None";
var markup = "";
var tsv = "";

$(document).ready(function () {
    $("#tsv-markup #file").change(function () {
        var file = $("#tsv-markup #file")[0].files[0];
        if (file) {
            var reader = new FileReader();
            reader.readAsText(file);
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
        var file = $("#markup-tsv #file")[0].files[0];
        if (file) {
            var reader = new FileReader();
            reader.readAsText(file);
            reader.onload = function (e) {
                $("#markup-tsv #input").html(e.target.result);
                tsv = generateTsv(e.target.result);
                $("#markup-tsv #output").html(tsv);
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
    $("#tsv-markup #input").hide();
    $("#tsv-markup #output").hide();
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
    $("#markup-tsv #input").hide();
    $("#markup-tsv #output").hide();
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
        var data = markup;
        var filename = "MoveDex.txt";
    }
    else if (showing == "markup-tsv") {
        var data = tsv;
        var filename = "MoveDex.tsv";
    }
    if (!data) {
        alert("Nothing to download");
        return;
    }

    var file = new Blob([data], { type: "text/plain" });
    if (window.navigator.msSaveOrOpenBlob) {
        // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    }
    else {
        // Others
        var a = document.createElement("a");
        var url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function () {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    }
}

var markupFormat = "#### {0}\n___\n- **Type:** {1}\n- **Move Power:** {2}\n- **Move Time:** {3}\n- **PP:** {4}\n- **Duration:** {5}\n- **Range:** {6}\n- **Description:**  \n{7}\n- **Higher Levels:**  \n{8}"
var column = "```\n```"
var page = "\\page"
var pageNumber = "<div class='pageNumber auto'></div>";
var header = "Name\tType\tMove Power\tMove Time\tPP\tDuration\tRange\tDescription Damage\tDescription\tHigher Levels Damage\tHigher Levels Override";
var linesPerCol = 63;
var charsPerLine = 58;

function generateMarkup(tsv) {
    markup = [pageNumber];
    colLen = 0;
    colNum = 0;

    var rows = tsv.replace("}+MOVE", "} + MOVE").split("\n");
    rows.forEach(row => {
        row = row.split("\t");
        var name = row[0];

        // skip the header row
        if (name == "Name") {
            continue;
        }

        var type = row[1];
        var power = row[2];
        var time = row[3];
        var pp = row[4];
        var duration = row[5];
        var range = row[6];
        var damage = row[7];
        var description = row[8].replace("{}", damage);
        var higher = row[9].split(",");
        var override = row[10];
        var format = markupFormat;

        // remove Higher Levels from markup if we have no data for it
        if (!higher == [""] && !override) {
            format = format.replace(/^.*Higher.*$/, "");
            higher = "";
        }
        else if (override) {
            higher = override;
        }
        else {
            higher = "The base damage of this attack increases to {0} at level 5, {1} at level 11, and {2} at level 17."
                .format(higher[0], higher[1], higher[2]);
        }

        var entry = format.format(name, type, power, time, pp, duration, range, description, higher);
        // might need to do special stuff for é and ’
        entry = entry.replace("Pokemon", "Pokémon");
        var len = 0;
        var lines = entry.split("\n");
        lines.forEach(line => {
            len += Math.ceil(line.len / charsPerLine);
        });
        if (len + colLen > linesPerCol) {
            colLen = len;
            if (colNum == 0) {
                colNum = 1;
                markup.push(column);
            }
            else {
                colNum = 0;
                markup.push(page);
                markup.push(pageNumber);
            }
        }
        else {
            colLen += len;
        }
        markup.push(entry);
    });

    markup = markup.join("\n\n");
    markup.trim();
    markup.replace(/\n{3,}/g, "\n\n");

    return markup;
}

function generateTsv(markup) {
    // TODO
    console.log("generate tsv");


}
