// This script let you generate GNU Backgammon File from Boardgamearena.com's Backgammon log.
// You must modify the your_name variable to your account's display name



// Since BGA log shows from your perspective, the script must need to know which player is you.
let your_name = "ezoe" ;


// grab necessary DOM elements.
let gamelogs = document.getElementById("gamelogs") ;
let logs = gamelogs.childNodes ;

// fixed header.
let sgf_header = "(;FF[4]GM[6]CA[UTF-8]AP[GNU Backgammon:1.06.002]" ;

// player names
let players = document.getElementById("game_result").getElementsByClassName("playername") ;

// retrieve the player names.
let first_player = logs[2].textContent.match(/(.+) rolls/)[1] ;
let second_player = (first_player === players[0].textContent ? players[1].textContent : players[0].textContent ) ;



let sgf_names = "PW[" + first_player + "]PB[" + second_player + "]" ;
// nocube rule
let sgf_rule = "RU[NoCube]\n" ;

// iterate over the game logs and construct the SGF
// true means white player, false means black player
let current_player = false ;


// helper function to translate opponent's perspective.
// BGA display opponent's point from your perspective so it must be inverted.
let is_your_1st_player = ( first_player === your_name ) ;
function translate_point( point )
{
    // It's you. No need to translate.
    if ( current_player === is_your_1st_player )
        return point ;
    else
    // Otherwise, we have to translate the opponent's point.
    // simply invert 1-24 to 24-1
        return 25 - point ;
}

// buffer for accumulating the log
let sgf_buffer = "" ;

// parse one element per iterate.
for ( let i = 0 ; i != logs.length ; ++i )
{
    let value = logs[i] ;

    // change the player.
    if ( value.textContent === "Next player" )
    {
        // if this is not the first turn, end the previous turn.
        if ( sgf_buffer !== "" )
        {
            sgf_buffer += "]\n" ;
        }
        // swap the player
        current_player = !current_player ;
        sgf_buffer += ";" + (current_player ? "W" : "B") + "[" ;
        continue ;
    }
    // roll the dice
    let roll_result = value.textContent.match(/rolls (\d+)-(\d+)/) ;
    if ( roll_result !== null )
    {
        sgf_buffer += roll_result[1] + roll_result[2] ;
        continue ;
    }

    // GNU Backgammon represent point 1-24 as a-x, bar as y, bear off as z.
    // This helper function convert string 1-24 to string a-x while converting to number and calculate the code point.
    function point_mapper( point_number_string )
    {
        let point_number = translate_point( parseInt( point_number_string ) ) - 1 ;
        let point_alphabet_charcode = "a".charCodeAt(0) + point_number ;
        let point_alphabet = String.fromCharCode( point_alphabet_charcode ) ;
        return point_alphabet ;
    }
    // move the stones
    let move_result = value.textContent.match(/moves from point (\d+) to point (\d+)/) ;
    if ( move_result !== null )
    {
        sgf_buffer += point_mapper( move_result[1] ) + point_mapper( move_result[2] ) ;
        continue ;
    }
    // moves from the bar
    let move_from_bar_result = value.textContent.match(/moves from the bar to point (\d+)/) ;
    if ( move_from_bar_result !== null )
    {
        // GNU Backgammon express bar as move from y.
        sgf_buffer += "y" + point_mapper( move_from_bar_result[1] ) ;
        continue ;
    }
    // bear off
    let bear_off_result = value.textContent.match(/bears off from point (\d+)/) ;
    if ( bear_off_result !== null )
    {
        // GNU Backgammon express bear off as move to z.
        sgf_buffer += point_mapper( bear_off_result[1] ) + "z" ;
        continue ;
    }
    // if none of the above branch handle the element, it can be ignored.    
}
// end the turn
sgf_buffer += "])" ;
// construct the full GNU Backgammon File.
sgf_text = sgf_header + sgf_names + sgf_rule + sgf_buffer ;

// display it.

let textarea = document.createElement("textarea") ;
textarea.value = sgf_text ; 
document.body.insertBefore( textarea, document.body.firstChild ) ;
