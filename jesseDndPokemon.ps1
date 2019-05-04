## Changelog
# 04/27/2019 - Jacob Davis
#   Choose mode at runtime, tsv to markup or vice versa
#   Open file selection dialog boxes
#   Replace weird characters with ' and é in markup
#   Automatically create column and page breaks in markup
#   Add automatic page numbering to each page in markup
#   Fix markup to tsv to match changes to the opposite

# Want to make markup sections of the form:
# #### Absorb
# ___
# - **Type:** Grass
# - **Move Power:** Strength/Wisdom
# - **Move Time:** 1  action
# - **PP:** 10
# - **Duration:** Instantaneous
# - **Range:** Melee
# - **Description:**  
# You attempt to absorb some of an enemy’s health. Make a melee attack on a Pokémon. On a hit, the Pokémon takes 1d6+MOVE grass damage. Half the damage done is restored by the user.
# - **Higher Levels:**  
# The base damage of this attack increases to 2d6 at level 5, 3d6 At level 11, and 4d6 at level 17.
# 
# To do this, we tokenize the section as follows:
# #### {Move Name}
# ___
# - **Type:** {Type}
# - **Move Power:** {Move Power}
# - **Move Time:** {Move Time}
# - **PP:** {PP}
# - **Duration:** {Duration} 
# - **Range:** {Range}
# - **Description:**  
# {Description}
# - **Higher Levels:**  
# The base damage of this attack increases to {Higher Levels 0} at level 5, {Higher Levels 1} At level 11, and {Higher Levels 2} at level 17.

# We'll populate the tokenized text by reading in the data from a spreadsheet.
# One row from the tab delimited spreadsheet has the form:
#
#   Move Name
#   Type    
#   Move Power  
#   Move Time   
#   PP  
#   Duration    
#   Range   
#   Description Damage  
#   Description 
#   Higer Levels 0,Higer Levels 1,Higer Levels 2    
#   Higher Levels Override
#    
# Most of these are perfectly self explanatory, 1-1 mappings. 
# Higher Levels is slightly more complicated, because it has an override.
#   
#   If Higher Level Override is populated, use that text.
#   Else, Take the Higher Levels column, write out the text with those levels:
#       The base damage of this attack increases to {Higher Levels 0} at level 5, {Higher Levels 1} At level 11, and {Higher Levels 2} at level 17.
# 
# Description is slightly complicated, because it allows for a {} mnemonic to write the Description Damage column.
# For example, if Description="The move does {} fire damage to the opponent" and Description Damage="1d6"
# then we'll write out "The move does 1d6 fire damage to the opponent"
#
$Markup_String="#### {0}
___
- **Type:** {1}
- **Move Power:** {2}
- **Move Time:** {3}
- **PP:** {4}
- **Duration:** {5}
- **Range:** {6}
- **Description:**  
{7}
- **Higher Levels:**  
{8}"

$column='```
```'
$page="\page"
$pageNumber="<div class='pageNumber auto'></div>"
$header="Name`tType`tMove Power`tMove Time`tPP`tDuration`tRange`tDescription Damage`tDescription`tHigher Levels Damage`tHigher Levels Override"

#These work but might not be perfect cause of font sizes
$linesPerCol=63
$charsPerLine=58

function get_markup_from_row {
    $row=$args[0]
    $row=$row -split "`t"
    $row=$row -replace "\}\+MOVE", "} + MOVE"
    $Move_Name=$row[0]
    
    #Skip the header row
    if ($Move_Name -eq "Name") {
        return ""
    }
    
    $Type=$row[1]
    $Move_Power=$row[2]
    $Move_Time=$row[3]
    $PP=$row[4]
    $Duration=$row[5]
    $Range=$row[6]
    $Description_Damage=$row[7]
    $Description=$row[8]
    $Higher_Levels=$row[9]
    $Higher_Levels=$("$Higher_Levels" -split ",")
    $Higher_Levels_Override=$row[10]
    
    #Remove Higher Levels from markup if we have no data for it
    if ($Higher_Levels_Override -eq "" -and $Higher_Levels -eq "") {
        $Markup_String=$($Markup_String -replace ".*Higher.*", "")
        $Higher_Levels=""
    } elseif ($Higher_Levels_Override -ne "") {
        $Higher_Levels=$Higher_Levels_Override
    } else {
        $Higher_Levels=[string]::Format(
            "The base damage of this attack increases to {0} at level 5, {1} at level 11, and {2} at level 17.",
            $Higher_Levels[0],
            $Higher_Levels[1],
            $Higher_Levels[2]
        )
    }
    
    $Description=$($Description -replace "{}", $Description_Damage)
    $Markup=[string]::Format($Markup_String,
        $Move_Name,
        $Type,
        $Move_Power,
        $Move_Time,
        $PP,
        $Duration,
        $Range,
        $Description,
        $Higher_Levels
    )
    return $Markup
}

function generate_markup {
    $file=$args[0]
    $markup=@($pageNumber)
    
    $colLen=0
    $colNum=0
    foreach ($row in Get-Content $file) {
        $entry=get_markup_from_row($row)
        $entry=$entry -replace [char]8217, "'"
        $entry=$entry -replace "$([char]226)$([char]8364)$([char]8482)", "'"
        $entry=$entry -replace "$([char]195)$([char]169)", "$([char]233)"
        $entry=$entry -replace "Pokemon", "Pok$([char]233)mon"
        
        if ($entry -ne "") {
            #Try to automatically make column and page breaks
            $len=0
            $lines=$entry -split "`n"
            $lines.ForEach({$len+=[math]::Ceiling($_.Length/$charsPerLine)})
            if ($len+$colLen -gt $linesPerCol) {
                $colLen=$len
                if ($colNum -eq 0) {
                    $colNum=1
                    $markup+=$column
                }
                else {
                    $colNum=0
                    $markup+=$page
                    $markup+=$pageNumber
                }
            }
            else {
                $colLen+=$len
            }
            
            $markup+=$entry
        }
    }
    $markup=$markup -join "`n`n"
    $markup=$markup.Trim()
    $markup=$markup -replace "\n{3,}", "`n`n"
    return $markup
}

function get_row_from_markup {
    $markup=$args[0]
    $values=$markup -replace "- \*\*[^*]*\*\* ", "^"
    $values=$values -replace "___", ""
    $values=$values -replace "`n", ""
    $values=$values -replace "`r", ""
    $values=$values -replace [char]8217, "'"
    $values=$values -replace "$([char]226)$([char]8364)$([char]8482)", "'"
    $values=$values -replace "$([char]195)$([char]169)", "$([char]233)"
    $values=$values -replace "\\page", ""
    $values=$values -replace $pageNumber, ""
    $values=$values -replace '``````', ""
    $values_list=$values -split "\^"
    $Move_Name=$values_list[0]
    $Type=$values_list[1]
    $Move_Power=$values_list[2]
    $Move_Time=$values_list[3]
    $PP=$values_list[4]
    $Duration=$values_list[5]
    $Range=$values_list[6]
    $Description=$values_list[7]
    $Higher_Levels=$values_list[8]
    $d_regex="[0-9]+d[0-9]+"
    if($Description -match $d_regex){
        $Description_Damage=$Matches[0]
        $Description=$Description -replace $Description_Damage, "{}"
    }
    $Description=$Description -replace "\}\+MOVE", "} + MOVE"
    
    # $Higher_Levels_temp=$Higher_Levels -replace "\+MOVE", ""
    # $Higher_Levels_list=$Higher_Levels_temp -split " "
    $Higher_Levels_list=$Higher_Levels -split " "
    $Higher_Levels_list=$Higher_Levels_list -match $d_regex
    if($Higher_Levels_list.Length -eq 3 -and $Higher_Levels_list[0].Length -gt 1){
        $Higher_Levels=[string]::Format("{0},{1},{2}",$Higher_Levels_list[0],$Higher_Levels_list[1],$Higher_Levels_list[2])
        $Higher_Levels_Override=""
    }
    else {
        $Higher_Levels_Override=$Higher_Levels
        $Higher_Levels=""
    }
    $row="$Move_Name`t$Type`t$Move_Power`t$Move_Time`t$PP`t$Duration`t$Range`t$Description_Damage`t$Description`t$Higher_Levels`t$Higher_Levels_Override"
    return $row
}

function generate_spreadsheet {
    $tsv=@($header)
    $file=$args[0]
    $lines=[IO.File]::ReadAllText($file)
    $sections=$($lines -split "####")
    foreach($markup in $sections) {
        $row=get_row_from_markup($markup)
        $row=$row.Trim()
        if ($row -ne "") {
            $tsv+=$row
        }
    }
    return $tsv -join "`n"
}

$first=$TRUE
do {
    if (!$first) {
        echo "`nOption '$mode' not recognized"
        $first=$FALSE
    }
    $mode=Read-Host -Prompt "Modes (case-insensitive):`n  T) TSV to Markup`n  M) Markup to TSV`n  Q) Quit`nSelect Mode"
} until ($mode -match "[tmq]")

Switch ($mode[0]) {
    t {
        echo "Select a TSV file to convert to Markup"
        $OpenFile=New-Object System.Windows.Forms.OpenFileDialog -Property @{
            # InitialDirectory=[Environment]::GetFolderPath("Desktop")
            FileName="MoveDex.tsv"
            Filter="Tab Delimeted (*.tsv)|*.tsv"
        }
        $result=$OpenFile.ShowDialog()
        if ($result -eq "OK") {
            $input=$OpenFile.FileName
            $output=$input -replace "\.tsv$", ".txt"
            echo "Saving to $output"
            generate_markup($input) > $output
        }
    }
    m {
        echo "Select a Markup Text file to convert to TSV"
        $OpenFile=New-Object System.Windows.Forms.OpenFileDialog -Property @{
            # InitialDirectory=[Environment]::GetFolderPath("Desktop")
            FileName="MoveDex.txt"
            Filter="Markup Text (*.txt)|*.txt"
        }
        $result=$OpenFile.ShowDialog()
        if ($result -eq "OK") {
            $input=$OpenFile.FileName
            $output=$input -replace "\.txt$", ".tsv"
            echo "Saving to $output"
            generate_spreadsheet($input) > $output
        }
    }
    q { exit }
}
