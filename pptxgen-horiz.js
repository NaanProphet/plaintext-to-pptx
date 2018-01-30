/*
 * NAME: pptxgen-horiz.js
 * AUTH: Krishna Bhamidipati (https://github.com/NaanProphet/)
 * DATE: Feb 16, 2018
 * DESC: Formats Itranslator 2003 Sanskrit text into slides
 * REQS: npm 4.x + `npm install pptxgenjs`
 * EXEC: `node pptxgen.js devanagari.txt roman.txt`
 */

// ============================================================================

const fs = require('fs');
const readline = require('readline');
const PptxGenJS = require('pptxgenjs');
const path = require('path');

var gConsoleLog = true;

const NEW_SLIDE_COMMENT = 'BREAK';
const TITLE_SLIDE_COMMENT = 'TITLE';

const SLIDE_LAYOUT = 'LAYOUT_16x9';
const MAX_ROWS_PER_SLIDE = 3;
const SLIDE_BACKGROUND_COLOR = '000000';
const FONT_COLOR = 'FFFFFF';

const X_OFFSET = "2%";

const SANSKRIT_TEXTBOX_SPACING = 15;
const SANSKRIT_Y_OFFSET = 2;
const SANSKRIT_FONT = 'Siddhanta';
const SANSKRIT_FONT_SIZE = 32;
const SANSKRIT_BOLD = false;
const SANSKRIT_REMOVE_HYPHENS_REGEX = /-([^\s])/g;

const ROMAN_TEXTBOX_SPACING = 13;
const ROMAN_Y_OFFSET = 53;
const ROMAN_FONT = 'URW Palladio ITU';
const ROMAN_FONT_SIZE = 23;
const ROMAN_BOLD = true;

function getTimestamp() {
	var dateNow = new Date();
	return dateNow.toISOString().replace(/(T|:|-)/g, '').replace(/\..+/, '');
}

// ============================================================================

if (gConsoleLog) console.log(`
-------------
STARTING PPTX
-------------
`);

const dest_folder = path.resolve(path.dirname(process.argv[2]));

if (gConsoleLog) console.log(` * save location:  ${dest_folder}`);

// ============================================================================

// STEP 2: Create a new Presenation
var pptx = new PptxGenJS();
pptx.setLayout(SLIDE_LAYOUT)


var exportName = 'PptxGenJS_'+getTimestamp() + '.pptx';

// assuming files are small enough to load entirely into memory
var devText = fs.readFileSync(process.argv[2]).toString().split("\n");
var romText = fs.readFileSync(process.argv[3]).toString().split("\n");

var slide_row = 0;
var slide_num = 0;
var slide;

for(i in devText) {
	
	// drive off sanskrit file for all decisions
	
	var isTitle = devText[i].startsWith(TITLE_SLIDE_COMMENT);
	
    sanskrit_text = devText[i]
		.substring(isTitle ? TITLE_SLIDE_COMMENT.length : 0)
		.trim()
		.replace(SANSKRIT_REMOVE_HYPHENS_REGEX, '$1');	
    	
	roman_text = romText[i]
		.substring(isTitle ? TITLE_SLIDE_COMMENT.length : 0)
		.trim()
	
	if (!sanskrit_text) {
		continue;
	}
	
	// force page break
	if (sanskrit_text === NEW_SLIDE_COMMENT) {
		slide_row = MAX_ROWS_PER_SLIDE;
		continue;
	}
	
	if (slide_row % MAX_ROWS_PER_SLIDE == 0) {
			slide = pptx.addNewSlide();
			slide.back = SLIDE_BACKGROUND_COLOR;
			slide.color = FONT_COLOR;
			
            slide_num += 1;
            slide_row = 0;
	}
	
	var y_pos_dev = slide_row * SANSKRIT_TEXTBOX_SPACING + SANSKRIT_Y_OFFSET;
	var y_pos_rom = slide_row * ROMAN_TEXTBOX_SPACING + ROMAN_Y_OFFSET;
	
	slide.addText( sanskrit_text, {
		x: X_OFFSET, 
		y: isTitle ? '30%' : `${y_pos_dev}%`, 
		w:'96%', 
		h:1, 
		fontFace:SANSKRIT_FONT, 
		fontSize: isTitle ? SANSKRIT_FONT_SIZE*1.5 : SANSKRIT_FONT_SIZE,
		align: isTitle ? 'center' : 'left',
		bold:SANSKRIT_BOLD
	} );
	
	slide.addText( roman_text, {
		x: X_OFFSET, 
		y: isTitle ? '50%' : `${y_pos_rom}%`, 
		w:'96%', 
		h:1, 
		fontFace:ROMAN_FONT, 
		fontSize: isTitle ? ROMAN_FONT_SIZE*1.5 : ROMAN_FONT_SIZE, 
		align: isTitle ? 'center' : 'left',
		bold:ROMAN_BOLD
	} );
	
	slide_row += 1;
}


// Inline save
pptx.save( dest_folder + '/' + exportName ); if (gConsoleLog) console.log('\nFile created:\n'+' * '+exportName);

// ============================================================================

if (gConsoleLog) console.log(`
--------------
PPTX COMPLETE!
--------------
`);
