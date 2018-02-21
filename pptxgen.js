/*
 * NAME: pptxgen-horiz.js
 * AUTH: Krishna Bhamidipati (https://github.com/NaanProphet/)
 * DATE: Feb 16, 2018
 * DESC: Formats Itranslator 2003 Sanskrit text into slides
 * REQS: npm 4.x + `npm install pptxgenjs`
 * EXEC: `node pptxgen.js config.js devanagari.txt roman.txt`
 */

// ============================================================================

const configFile = process.argv[2];
const devanagariFile = process.argv[3];
const romanFile = process.argv[4];

const fs = require('fs');
const readline = require('readline');
const PptxGenJS = require('pptxgenjs');
const path = require('path');
const p = require(path.resolve(configFile));

const REMOVE_HYPHENS_REGEX = /-([^\s])/g


var gConsoleLog = true;

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

const dest_folder = path.resolve(path.dirname(devanagariFile));

if (gConsoleLog) console.log(` * save location:  ${dest_folder}`);

// ============================================================================

// STEP 2: Create a new Presenation
var pptx = new PptxGenJS();
pptx.setLayout(p.SLIDE_LAYOUT)


var exportName = 'PptxGenJS_'+getTimestamp() + '.pptx';

// assuming files are small enough to load entirely into memory
var devText = fs.readFileSync(devanagariFile).toString().split("\n");
var romText = fs.readFileSync(romanFile).toString().split("\n");

var slide_row = 0;
var slide_num = 0;
var slide;

for(i in devText) {
	
	// drive off sanskrit file for all decisions
	
	var hasTitleSentinel = devText[i].startsWith(p.TITLE_SLIDE_COMMENT);
	var isTitle = p.GLOBAL_TITLE_FLAG || hasTitleSentinel;
	
    sanskrit_text = devText[i]
		.substring(hasTitleSentinel ? p.TITLE_SLIDE_COMMENT.length : 0)
		.trim()
		.replace(REMOVE_HYPHENS_REGEX, '$1');	
    	
	roman_text = romText[i]
		.substring(hasTitleSentinel ? p.TITLE_SLIDE_COMMENT.length : 0)
		.trim()
	
	if (!sanskrit_text) {
		continue;
	}
	
	// force page break
	if (sanskrit_text === p.NEW_SLIDE_COMMENT) {
		slide_row = p.MAX_ROWS_PER_SLIDE;
		continue;
	}
	
	if (slide_row % p.MAX_ROWS_PER_SLIDE == 0) {
			slide = pptx.addNewSlide();
			slide.back = p.SLIDE_BACKGROUND_COLOR;
			slide.color = p.FONT_COLOR;
			
            slide_num += 1;
            slide_row = 0;
	}
	
	var y_pos_dev = slide_row * p.TEXTBOX1_SPACING + p.TEXTBOX1_Y_OFFSET;
	var y_pos_rom = slide_row * p.TEXTBOX2_SPACING + p.TEXTBOX2_Y_OFFSET;
	
	slide.addText( sanskrit_text, {
		x: p.TEXTBOX_X_OFFSET, 
		y: isTitle ? p.TEXTBOX_TITLE1_Y_POS : `${y_pos_dev}%`, 
		w: p.TEXTBOX_WIDTH, 
		h: p.TEXTBOX_HEIGHT, 
		fontFace: p.TEXTBOX1_FONT, 
		fontSize: isTitle ? p.TEXTBOX1_FONT_SIZE * p.TITLE_FONT_MULTIPLER : p.TEXTBOX1_FONT_SIZE,
		align: isTitle ? 'center' : 'left',
		bold: p.TEXTBOX1_BOLD
	} );
	
	slide.addText( roman_text, {
		x: p.TEXTBOX_X_OFFSET, 
		y: isTitle ? p.TEXTBOX_TITLE2_Y_POS : `${y_pos_rom}%`, 
		w: p.TEXTBOX_WIDTH, 
		h: p.TEXTBOX_HEIGHT, 
		fontFace: p.TEXTBOX2_FONT, 
		fontSize: isTitle ? p.TEXTBOX2_FONT_SIZE * p.TITLE_FONT_MULTIPLER : p.TEXTBOX2_FONT_SIZE, 
		align: isTitle ? 'center' : 'left',
		bold: p.TEXTBOX2_BOLD
	} );
	
	slide_row += 1;
}


// Inline save
pptx.save( dest_folder + '/' + exportName );
if (gConsoleLog) console.log('\nFile created:\n' + ' * ' + exportName);

// ============================================================================

if (gConsoleLog) console.log(`
--------------
PPTX COMPLETE!
--------------
`);
