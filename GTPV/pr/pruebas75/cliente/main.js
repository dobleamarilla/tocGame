menuPrincipal = function() {
	var my = {};
	
	var S = {};
	
	var divM = div100x100();
	var menuScroll = new gScroll("_ud", 2);
	positionDiv(menuScroll.getDiv(), 0,0, 100, 20).appendTo(divM);

	var elMenuSel = null;
	function menuHandler(e) {
		if (e.button !== 0) return;
		if (DB.inTransaction()) return;
		if (elMenuSel != null) elMenuSel.removeClass("ui-state-active");
		elMenuSel = $(this).addClass("ui-state-active");
		S.opMenuSel = $(this).data("data");
		DepActives.save();
		opMenu[S.opMenuSel].run();
	}
	var menuModel = $("<button>").css({width:"100%", height:"100%"})
	                             .addClass("ui-state-default").mousedown(menuHandler);
	
	var opMenu = {
		puerta : {
			text: "puerta",
			cssClass: "buttonPuerta",
			run: function() { procesoPuerta.start(DepActives.getActual()); },
			init: function(callbackInit) { procesoPuerta.init(layoutPrincipal.content, callbackInit);	}
		},
		venda : {
			text: "Venda",
			cssClass: "buttonVenda",
			run: function() { procesoVenda.start(DepActives.getActual());	},
			init: function(callbackInit) { procesoVenda.init(layoutPrincipal.content, callbackInit); }
		},
		editorTeclats : {
			text: "Editor Teclats",
			cssClass: "buttonEditorTeclats",
			run: function() { procesoEditorTeclats.start(DepActives.getActual());	},
			init: function(callbackInit) { procesoEditorTeclats.init(layoutPrincipal.content, callbackInit); }
		},
		cajaFuerte : {
			text: "Caja Fuerte",
			cssClass: "buttonCajaFuerte",
			run: function() { procesoCajaFuerte.start(DepActives.getActual()); },
			init: function(callbackInit) { procesoCajaFuerte.init(layoutPrincipal.content, callbackInit); }	
		},
		_abrirCaja : {
			init: function(callbackInit) { procesoAbrirCaja.init(layoutPrincipal.content, callbackInit); }	
		}
	};

	var menus = {
		noDependenta : [ "puerta" ],
		dependenta : [
			"puerta",
			"venda",
			"editorTeclats",
			"cajaFuerte"
		],
	};
	
	var opMenuInicial = {
		noDependenta : null,
		dependenta : "venda",
	}
	
	var elDependentaSel = null;
	function dependentesActivesHandler(e) {
		if (e.button !== 0) return;
		if (DB.inTransaction()) return;
		if (elDependentaSel != null) elDependentaSel.removeClass("ui-state-active");
		elDependentaSel = $(this).addClass("ui-state-active");
		DepActives.setActual($(this).data("dep"));
/*		S = DepActives.getDatosProceso("menuPrincipal", DepActives.getActual());
		redraw();
*/	}

	var dependentesActivesModel = $("<button>").css({width:"100%", height:"100%"})
	                                           .addClass("ui-state-default").mousedown(dependentesActivesHandler);
	var defaultElementDependenta = dependentesActivesModel.clone(false).html("X<br>X");  
	var dependentesActivesScroll = new gScroll("_ud", defaultElementDependenta);
	positionDiv(dependentesActivesScroll.getDiv(), 0, 20, 100, 100).appendTo(divM);

	function redraw() {
		//redraw Menu
		menuScroll.removeAll();
		elMenuSel = null;
		for (var i=0, pos=null; i < menus[S.menu].length; i++) {
			var op = menus[S.menu][i];
			var el = menuModel.clone(true).data("data", op).text(opMenu[op].text).appendTo(menuScroll.newElement());	
			//Class img background
			if (opMenu[op].cssClass != null) el.addClass(opMenu[op].cssClass);
			if (op == S.opMenuSel) {
				el.addClass("ui-state-active");
				pos = i;
				elMenuSel = el;
			} else {
				el.addClass("ui-state-default");
			}
		}
		if (pos != null) menuScroll.scrollTo(pos, true);
		menuScroll.redraw();

		//redraw Dependentes Actives
		dependentesActivesScroll.removeAll();
		elDependentaSel = null;
		for (var i=0, pos = null, dep; (dep = DepActives.getByIdx(i)) != null; i++) {
			var el = dependentesActivesModel.clone(true).text(dep.nom).data("dep", dep)
			                                            .appendTo(dependentesActivesScroll.newElement());
			if (dep == DepActives.getActual()) {
				el.addClass("ui-state-active");
				pos = i;
				elDependentaSel = el;
			} 
		}
//		if (posDepAct == -1) { posDepAct=0; codiDependentaActual = null; }
		if (pos != null) dependentesActivesScroll.scrollTo(pos, true);
		dependentesActivesScroll.redraw();
		
		if (S.opMenuSel != null) opMenu[S.opMenuSel].run();
		else { layoutPrincipal.content.children().hide(); }
	}
	my.init = function(callbackInit) {
		divM.appendTo(layoutPrincipal.menu).hide();

		var regFuncInit = 0;
		var callbackInitActive = false;
		function localCallbackInit() {
			regFuncInit--;
			if ((regFuncInit == 0) && (callbackInitActive)) callbackInit(); 	
		}
		function newCallbackInit() {
			regFuncInit++;
			return localCallbackInit;
		}
		
		function depActChange() {
			if (isDivVisible(divM)) {
				S = DepActives.getDatosProceso("menuPrincipal");
				if (S.menu == null) {
					S.menu = (DepActives.getActual().codi == null) ? "noDependenta" : "dependenta";
					S.opMenuSel = opMenuInicial[S.menu];  
				}
				redraw();
			}
		}
		
		DepActives.init(depActChange, newCallbackInit());

		for (var i in opMenu) {
			if (opMenu.hasOwnProperty(i)) opMenu[i].init(newCallbackInit());
		}
		
		Resize.add(function() {
			if (isDivVisible(divM)) {
				menuScroll.redraw();
				dependentesActivesScroll.redraw();
			}			
		});

		callbackInitActive = true;
		if (regFuncInit == 0) callbackInit();
	};
	my.start = function() {
		divShow(divM);
		
		S = DepActives.getDatosProceso("menuPrincipal");
		if (S.menu == null) {
			S.menu = (DepActives.getActual().codi == null) ? "noDependenta" : "dependenta";
			S.opMenuSel = opMenuInicial[S.menu];  
		}
		redraw();
	};
/*	my.stop = function() {
		divM.hide();	
	};
*/	my.finProceso = function() {
		S.opMenuSel = opMenuInicial[S.menu];
		redraw();
	}
	return my;
}();

procesoInicializarConServidor = function() {
	var my = {};
	var div0 = positionDiv(null,0,heightSubMenu.getPerc(),100,100);
	var divE = div100x100().css({ padding: SEP }).addClass("ui-widget-content").appendTo(div0);
	var divE2 = div100x100().css({ position: "relative", height: "100%" }).appendTo(divE);
	var divIP = $("<div>").css({ textAlign: "center" }).appendTo(divE2);
	var input = $("<input type='text' size='30'/>").appendTo(divIP); 
	$("<div>").css({height: "0.5em"}).appendTo(divIP);
	var password = $("<input type='password' size='30'/>").appendTo(divIP);
	$("<div>").css({height: "0.5em"}).appendTo(divIP);
	var keyboard = new Keyboard();
	keyboard.getDiv().appendTo(divE2);
	var divC = div100x100().css({ padding: SEP }).addClass("ui-widget-content").appendTo(div0);
	divC.text("Conectando..."); 
	
	my.init = function() {
		div0.appendTo(layoutPrincipal.content).hide();
		Resize.add(function() { fResize = {}; resizeDiv0(); }); 
	}
	my.start = function() {
		divShow(div0);
		divShow(divE);
		input.val("");
		password.val("");
		keyboard.reset();
		keyboard.setInput(input);
		keyboard.setCallback(callbackKeyboard0); 
		resizeDiv0();
	};

	var fResize = {};
	
	function resizeDiv0() {
		if (fResize.div0 === false) return; 
		if (!isDivVisible(div0)) return;
		var w0 = divE2.width(), h0 = divE2.height();
		var h2 = divIP.height(), w2 = divIP.width(); 
		positionKeyboard(keyboard, 0, h2, w2, h0);
		fResize.div0 = false;
	}
	function callbackKeyboard0(m) {
		if (m == "cancel") my.start();
		if (m == "enter") {
			password.val("");
			keyboard.reset();
			keyboard.setInput(password);
			keyboard.setCallback(callbackKeyboard1);	
		}
	}
	function callbackKeyboard1(m) {
		if (m == "cancel") my.start();
		if (m == "enter") {
			divShow(divC);
			var init = {user: input.val(), password: password.val(), 
			            producto: ConstantGTPV.producto, version: ConstantGTPV.version};
			comServer(init);
//			keyboard.callback = function() {};
		}
	}
	return my;
}();
	
function onbeforeunloadHandler() {
	return "Salir de GTPV?";
}
function initAplication() {
//	layoutPrincipal.show();
	window.onbeforeunload = onbeforeunloadHandler;
	menuPrincipal.init(function() { Caja.init(function() { menuPrincipal.start(); }); });
}

ConstantGTPV = { producto: "TPV", version: "0.1" };

$(function() {

	// main
	GlobalGTPV.init(function() {
		div100x100($("body")).css({margin : "0px"}).addClass("ui-widget");

		var testSep = $("<div>").css({ paddingTop: SEP }).appendTo("body");
		SEPpx = testSep.outerHeight()/2;
		testSep.remove();

		initScroll();
		
		CodisBarres.init();
		
		layoutPrincipal.show();
		procesoInicializarConServidor.init();
		var prefijoCliente = GlobalGTPV.get("prefijoCliente", false); 
		if (prefijoCliente == null) {
			procesoInicializarConServidor.start();
		} else {
			GlobalGTPV.setPrefijo(prefijoCliente);
			LS.init(prefijoCliente);	
			DB.init(prefijoCliente);
			initAplication();
			progComServer(2/60);
		}
	});

});

