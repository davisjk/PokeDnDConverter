<link rel="stylesheet" href="{{ site.baseurl }}/styles.css">
<script src="https://code.jquery.com/jquery-3.4.1.min.js"></script>
<script src="{{ site.baseurl }}/converter.js"></script>

# Pokémon DnD Move Dex Converter

Convert the Pokémon DnD Move Dex from a Tab Separated Value file to a Markup Text file for uploading on [The HomeBrewery](https://homebrewery.naturalcrit.com) or vice versa.

## Conversion

<h3 align="center"><a onclick="tsvToMarkup()">TSV to Markup</a> | <a onclick="markupToTsv()">Markup to TSV</a></h3>

<div id="tsv-markup" hidden>
    <div><input id="tsv" type="file" accept=".tsv"/></div>
    <div id="display">
        <div class="minwidth">
            <div style="float:left">Display <a onclick="">input</a> | <a onclick="">output</a></div>
            <div style="float:right"><button onclick="download()">Download</button></div>
        </div>
        <hr/>
        <div>
            <span id="input" hidden></span>
            <span id="output" hidden></span>
        </div>
    </div>
</div>
