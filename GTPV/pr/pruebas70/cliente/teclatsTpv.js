function newDivTeclatsTpv() {
	var my = {};

	var Config = {
		hAmbients : 0.25,
//		hTeclado : 0.6,
		nButX : 6,
		nButY : 6,
		wKeyboardEntrar: .7,
		hKeyboardEntrar: .8, //????????
	}

	var D = {};

	// div Ambients Teclats
	var divAT = div100x100();
	my.getDiv = function() { return divAT; }

	function changeDatosHandler() { if (isDivVisible(divAT)) my.redraw(D);	}
	my.init = function() { DatosArticles.init(changeDatosHandler); }

	function codiBarresHandler(cb) {
		if (cb == null) return;
		var art = cb.article;
		if (art == null) return;
		if (!isDivVisible(divAT)) return;
		if (D.estado != "entrar") {
			my.selectedArticleHandler({ codiArticle: art.codi, article: art, color: null });
		} else {
			var idx = DatosArticles.getIdxByArticle(art);
			var numNivells = DatosArticles.getNumNivellsFamilies();
			D.buscar = new Array(numNivells+1);
			D.buscar[numNivells] = { idx: idx, obj: art };
			var idxFam = art.idxFamilia;
			while (true) {
				var fam = DatosArticles.getFamiliaByIdx(idxFam);	
				if (fam.nivell == 0) break;
				D.buscar[fam.nivell-1] = { idx: idxFam, obj:fam };
				idxFam = fam.idxPare;
			} 
			D.estado = "buscar";
			redrawDivTBE();
		}
	}
	
	my.redraw = function(_datos) {
		D = (_datos || {});
		D.estado = (D.estado || "teclat");
		
		ambientsScroll.removeAll();

		var posAct = -1, t;
		for (var i=0; (t=DatosArticles.getAmbientByIndex(i)) != null; i++) {
			if (t.ambient == D.ambientActual) posAct=i;
			AmbientModel.clone(true).text(t.ambient)
			                        .data("ambient", t.ambient).data("idx", i) 						
                                    .addClass("ui-state-default")
									.appendTo(ambientsScroll.newElement());
		}
		if (posAct == -1) {  // ambientActual ha desaparecido
			t = DatosArticles.getAmbientByIndex(0);
			if (t != null) {
				posAct = 0;
				D.ambientActual = t.ambient; 	// cojer primer ambient
			} else D.ambientActual = null;   // no hay ambients
		} // no else!
/*		if (posAct != -1) {
			ambientsScroll.get(posAct).children().addClass("ui-state-active");	
			ambientsScroll.scrollTo(posAct, true)
		}
*/
		ambientsScroll.redraw();
		my.setAmbientActual(D.ambientActual);
		
//		redrawDivTBE();
		CodisBarres.register(codiBarresHandler);
	}
//		setButtonsTeclatsTpv(ambientActual);

	var fResize = {};
	
	my.resize = function() {
		fResize = {};
		var wDC = divAT.width(), hDC = divAT.height();

		ambientsScroll.getDiv().height(heightSubMenu.getPX());
		ambientsScroll.redraw();

		divTBE.height(hDC-heightSubMenu.getPX());
		resizeDivTBE();
//		divAT.height(ambientsScroll.getDiv().height()+divTBE.height());
	}
	
	var cursorArticles = "auto";
	my.setCursorArticles = function(_cursor) {
		cursorArticles = _cursor;
		$("button", divTeclat).css({ cursor: cursorArticles });
	}
	
	var ambientsScroll = new gScroll("_lr", Config.nButX);
	ambientsScroll.getDiv().appendTo(divAT);
	
	my.setAmbientActual = function(newAmbient) {
		var el;
		D.ambientActual = newAmbient;
		for (var i=0; (el = ambientsScroll.get(i)) != null; i++) {
			el = el.children();
			if (newAmbient == el.data("ambient")) {
				el.addClass("ui-state-active");
				ambientsScroll.scrollTo(i, true);
			} else { el.removeClass("ui-state-active"); }
		}
//		D.estado = "teclat";
		redrawDivTBE();
//		resizeDivTBE();
//		setButtonsTeclatsTpv(D.ambientActual);
	}
	my.getAmbientActual = function() { return D.ambientActual; }

	my.clickAmbientHandler = function() {};
	
	function clickButtonAmbient(e) {
		var el = $(this);
		my.clickAmbientHandler(el.data("ambient"), el.data("idx"));
		D.estado = "teclat";
		my.setAmbientActual(el.data("ambient"));
	}
    
	var AmbientModel = $("<button>").css({boxSizing: "border-box", width: "100%", height: "100%", margin: "0px"})
						            /*.addClass("ui-corner-all")*/
						            .mousedown(clickButtonAmbient);
	
	// div Teclats Buscar Entrar 
	var divTBE = $("<div>").appendTo(divAT);

	my.redrawTeclat = function() {
		redrawDivTBE();
	}
	
	function redrawDivTBE() {
		divShow(divAT);
		divTBE.children().hide();
		switch (D.estado) {
			case "teclat" :
			case null :
				divTeclat.show();
				redrawDivTeclat();
				break;
			case "buscar" :
				divBuscar.show();
				redrawDivBuscar();	
				break;
			case "entrar" :
				divEntrar.show();
				redrawDivEntrar();
				break;
		}
		resizeDivTBE();
	}
	
	function resizeDivTBE() {
		switch (D.estado) {
			case "teclat" :
			case null :
				resizeDivTeclat();
				break;
			case "buscar" :
				resizeDivBuscar();
				break;
			case "entrar" :
				resizeDivEntrar();
				break;
		}
	}
	
	// Teclats Articles
	
	var divTeclat = $("<div>").addClass("ui-widget-content").css({position: "relative", height: "100%"})
	                          .appendTo(divTBE);

	my.selectedArticleHandler = function() {};
	
	function clickButtonTeclatHandler(e) {
		var el = $(this);
		my.selectedArticleHandler(el.data("data"), el);
	}

	var buttonModel = $("<button>").css({boxSizing: "border-box", margin: "0px", 
								         color: "black", verticalAlign: "middle"})
						           /*.addClass("ui-corner-all")*/
						           .click(clickButtonTeclatHandler);
	var buttonsTeclat = [];
	var nX = Config.nButX, nY = Config.nButY;
	for (var x=0; x<nX; x++) {
		for (var y=0; y<nY; y++) {
			buttonsTeclat[x*nY+y] = buttonModel.clone(true).data("pos", x*nY+y).appendTo(divTeclat);
		}
	}
	
	function getBackgroundColor(color) {
		if ((typeof color == "number") && (color >= 0) && (color < 256*256*256)) 
			return "rgb("+[(color>>16)%256, (color>>8)%256, color%256].join(",")+")";
		return "";
	}
	my.displayEmptyArticles = false;
	function redrawDivTeclat() {
		var ambient = D.ambientActual;
		var t = (DatosArticles.getAmbient(ambient) || {buttons: []});
		
		for (var i=0; i<buttonsTeclat.length; i++) {
			var data = t.buttons[i], but = buttonsTeclat[i];
			
			if ((data == null) || (data.article == null)) {
				data = { codiArticle: null, ambient: ambient, pos: i, color: null };
				var text = "";
				var bg = "";
				var visibility = my.displayEmptyArticles; 
				var underline = false;
			} else { 
				var text = data.article.nom || "";
				var bg = getBackgroundColor(data.color);
				var visibility = true;
				var underline = (!data.article.esSumable); 
			}
			but.text(text).data("data", data)
			              .css({ backgroundColor: bg, textDecoration: (underline ? "underline" : "none"), 
						         visibility: (visibility ? "visible" : "hidden") });
		}
	}

	function resizeDivTeclat() {
		if (fResize.divTeclat === false) return;
		var w1=divTeclat.width(), h1=divTeclat.height();
		var nX = Config.nButX, nY = Config.nButY;
		for (var x=0; x<nX; x++) {
			for (var y=0; y<nY; y++) {
				posAbsolutePX(buttonsTeclat[x*nY+y], (x/nX)*w1, (y/nY)*h1, ((x+1)/nX)*w1, ((y+1)/nY)*h1);
			}
		}
		fResize.divTeclat = false;
	}
				
	// Buscar Article
	
	function clickBuscarArticleHandler(e) {
		switch (D.estado) {
			case "buscar":
			case "entrar":
				D.estado = "teclat";
				break;
			case "teclat":
			case null:
			default:
				D.estado = "buscar";
		}	
		redrawDivTBE();
//		resizeDivTBE();
	}
	var buttonBuscarArticle = $("<button>").text("Buscar Article").click(clickBuscarArticleHandler);
	my.getButtonBuscarArticle = function() { return buttonBuscarArticle; }
	
	var divBuscar = $("<div>").css({position: "relative", height: "100%"}).appendTo(divTBE);
	
	function clickEntrarArticleHandler(e) {
		D.estado = "entrar";
		inputEntrar.val("");
		keyboardEntrar.reset();
		redrawDivTBE();
//		resizeDivTBE();
	}
	var buttonEntrarArticle = $("<button>").text("Entrar Producto").appendTo(divBuscar).click(clickEntrarArticleHandler);

	function clickNivellHandler(e) {
		var niv = $(this).data("niv"), idx = $(this).data("idx");
		D.buscar[niv] = { idx: idx };
/*		if (niv == numNivells) {
			D.buscar[niv].obj = DatosArticles.getArticleByIdx(idx);
			my.selectedArticleHandler({ article: D.buscar[niv].obj });
		} else {
			D.buscar[niv].obj = DatosArticles.getFamiliaByIdx(idx);
			for (var i=niv+1; i<numNivells+1; i++) D.buscar[i] = null;
		}
*/
		D.buscar[niv].obj = DatosArticles.getFamiliaByIdx(idx);
		for (var i=niv+1; i<numNivells+1; i++) D.buscar[i] = null;
		for (var i=0; (el = nivellsScroll[niv].get(i)) != null; i++) {
			el = el.children();
			el[(idx == el.data("idx")) ? "addClass" : "removeClass"]("ui-state-active");
		}
		redrawDivBuscar(niv+1);
	}
	var nivellArticleSelected = null;
	function clickNivellArticleHandler(e) {
		var art = this.gtpvUserData.art, idx = this.gtpvUserData.idx;
		var obj = DatosArticles.getArticleByIdx(idx);
		if (obj == art) { // no se si puede pasar
			if (nivellArticleSelected != null) nivellArticleSelected.removeClass("ui-state-active");
			D.buscar[numNivells] = { idx: idx };
			D.buscar[numNivells].obj = art;
			my.selectedArticleHandler({ codiArticle: art.codi, article: art, color: null });
			nivellArticleSelected = $(this).addClass("ui-state-active");
		}
	}

	var nivellModel = $("<button>").css({width:"100%", height:"100%"}).addClass("ui-state-default");
	var defaultElementNivells = nivellModel.clone(false).html("X<br>X");  
	var nivellsScroll = [];
	var numNivells = null;

	function redrawDivBuscar(nivInicial) {
		nivInicial = nivInicial || 0;
		var currentNumNivells = DatosArticles.getNumNivellsFamilies(); 
		if (currentNumNivells == 0) {
			D.estado = "teclat";
			redrawDivTBE();
			return;
		}
		if (numNivells != currentNumNivells) {
			numNivells = currentNumNivells;
			for (var i=0; i<numNivells+1; i++) {
				if (nivellsScroll[i] == null) {
					nivellsScroll[i] = new gScroll("_ud", defaultElementNivells.clone(false)); 
					nivellsScroll[i].getDiv().css({position: "absolute", top: "0px", bottom: "0px"}).appendTo(divBuscar);
				}
				nivellsScroll[i].getDiv().show();
				nivellsScroll[i].getDiv().css({ cursor: "auto" });
			}
			while (nivellsScroll[i] != null) { nivellsScroll[i].getDiv().hide(); i++ }
			D.buscar = null;
			nivInicial = 0;
			fResize.divBuscar = true;
		}
		if ( (D.buscar != null) && 
			 ( (D.buscar.length != numNivells+1) ||
			   ((D.buscar[0] != null) && (D.buscar[0].obj != DatosArticles.getFamiliaByIdx(D.buscar[0].idx))) ||
			   ((D.buscar[numNivells] != null) && (D.buscar[numNivells].obj != DatosArticles.getArticleByIdx(D.buscar[numNivells].idx))) 
		   ) ) {
			D.buscar = null;
		} // no else
		if (D.buscar == null) {	D.buscar = new Array(numNivells+1);	}

		var art = null, lastF = null;
		var fam = DatosArticles.getFamiliaByIdx(DatosArticles.getIdxNivell0());
		for (var niv=0; niv<numNivells; niv++) {
			var idxSubF = null, pos = null;
			var b = D.buscar[niv];
			if (b != null) { idxSubF = b.idx; }
			
			if (niv >= nivInicial) {
				nivellsScroll[niv].removeAll();
				for (var i=0; i<fam.subF.length; i++) {
					var subF = DatosArticles.getFamiliaByIdx(fam.subF[i]);
					var el = nivellModel.clone(true).text(subF.nom).data("niv", niv).data("idx", fam.subF[i])
					                                .mousedown(clickNivellHandler)
					                                .appendTo(nivellsScroll[niv].newElement());
					if (idxSubF == fam.subF[i]) {
						el.addClass("ui-state-active");
						pos = i;
					}
				}
				if (pos != null) nivellsScroll[niv].scrollTo(pos, true); 
				nivellsScroll[niv].redraw();	
			}

			if (b != null) { fam = b.obj; } 
			else { niv++; break; }
		}
		for (; niv<numNivells; niv++) {
			nivellsScroll[niv].removeAll();
			nivellsScroll[niv].redraw();	
		}

		if (niv >= nivInicial) {
			nivellsScroll[niv].removeAll();
			nivellsScroll[niv].setContentNewElement(nivellModel.clone(false).css({ cursor: cursorArticles }));
			var idxArt = null, pos = null;
			var b = D.buscar[niv];
			if (b != null) idxArt = b.idx;
			for (i=0; i<fam.art.length; i++) {
				var art = DatosArticles.getArticleByIdx(fam.art[i]);
				var el = nivellsScroll[niv].newElementWithContent();
				el.textContent = art.nom;
				el.gtpvUserData = { art: art, idx: fam.art[i] };
				el.addEventListener("mousedown", clickNivellArticleHandler, false);
				if (idxArt == fam.art[i]) {
					nivellArticleSelected = $(el).addClass("ui-state-active");
					pos = i;
				}
			}
			if (pos != null) nivellsScroll[niv].scrollTo(pos, true); 
			nivellsScroll[niv].getDiv().css({ cursor: cursorArticles });
			nivellsScroll[niv].redraw();	
		}
	}
	function resizeDivBuscar() {
		if (fResize.divBuscar === false) return;
		var w0=divBuscar.width(), h0=divBuscar.height();
		var nW = numNivells+2;
		buttonEntrarArticle.width(Math.round(w0/nW));
		var top = buttonEntrarArticle.outerHeight(true), left = 0, nextLeft;
		for (var i=0; i<numNivells; i++) {
			nextLeft = Math.round((i+1)*w0/nW);
			nivellsScroll[i].getDiv().css({ left: left+"px", top: top+"px", width: (nextLeft-left)+"px" });
			left = nextLeft; top = 0;	
			nivellsScroll[i].redraw();	
		}
		nivellsScroll[i].getDiv().css({ left: left+"px", top: top+"px", width: (w0-left)+"px" });
		nivellsScroll[i].redraw();	
		fResize.divBuscar = false;
	}
	
	// Entrar Article
	
	var divEntrar = $("<div>").css({position: "relative", height: "100%"}).appendTo(divTBE);
	
	var inputEntrar = $("<input type='text'>").css({position: "absolute", margin: SEP}).appendTo(divEntrar);
	var keyboardEntrar = new Keyboard();
	keyboardEntrar.getDiv().css({position: "absolute"}).appendTo(divEntrar);
	keyboardEntrar.setInput(inputEntrar);
	keyboardEntrar.getButtons("enter").attr("disabled", "disabled");
	keyboardEntrar.setCallback(function(m) {
		switch(m) {
			case "cancel" :
				D.estado = "buscar";
				redrawDivTBE();
				break;
			case "change" :
				redrawDivEntrar();
				break;	
		}
	});
	function clickAutoCompleteEntrarHandler(e) {
		var art = this.gtpvUserData.art, idx = this.gtpvUserData.idx;
		var numNivells = DatosArticles.getNumNivellsFamilies();
		D.buscar = new Array(numNivells+1);
		D.buscar[numNivells] = { idx: idx, obj: art };
		var idxFam = art.idxFamilia;
		while (true) {
			var fam = DatosArticles.getFamiliaByIdx(idxFam);	
			if (fam.nivell == 0) break;
			D.buscar[fam.nivell-1] = { idx: idxFam, obj:fam };
			idxFam = fam.idxPare;
		} 
		D.estado = "buscar";
		redrawDivTBE();
	}
	var modelAutoCompleteEntrar = $("<button>").css({width:"100%", height:"100%"}).addClass("ui-state-default");
	var defaultAutoCompleteElementEntrar = modelAutoCompleteEntrar.clone(false).html("X<br>X");
	var autoCompleteEntrar = new gScroll("_ud", defaultAutoCompleteElementEntrar);
	autoCompleteEntrar.getDiv().css({position: "absolute", margin: SEP}).appendTo(divEntrar);

	function redrawDivEntrar() {
		autoCompleteEntrar.removeAll();
		autoCompleteEntrar.setContentNewElement(modelAutoCompleteEntrar.clone(false).css({ cursor: cursorArticles }));
		var inputCompare = preProcessCompareNom(inputEntrar.val());
		if (inputCompare.length < 2) return;
		var art;
		for (var i=0; (art = DatosArticles.getArticleByIdx(i)) != null; i++) {
			if (art.compareNom.indexOf(inputCompare) != -1) {
				var el = autoCompleteEntrar.newElementWithContent();
				el.textContent = art.nom;
				el.gtpvUserData = { art: art, idx: i };
				el.addEventListener("mousedown", clickAutoCompleteEntrarHandler, false);
			}
		}
		autoCompleteEntrar.redraw();
	}
	
	function resizeDivEntrar() {
		if (fResize.divEntrar === false) return;
		var w0 = divEntrar.width(), h0 = divEntrar.height();
		inputEntrar.css({left: "0px", width: (w0*Config.wKeyboardEntrar)+"px"});
		positionKeyboard(keyboardEntrar, SEPpx, getOH(inputEntrar), w0*Config.wKeyboardEntrar-SEPpx, h0-SEPpx);
		posAbsolutePX(autoCompleteEntrar.getDiv(), w0*Config.wKeyboardEntrar, 0, w0, h0);
		autoCompleteEntrar.redraw();
		fResize.divEntrar = false;
	}
	
	return my;
}

var DatosArticles = (function(){
	var my = {};
	var datosTeclats = [], datosArticles = [], datosFamilies = [], datosCodisBarres = [], idxNivell0 = null, maxNivell = 0;
	var changeHandlers = [];

	function callbackChangeHandlers() {
		for (var i=0; i<changeHandlers.length; i++) { changeHandlers[i](); }
	}
	
	var fInit = false;
	my.init = function(changeHandler) {
		if (typeof changeHandler == "function") { changeHandlers.push(changeHandler); }
		if (!fInit) {
			obtenerDB();
			callbackReloadDBCom.add(function() { obtenerDB(); });
			fInit = true;
		}
	}
	function getSortFunction(propName) {
		return function(a,b) { a=a[propName]; b=b[propName]; return ((a < b) ? -1 : ((a > b)?1:0)); }	
	}
	my.getAmbient = function(ambient) {
		for (var i=0, t=null; i<datosTeclats.length; i++) {
			if (datosTeclats[i].ambient == ambient) {t=datosTeclats[i]; break;}
		}
		return t;
	}
	my.getAmbientByIndex = function(idx) { return datosTeclats[idx]; }

	function getOrNewAmbient(ambient) {
		var t =	my.getAmbient(ambient);
		if (t == null) {
			t = {ambient: ambient, buttons: []};
			datosTeclats.push(t);
		}
		return t;
	}

	my.addAmbient = function(ambient) {
		var t =	my.getAmbient(ambient);
		if (t != null) return false;
		var but = { ambient: ambient, pos: 0, codiArticle: null, color: 0 };
		my.addArticleTeclat(but);
		datosTeclats = datosTeclats.sort(getSortFunction("ambient"));
		return true;
	}	
	
	my.renAmbient = function(oldAmbient, newAmbient) {
		var t =	my.getAmbient(oldAmbient);
		if (t == null) return false;
		t.ambient = newAmbient;
		t.buttons.forEach(function(el) { el.ambient = newAmbient; });
		datosTeclats = datosTeclats.sort(getSortFunction("ambient"));
		var db = DB.openPrincipal();
		db.transaction(function(tx) {
			DB.exec(tx, "UPDATE [TeclatsTpv] SET ambient = ? WHERE ambient = ?", [newAmbient, oldAmbient]);
		});
		return true;
	}

	my.delAmbient = function(ambient) {
		var t =	my.getAmbient(ambient);
		if (t == null) return false;
		datosTeclats.splice(datosTeclats.indexOf(t), 1);
		var db = DB.openPrincipal();
		db.transaction(function(tx) {
			DB.exec(tx, "DELETE FROM [TeclatsTpv] WHERE ambient = ?", [ambient]);
		});
		return true;
	}
	
	my.addArticleTeclat = function(but) {
		var t = getOrNewAmbient(but.ambient);
		t.buttons[but.pos] = but;
		var db = DB.openPrincipal();
		db.transaction(function(tx) {
			DB.exec(tx, "DELETE FROM [TeclatsTpv] WHERE (ambient = ?) AND (pos = ?)", [but.ambient, but.pos]);
			DB.exec(tx, "INSERT INTO [TeclatsTpv] (ambient, article, pos, color) VALUES (?, ?, ?, ?)",
				[but.ambient, but.codiArticle, but.pos, but.color]
			);	
		});
	}
	
	my.getArticleTeclat = function(ambient, pos) {
		var t = my.getAmbient(ambient);
		if (t != null) return t.buttons[pos];
		else return null;
	}
	
	my.delArticleTeclat = function(but) {
		if ((but.pos == null) || (but.codiArticle == null)) return;
		var t = my.getAmbient(but.ambient);
		if (t != null) { t.buttons[but.pos] = null; }
		but.codiArticle = null;
		but.article = null;
		my.addArticleTeclat(but);
	}
	
	my.changeArticleTeclat = function(but1, but2) {
		var t1,t2;
		
		if (but1.pos != null) { t1 = my.getAmbient(but1.ambient); }
		if (but2.pos != null) { t2 = my.getAmbient(but2.ambient); }
		if (t1 != null) { t1.buttons[but1.pos] = $.extend({}, but2, {ambient: but1.ambient, pos: but1.pos}); }
		if (t2 != null) { t2.buttons[but2.pos] = $.extend({}, but1, {ambient: but2.ambient, pos: but2.pos}); }
		var db = DB.openPrincipal();
		db.transaction(function(tx) {
			if (but1.pos != null) {
				DB.exec(tx, "DELETE FROM [TeclatsTpv] WHERE (ambient = ?) AND (pos = ?)", [but1.ambient, but1.pos]);
				DB.exec(tx, "INSERT INTO [TeclatsTpv] (ambient, article, pos, color) VALUES (?, ?, ?, ?)",
					[but1.ambient, but2.codiArticle, but1.pos, but2.color]
				);	
			}
			if (but2.pos != null) {
				DB.exec(tx, "DELETE FROM [TeclatsTpv] WHERE (ambient = ?) AND (pos = ?)", [but2.ambient, but2.pos]);
				DB.exec(tx, "INSERT INTO [TeclatsTpv] (ambient, article, pos, color) VALUES (?, ?, ?, ?)",
					[but2.ambient, but1.codiArticle, but2.pos, but1.color]
				);	
			}
		});
	}

	my.changeColorArticleTeclat = function(but, color) {
		but.color = color;
		var db = DB.openPrincipal();
		db.transaction(function(tx) {
			DB.exec(tx, "UPDATE [TeclatsTpv] SET color = ? WHERE (ambient = ?) AND (pos = ?)", 
			              [but.color, but.ambient, but.pos]);
		});
	}
	
	my.getArticleByIdx = function(idx) { return datosArticles[idx]; }
	my.getIdxByArticle = function(art) { return datosArticles.indexOf(art); }
		
	my.getFamiliaByIdx = function(idx) {
//		if (idx == null) idx = idxNivell0;
		return datosFamilies[idx];
	}
	my.getIdxNivell0 = function() { return idxNivell0; }
	my.getNumNivellsFamilies = function() { return maxNivell; }
	
	my.findCodiBarres = function(codi) {
		var inf = 0, sup = datosCodisBarres.length-1;
		while (inf <= sup) { 
			var mid = Math.floor((inf+sup)/2),
				midC = datosCodisBarres[mid];
			if (codi == midC.codi) return midC;
			if (codi < midC.codi) sup = mid-1;
			else inf = mid+1;
		}
		return null;
	}

	function obtenerDB() {
		var db = DB.openPrincipal();
		var resTeclats = null, resArticles = null, resFamilies = null, resCodisBarres = null;
		
		function copyRows(rows) {
			var res=[];
			for (var i=0; i<rows.length; i++) {
				var row = rows.item(i), obj = {}; // props de rows readonly
				for (var prop in row) { if (row.hasOwnProperty(prop)) { obj[prop] = row[prop]; } }
				res.push(obj);	
			}
			return res;
		}
		db.transaction(function (tx) {
			var stat = "SELECT [Ambient] as [ambient], [Article] as [codiArticle], [Pos] as [pos], [Color] as [color] "
			          +"FROM [TeclatsTpv] ";
			var params = [];
			if (GlobalGTPV.get("Llicencia") != null) {
				stat += "WHERE ([Llicencia] = ?) OR ([Llicencia] IS NULL) ";
				params.push(GlobalGTPV.get("Llicencia"));
			}
			stat +="ORDER BY [Data] ASC";
			DB.exec(tx, stat, params, function (tx,res) {
				resTeclats = copyRows(res.rows);
				procesarDatos();
			}, function (tx,e) { resTeclats = []; procesarDatos(); return false; });
			var stat = "SELECT [Codi] as [codi], [NOM] as [nom], [PREU] as [preu], [EsSumable] as [esSumable], [Familia] as [familia] "
			          +"FROM [Articles] ";
			DB.exec(tx, stat, [], function (tx,res) {
				resArticles = copyRows(res.rows);
				procesarDatos();
			}, function (tx,e) { resArticles = []; procesarDatos(); return false; });
			var stat = "SELECT [Nom] as [nom], [Pare] as [pare], [Nivell] as [nivell] FROM [Families] ";
			DB.exec(tx, stat, [], function (tx,res) {
				resFamilies = copyRows(res.rows);
				procesarDatos();
			}, function (tx,e) { resFamilies = []; procesarDatos(); return false; });
			var stat = "SELECT [Codi] as [codi], [Producte] as [codiArticle] FROM [CodisBarres]";
			DB.exec(tx, stat, [], function (tx,res) {
				resCodisBarres = copyRows(res.rows);
				procesarDatos();
			}, function (tx,e) { resCodisBarres = []; procesarDatos(); return false; });
		});

		function procesarDatos() {

			if ((resTeclats == null) || (resArticles == null) || (resFamilies == null) || (resCodisBarres == null)) { return; }
			resArticles.forEach(function(el) { 
				if (el.nom == null) el.nom=""; 
				if (el.codi == null) el.codi=0;
				el.esSumable = (el.esSumable != 0); 
				el.compareNom = preProcessCompareNom(el.nom);
			});
			resArticles = resArticles.sort(getSortFunction("codi"));

			function findArticleByCodi(codi) {
				var inf = 0, sup = resArticles.length-1;
				while (inf <= sup) { 
					var mid = Math.floor((inf+sup)/2),
						midArt = resArticles[mid];
					if (codi == midArt.codi) return midArt;
					if (codi < midArt.codi) sup = mid-1;
					else inf = mid+1;
				}
				return null;
			}
			
			datosTeclats = [];
			for (var i=0; i<resTeclats.length; i++) {
				var but = resTeclats[i];
				but.article = findArticleByCodi(but.codiArticle);	
				if (but.ambient != null) getOrNewAmbient(but.ambient).buttons[but.pos] = but;
			}
			datosTeclats = datosTeclats.sort(getSortFunction("ambient"));

			datosCodisBarres = [];
			for (var i=0; i<resCodisBarres.length; i++) {
				var cb = resCodisBarres[i];
				if ((cb.codi != null) && (cb.codi != "")) {
					cb.article = findArticleByCodi(cb.codiArticle);
					if (cb.article != null) datosCodisBarres.push(cb);
				}
			}
			datosCodisBarres = datosCodisBarres.sort(getSortFunction("codi"));
			
			resArticles = resArticles.sort(getSortFunction("nom"));
			resFamilies = resFamilies.sort(getSortFunction("nom"));
			
			var nivellsSinNombre = [],
			    idxNivellSinNombre = resFamilies.length-1,
			    idxMaxNivellSinNombre = idxNivellSinNombre;
			
			idxNivell0 = null;
			for (var i=0; i<resFamilies.length; i++) {
				var nivell = resFamilies[i].nivell; 
				if (nivell == 0) { idxNivell0 = i; }
				resFamilies[i].subF = [];
				resFamilies[i].art = [];
			}
			if (idxNivell0 == null) {
				idxNivell0 = resFamilies.length;
				resFamilies.push({ nom: "", nivell: 0, subF:[], art: [] });
			}


			var lenFamilies = resFamilies.length;
			var lastNivellSinNombre = 0, idxLastNivellSinNombre = idxNivell0;
			function getNivellSinNombre(nivell) {
				while (lastNivellSinNombre < nivell) {
					resFamilies[idxLastNivellSinNombre].subF.push(resFamilies.length);
					resFamilies.push({ nom: "Sin nombre", nivell: lastNivellSinNombre+1, 
					                   idxPare: idxLastNivellSinNombre, subF: [], art: [] });
					lastNivellSinNombre++;
					idxLastNivellSinNombre = resFamilies.length-1;
				}
				return ((idxLastNivellSinNombre-lastNivellSinNombre)+nivell);
			}
			function findPare(familia) {
				if (familia.nivell == 1) return idxNivell0;
				for (var i=0; i<lenFamilies; i++) {
					if ((familia.pare == resFamilies[i].nom) && (familia.nivell-1 == resFamilies[i].nivell))
						return i;
				}
				return null;
			}
			for (var i=0; i<lenFamilies; i++) {
				var familia = resFamilies[i], nivell = familia.nivell;
				familia.nom = (familia.nom || "");
				if (nivell > 0) {
					var idxPare = findPare(familia);
					if (idxPare == null) { idxPare = getNivellSinNombre(nivell); } 
					resFamilies[idxPare].subF.push(i);
					familia.idxPare = idxPare;
				}
			}
			
			function findFamilia(nom) {
				if (nom == null) return null;
				for (var i=0; i<resFamilies.length; i++) {
					if ((resFamilies[i].nom == nom) && (resFamilies[i].nivell > 0))
						return i;
				}
				return null;
			}
			for (var i=0; i<resArticles.length; i++) {
				var article = resArticles[i];
				article.nom = (article.nom || "");
				var idxFamilia = findFamilia(article.familia);
				if (idxFamilia == null) { idxFamilia = getNivellSinNombre(1); }
				article.idxFamilia = idxFamilia;
				resFamilies[idxFamilia].art.push(i);
			}
//			if ((maxNivell == 0) && (resArticles.length > 0)) maxNivell = 1;
			

/*			function fSortSubF(a,b) {
				a=resFamilies[a].nom; b=resFamilies[b].nom; return ((a < b) ? -1 : ((a > b)?1:0)); 	
			}
			function fSortArt(a,b) {
				a=resArticles[a].nom; b=resArticles[b].nom; return ((a < b) ? -1 : ((a > b)?1:0)); 	
			}
			for (var i=0; i<resFamilies.length; i++) {  // ordenar
				var familia = resFamilies[i];
				familia.subF = familia.subF.sort(fSortSubF);
				familia.art = familia.art.sort(fSortArt);
			}
*/			for (var i=resFamilies.length-1; i>=lenFamilies; i--) { // sin nombre al final
				var subF = resFamilies[resFamilies[i].idxPare].subF;
				subF.splice(subF.indexOf(i),1); subF.push(i);
			}
			
			// eliminar familias sin elementos
			function deleteFamilia(i) {
				var fam = resFamilies[i];
				var idxPare = fam.idxPare;
				if (idxPare != null) {
					var pare = resFamilies[idxPare];
					pare.subF.splice(pare.subF.indexOf(i), 1);
					fam.idxPare = null;
					deleteIfNeeded(idxPare);
				}
			}
			function deleteIfNeeded(i) {
				var fam = resFamilies[i];
				if ((fam.subF.length == 0) && (fam.art.length == 0)) deleteFamilia(i);
			}
			for (var i=0; i<resFamilies.length; i++) {
				deleteIfNeeded(i);
			}

			maxNivell = 0;

			for (var i=0; i<resFamilies.length; i++) {
				var fam = resFamilies[i];
				if ((fam.subF.length == 0) && (fam.art.length == 0)){
					if (maxNivell < fam.nivell) maxNivell = fam.nivell;
				}
			}
			
			datosArticles = resArticles;
			datosFamilies = resFamilies;

			callbackChangeHandlers();
		}
	}		
	
	return my;
})();

var CodisBarres = function(){
	var my = {};
	
	var registeredHandler = null;
	var buffer = "";
	
	function handler(e) {
		if ((e.which >= "0".charCodeAt(0)) && (e.which <= "9".charCodeAt(0))) {
			buffer+=String.fromCharCode(e.which);
		} else {
			if (buffer.length > 0) {
				var cb = DatosArticles.findCodiBarres(buffer);
				if (registeredHandler != null) registeredHandler(cb);
				buffer = "";
			}
		}
	}
	
	my.init = function() {
		$(window).keypress(handler);	
	}
	my.register = function(_rh) {
		registeredHandler = _rh;
		buffer = ""; 	
	}
	return my;
}();
