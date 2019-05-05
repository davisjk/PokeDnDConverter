/* define String.format if it isn't implemented yet */
if (!String.prototype.format) {
    String.prototype.format = function () {
        var args = arguments;
        return this.replace(/\{(\d+)\}/g, function (match, number) {
            return typeof args[number] != 'undefined' ? args[number] : match;
        });
    };
}

/* web page formatting/functionality */
var showing = "None";
var markup = "";
var tsv = "";

$(document).ready(function () {
    // #tsv-markup elements
    $("#tsv").click(function () {
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
    });
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
    });
    $("#tsv-markup #in").click(function () {
        $("#tsv-markup #output").hide();
        $('#tsv-markup #input').show();
    });
    $("#tsv-markup #out").click(function () {
        $("#tsv-markup #input").hide();
        $('#tsv-markup #output').show();
    });

    // #markup-tsv elements
    $("#markup").click(function () {
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
    });
    $("#markup-tsv #file").change(function () {
        var file = $("#markup-tsv #file")[0].files[0];
        if (file) {
            var reader = new FileReader();
            reader.readAsText(file);
            reader.onload = function (e) {
                $("#markup-tsv #input").html(e.target.result);
                $("#markup-tsv #output").html(generateTsv(e.target.result));
            }
        }
        else {
            $("#markup-tsv #input").html("").hide();
            $("#markup-tsv #output").html("").hide();
        }
    });
    $("#markup-tsv #in").click(function () {
        $('#markup-tsv #output').hide();
        $('#markup-tsv #input').show();
    });
    $("#markup-tsv #out").click(function () {
        $('#markup-tsv #input').hide();
        $('#markup-tsv #output').show();
    });

    // download button
    $("#download").click(function () {
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
    });
});

/* file format conversions */
var markupFormat = "#### {0}\n___\n- **Type:** {1}\n- **Move Power:** {2}\n- **Move Time:** {3}\n- **PP:** {4}\n- **Duration:** {5}\n- **Range:** {6}\n- **Description:**  \n{7}\n- **Higher Levels:**  \n{8}"
var column = "```\n```"
var page = "\\page"
var pageNumber = "<div class='pageNumber auto'></div>";
var header = "Name\tType\tMove Power\tMove Time\tPP\tDuration\tRange\tDescription Damage\tDescription\tHigher Levels Damage\tHigher Levels Override";
var linesPerCol = 63;
var charsPerLine = 58;
var dice = /\d+d\d+/g;

/**
 * Convert the tsv file contents to homebrewery markup.
 * @param {string} tsv 
 * @returns {string} markup
 */
function generateMarkup(tsv) {
    markup = [pageNumber];
    var colLen = 0;
    var colNum = 0;

    var rows = tsv
        .replace("}+MOVE", "} + MOVE")
        .split("\n");

    rows.forEach(row => {
        row = row.split("\t");
        var name = row[0];

        // skip the header row
        if (name != "Name") {
            var type = row[1];
            var power = row[2];
            var time = row[3];
            var pp = row[4];
            var duration = row[5];
            var range = row[6];
            var damage = row[7];
            var description = row[8].replace("{}", damage);
            var higher = row[9];
            var override = row[10];
            var format = markupFormat;

            // remove Higher Levels from markup if we have no data for it
            if (!higher && !override) {
                format = format.replace(/.*Higher.*/, "");
                higher = "";
            }
            else if (override) {
                higher = override;
            }
            else {
                higher = higher.split(",");
                higher = "The base damage of this attack increases to {0} at level 5, {1} at level 11, and {2} at level 17."
                    .format(higher[0], higher[1], higher[2]);
            }

            var entry = format.format(name, type, power, time, pp, duration, range, description, higher)
                .replace("Pokemon", "Pokémon");

            var len = 0;
            var lines = entry.split("\n");
            lines.forEach(line => {
                len += Math.ceil(line.length / charsPerLine);
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
        }
    });

    markup = markup
        .join("\n\n")
        .trim()
        .replace(/\n{3,}/g, "\n\n");
    return markup;
}

/**
 * Convert the markup file contents to tsv.
 * @param {string} markup 
 * @returns {string} tsv
 */
function generateTsv(markup) {
    tsv = [header];
    var sections = markup.split("####");
    sections.forEach(section => {
        section = section
            .replace(/- \*\*[^*]*\*\* /g, "{split_here}")
            .replace("___", "")
            .replace(page, "")
            .replace(pageNumber, "")
            .replace(column, "")
            .replace("\n", "")
            .replace("\r", "")
            .trim();

        if (section) {
            section = section.split("{split_here}");
            var name = section[0].trim();
            var type = section[1].trim();
            var power = section[2].trim();
            var time = section[3].trim();
            var pp = section[4].trim();
            var duration = section[5].trim();
            var range = section[6].trim();
            var description = section[7].trim();

            if (description) {
                var damage = description.match(dice);
                damage = damage ? damage[0] : "";
                if (damage) {
                    description = description.replace(damage, "{}").replace("}+MOVE", "} + MOVE");
                }
            }

            var higher = section[8];
            var override = higher;
            if (higher) {
                higher = higher.match(dice);
                if (higher && higher.length == 3) {
                    higher = higher.join(",");
                    override = "";
                }
                else {
                    higher = "";
                }
            }

            row = "{0}\t{1}\t{2}\t{3}\t{4}\t{5}\t{6}\t{7}\t{8}\t{9}\t{10}"
                .format(name, type, power, time, pp, duration, range, damage, description, higher, override)
                .trim();
            if (row) {
                tsv.push(row);
            }
        }
    });

    tsv = tsv.join("\n");
    return tsv;
}
