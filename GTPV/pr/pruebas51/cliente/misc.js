function marginW(div) { return div.outerWidth(true)-div.outerWidth(false); }
function marginH(div) { return div.outerHeight(true)-div.outerHeight(false); }

function setOW(div, w) { div.width(w-(div.outerWidth(true)-div.width())); }
function setOH(div, h) { div.height(h-(div.outerHeight(true)-div.height())); }
function setIW(div, w) { div.width(w); }
function setIH(div, h) { div.height(h); }
function getOW(div) { return div.outerWidth(true); }
function getOH(div) { return div.outerHeight(true); }
function getIW(div) { return div.width(); }
function getIH(div) { return div.height(); }


function positionDiv(div,x0,y0,x1,y1) {
	div = $(div || "<div>");
	div.css({position: "absolute", boxsizing: "border-box", left: x0+"%", top: y0+"%"})
	   .css((x1==100) ? {right: "0%"} : {width: (x1-x0)+"%"})
	   .css((y1==100) ? {bottom: "0%"} : {height: (y1-y0)+"%"});	
	return div;
}

function createAligner() {
	return $("<img>").attr("src", "cliente/dummy.png")
	                 .css({width: "0px", height: "100%", verticalAlign: "middle"}); 	
}

function posAbsolutePX(div, x0, y0, x1, y1) {
	x0 = Math.round(x0); y0 = Math.round(y0);
	x1 = Math.round(x1); y1 = Math.round(y1);
	div.css({position: "absolute", left: x0+"px", top: y0+"px", width: (x1-x0)+"px", height: (y1-y0)+"px"}); 	
}

function posAbsolutePXM(div, x0, y0, x1, y1) {
	x0 = Math.round(x0); y0 = Math.round(y0);
	x1 = Math.round(x1); y1 = Math.round(y1);
	div.css({position: "absolute", left: x0+"px", top: y0+"px"});
	setOW(div, x1-x0); setOH(div, y1-y0);
}

function positionKeyboard(keyboard, x0, y0, x1, y1) {
	var w = x1-x0;
	var h = w*keyboard.getNumButtonsY()/keyboard.getNumButtonsX();
	if (h > y1-y0) {
		h = y1-y0;
		w = h*keyboard.getNumButtonsX()/keyboard.getNumButtonsY();
		x0 += ((x1-x0)-w)/2;
	} else y0 += ((y1-y0)-h)/2;
	posAbsolutePXM(keyboard.getDiv(), x0, y0, x0+w, y0+h);
}

function isDivVisible(div) {
	return (div.get(0).offsetWidth > 0);
}

function preProcessCompareNom(str) {
	function translateChar(c) {
		var testChars    = "àáäèéëìíïòóöùúüñç";
		var replaceChars = "aaaeeeiiiooouuunc";
		var idx = testChars.indexOf(c);
		return (idx==-1) ? c : replaceChars.charAt(idx);
	}
	return str.toLowerCase().split("").map(translateChar).join("");
}

function formatImport(imp, symbol) {
	var strI = imp.toFixed(2);
	for (var iComa=3+1+2; iComa < strI.length; iComa+=1+3) {
		strI = strI.slice(0,-iComa)+","+strI.slice(-iComa);
	}
	if (symbol) strI = strI+" €";	

	return strI;
}

