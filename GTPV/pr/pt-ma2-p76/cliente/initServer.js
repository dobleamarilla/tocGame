H.ConstantGTPV = { producto: "TPV", version: "0.1" };

H.AppInicializarConServidor = function() {
	var my = {};
	var div0 = $("<div>").absolutePos(0, heightSubMenu.getPerc(), 100, 100);
	var divE = $("<div>")._100x100().css({ padding: SEP }).addClass("ui-widget-content").appendTo(div0);
	var divE2 = $("<div>")._100x100().css({ position: "relative", height: "100%" }).appendTo(divE);
	var divIP = $("<div>").css({ textAlign: "center" }).appendTo(divE2);
	var input = $("<input type='text' size='30'/>").appendTo(divIP); 
	$("<div>").css({height: "0.5em"}).appendTo(divIP);
	var password = $("<input type='password' size='30'/>").appendTo(divIP);
	$("<div>").css({height: "0.5em"}).appendTo(divIP);
	var keyboard = new Keyboard();
	keyboard.getDiv().appendTo(divE2);
	var divC = $("<div>")._100x100().css({ padding: SEP }).addClass("ui-widget-content").appendTo(div0);
	divC.text("Conectando..."); 
	
	my.init = function() {
		div0.appendTo(layoutPrincipal.content).hide();
		Resize.add(function() { resized = {}; resizeDiv0(); }); 
	}
	my.start = function() {
		div0.showAlone();
		divE.showAlone();
		input.val("").focus(function() { keyboard.setInput(input); });
		password.val("").focus(function() { keyboard.setInput(password); });
		keyboard.reset();
		keyboard.setInput(input);
		keyboard.setCallback(callbackKeyboard); 
		resizeDiv0();
	};

	var resized = {};
	
	function resizeDiv0() {
		if (resized.div0) return; 
		if (!div0.isVisible()) return;
		var w0 = divE2.width(), h0 = divE2.height();
		var h2 = divIP.height(), w2 = divIP.width(); 
		keyboard.absolutePosPx(0, h2, w2, h0);
		resized.div0 = true;
	}
	function callbackKeyboard(m) {
		if (m == "cancel") my.start();
		if (m == "enter") {
			if (keyboard.getInput() === input) {
				password.val("");
				keyboard.reset();
				keyboard.setInput(password);
			} else {
				divC.showAlone();
				var initData = {user: input.val(), password: password.val(), 
								producto: H.ConstantGTPV.producto, version: H.ConstantGTPV.version};
				H.Server.programCommunication(0, initData);
			}
		}
	}
	return my;
}();
