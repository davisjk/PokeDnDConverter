<link rel="stylesheet" href="{{ site.baseurl }}/styles.css">
<script src="https://code.jquery.com/jquery-3.4.1.min.js"></script>
<script src="{{ site.baseurl }}/converter.js"></script>

# Pokémon DnD Move Dex Converter

Convert the Pokémon DnD Move Dex from a Tab Separated Value file to a Markup Text file for uploading on [The HomeBrewery](https://homebrewery.naturalcrit.com) or vice versa.

## Conversion

<h3 align="center"><a id="tsv">TSV to Markup</a> | <a id="markup">Markup to TSV</a></h3>

<div id="tsv-markup" hidden>
    <div><input id="file" type="file" accept=".tsv"/></div>
    <div id="display">
        <div>
            <div style="float:left">Display <a id="in">input</a> | <a id="out">output</a></div>
            <div style="float:right"><button class="download">Download Output</button></div>
            <div style="clear:both"></div>
        </div>
        <hr/>
        <div>
            <textarea id="input" rows="25" wrap="soft" readonly hidden></textarea>
            <textarea id="output" rows="25" wrap="soft" readonly hidden></textarea>
        </div>
    </div>
</div>

<div id="markup-tsv" hidden>
    <div><input id="file" type="file" accept=".txt"/></div>
    <div id="display">
        <div>
            <div style="float:left">Display <a id="in">input</a> | <a id="out">output</a></div>
            <div style="float:right"><button class="download">Download Output</button></div>
            <div style="clear:both"></div>
        </div>
        <hr/>
        <div>
            <textarea id="input" rows="25" wrap="soft" readonly hidden></textarea>
            <textarea id="output" rows="25" wrap="soft" readonly hidden></textarea>
        </div>
    </div>
</div>
