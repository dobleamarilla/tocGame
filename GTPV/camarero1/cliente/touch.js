H.Scripts.add("touchS", "C", function() {

// touchHandler
//	  el: div para enlazar touch handler y mouse handler
//    control: { control de eventos
//        start(target, startPoint) -> touch inicial, 
//             esta función tiene que devolver el target que generara el click,
//             si devuelve false no se acepta el touch
//        swipe(dir, force) -> pasar página 
//        move(dir, m, curPoint) -> movimiento (m: desplazamiento)
//        click(clickTarget, curPoint)
//        leaveClick(outOfClick) -> se ha salido o entrado en target click
//        end()
//    }
//        solo se genera uno de swipe, click, end
//    params: ver defParams abajo
//
//    dir : 'x' o 'y'
//    point: {x: coordX, y: coordY, t: timeStamp}
//    force y movimento pueden ser positivos o negativos

window.touchHandler = function(el, control, params) {
	var my = {};

	var status;
	var eventsTouch = "touchstart touchmove touchend touchcancel";
	var eventsMouse = "mousedown mousemove mouseup"; 
	var lastPoint;
	var points = new pointsQueue();
	//var fStarted = false;
	var idTouch = null;
	var tStart;
	
	var mouseEnabled = true;
	
	my.start = function() {
		el.bind(eventsTouch, evTouchHandler);
		el.bind(eventsMouse, evMouseHandler);
		mouseEnabled = true;
	}
	
	my.stop = function() {
		el.unbind(eventsTouch, evTouchHandler);
		el.unbind(eventsMouse, evMouseHandler);
	}
	
	my.setControl = function(_control) {
		clickTarget = null; // ??
		var ret = control;
		control = _control;
		return ret;
	}
	my.getControl = function() { return control; }
	my.reset = function(fEnd) { 
		if (idTouch != null) {
			idTouch = null; 
			if (fEnd && control.end) control.end();
		}
	}
	my.touching = function() { return (idTouch != null); }
	
	my.setState = function() {
	
	}
	var defParams = {
		allowedX: true,
		allowedY: true,
		timeResetCurDirection: 1000, // tiempo y movimiento maximo para poder cambiar de dir
		moveResetCurDirection: 5,
		defaultDirection: null,
		// timeClick:750,
		// maxMoveClick:5,
		timeSwipe:350,     // si mas movimiento en menos tiempo tenemos un swipe(pasar página)
		moveSwipe:30, // changed below
		moveSwipeComplementary:75, // changed below
		minMoveFromStart:5,  // movimiento minimo para generar evento
		
	}
	var sizeWin = Math.max(window.innerWidth, window.innerHeight);
	defParams.moveSwipe = sizeWin*0.15;
	defParams.moveSwipeComplementary = sizeWin*0.4;
	
	my.params = $.extend({}, defParams, params);
	
	var curDirection = null;
	var firstMove = true;
	var lastMoveResetCurDir;
	
	function getDirection() {
		var m = points.getMove(my.params.timeResetCurDirection);
		lastMoveResetCurDir = m;
		if (!my.params.allowedX || !my.params.allowedY) {
			curDirection = (my.params.allowedX) ? 'x' : 'y';
			return curDirection;
		}
	
		var resetM = { 
			x: Math.abs(m.x) < my.params.moveResetCurDirection,
			y: Math.abs(m.y) < my.params.moveResetCurDirection
		};
		if (((curDirection == 'x') && resetM.x) ||
			((curDirection == 'y') && resetM.y))
			curDirection = null;
		if (curDirection != null) return curDirection;
		if (!resetM.x) {
			if (!resetM.y) {
				curDirection = (Math.abs(m.x) >= Math.abs(m.y)) ? 'x' : 'y';
			} else curDirection = 'x';
		} else {
			if (!resetM.y) curDirection = 'y';
			else {
				if (my.params.defaultDirection != null)
				   return my.params.defaultDirection;
				else return (Math.abs(m.x) >= Math.abs(m.y)) ? 'x' : 'y';
			}
		}
		return curDirection;		
	}
	
	var startPoint;
	my.getStartPoint = function() { return startPoint; }
	var curPoint;
	my.getCurPoint = function() { return curPoint; }
	var lastDirection;
	var lastPoint;
	var clickTarget;
	var lastOutOfClick;
	my.setClicktarget = function(target) { clickTarget = target; }
	
	function dirCompl(dir) { return (dir=='x'?'y':'x'); }
	
	function evTouchHandler(ev) {
		mouseEnabled = false;
		return evHandler(ev);
	}
	
	function evHandler(ev) {
		var touch;
		ev.preventDefault();
		if (ev.type == "touchstart") {
			if (idTouch != null) return;
			touch = ev.originalEvent.changedTouches[0];
			idTouch = touch.identifier;
			tStart = ev.timeStamp;
			points.clear();
			startPoint = {x:touch.clientX, y:touch.clientY, t:ev.timeStamp};
			curPoint = startPoint;
			lastPoint = startPoint;
			firstMove = true;
			lastDirection = null;
			lastOutOfClick = false;
			points.add(curPoint);
			if (control.start) {
				clickTarget = control.start(ev.target, startPoint); 
				if (clickTarget === false) idTouch = null; 	
			}	
		} else {
			var changed = ev.originalEvent.changedTouches;
			for (var i=0; i<changed.length; i++) {
				if (changed[i].identifier == idTouch) {
					touch = changed[i];
					break;
				}
			}
			if (touch == null) return;
			curPoint = {x:touch.clientX, y:touch.clientY, t: ev.timeStamp};
			points.add(curPoint);
			if (ev.type == "touchcancel") {
				idTouch = null;
				if (control.end) control.end();		
				return;
			}
			var dir = getDirection();
			var outOfClick;
			if (clickTarget) {
				var curTarget = document.elementFromPoint(curPoint.x, curPoint.y);
				outOfClick = (getDOMParents(curTarget, clickTarget) == null);
			}
			if (ev.type == "touchend") {
				idTouch = null;
				// swipe
				var m = points.getMove(my.params.timeSwipe);
				if ((Math.abs(m[dir]) >= my.params.moveSwipe) && 
					(Math.abs(m[dirCompl(dir)]) <= my.params.moveSwipeComplementary)) {
					if (control.swipe) {
						control.swipe(dir, m[dir]/my.params.moveSwipe); 		
						return;
					}	
				}
				// click
				if ((outOfClick === false) && (control.click)) {
					control.click(clickTarget, curPoint);
					return;
				}
				if (control.end) control.end();
				return;
			}
			if (clickTarget && (outOfClick != lastOutOfClick)) {
				if (!control.leaveClick) clickTarget = null;
				else if (control.leaveClick(outOfClick) === false) clickTarget = null;
			}
			// touchmove
			if (firstMove) {
				var m = Math.abs(startPoint[dir]-touch["client"+((dir=='x')?'X':'Y')]);
				if (m>=my.params.minMoveFromStart) firstMove=false; 
			} // no else
			if (!firstMove) {
				clickTarget = null;
				var m;
				if (lastDirection == null) lastDirection = dir;
				if (lastDirection != dir) {
					m = lastMoveResetCurDir[dir];
				} else m = curPoint[dir]-lastPoint[dir];
				lastPoint = curPoint;
				if (control.move) {
					if (control.move(dir, m, curPoint) === false) clickTarget = null;
				}	
			}
		}
	}
	
	var mouseButPressed = false;
	var mouseTouchId = 0;
	
	function genSimulatedTouchEvent(ev, type, id) {
		return { 
			type: type,
			timeStamp: ev.timeStamp,
			originalEvent: {
				changedTouches : [{
					identifier: id,
					clientX: ev.clientX,
					clientY: ev.clientY,
				}]
			},
			target: ev.target,
			preventDefault: function() {}
		};	
	}
	function evMouseHandler(ev) {
		if (!mouseEnabled) return;
		switch (ev.type) {
			case "mousedown":
				if (ev.button == 0) {
					ev.preventDefault();
					my.reset();
					mouseButPressed = true;
					evHandler(genSimulatedTouchEvent(ev, "touchstart", ++mouseTouchId));
				}	
				return;
			case "mousemove":
				if (mouseButPressed) {
					evHandler(genSimulatedTouchEvent(ev, "touchmove", mouseTouchId));
				}	
				return;
			case "mouseup":
				if (ev.button == 0) {
					ev.preventDefault();
					mouseButPressed = false;
					evHandler(genSimulatedTouchEvent(ev, "touchend", mouseTouchId));
				}	
				return;	
		}
	}
	return my;
}

// usado por touchHandler
window.pointsQueue = function(maxDifT) {
	if (maxDifT == null) maxDifT = 4000;
	
	var my = {};
	var queue = [];
	
	my.getMove = function(dt) {
		var t = Date.now();
		var tMin = t-dt;
		var idx = queue.length-1;
		tMin = queue[idx].t - dt;
		if ((idx < 0) || (queue[idx].t < tMin)) 
			return {x:0, y:0, t:tMin};
		var maxX, minX, maxY, minY;
		var p1 = queue[idx];
		maxX = minX = p1.x;
		maxY = minY = p1.y;
		var pLast = p1;
		var fEnd = false;
		while (--idx >= 0) {
			p0 = queue[idx];
			if (p0.t < tMin) {
				p0 = interpolate(p1,p0,tMin);
				fEnd = true;
			}
			if (p0.x < minX) minX = p0.x;
			if (p0.x > maxX) maxX = p0.x;
			if (p0.y < minY) minY = p0.y;
			if (p0.y > maxY) maxY = p0.y;
			if (fEnd) break;
			p1 = p0;
		}
		var dif = {x: maxX-minX, y: maxY-minY, t:tMin};
		if (pLast.x < p0.x) dif.x = -dif.x;
		if (pLast.y < p0.y) dif.y = -dif.y;
		
		return dif;
	}
	
	my.add = function(p) {
		queue.push(p);
		var p0 = null;
		while ((p.t-queue[0].t) > maxDifT) {
			p0 = queue.shift();
		}
		if (p0 != null) {
			queue.unshift(interpolate(queue[0], p0, p.t-maxDifT));
		}
	}

	function interpolate(p1,p0,t2) {
		var p2 = {t:t2};
		p2.x = ((p1.x-p0.x)/(p1.t-p0.t))*(t2-p0.t)+p0.x;
		p2.y = ((p1.y-p0.y)/(p1.t-p0.t))*(t2-p0.t)+p0.y;
		return p2;
	}
	
	my.clear = function() {
		queue = [];
	}
	return my;
} 

// scrollTouch
//    div: div relative o absolute, contiene el contenido que hace scroll, el padre
//         de este div sera el contenedor.
//    touchH: touchHandler de arriba
//    control: {
//       newStart(target, curT) -> nuevo inicio de touch
//       move(_dir, difT, curT) -> movimiento en otra dirección, si existe y devuelve true
//           no se hace el scroll
//       swipe(_dir, difT) -> swipe similar al move anterior
//    } 
//    params: {
//       dir: 'x' o 'y'
//       fPages: boolean, scroll por páginas (cuando se acaba el touch, el scroll
//               se posiciona en el inicio de una página)
//       sizePage: tamaño de página (si es null, se cojera el tamaño del contenedor del scroll)
//       fSwipeOnePage: boolean, swipe solo movera una página
//    }
//
//    start(difT, force) : activa el scroll, el cual toma el control del touchHandler,
//                         difT y force pueden ser parametros del control de touchH, move o swipe,
//                         que activan el scroll
//    complete(fInmediate) : deja el scroll en un estado estable (dentro de los limites o
//                           al inicio de una página). si fInmediate es false, lo hara con transition css
//    scrollToVisible(trans, arg0, arg1) : mueve un elemento del scroll a una zona visible
//          trans: boolean, con transition
//          arg0: es null, mover scroll dentro de los limites si no hay touch
//      si fPages:
//          arg0: numero de página, arg1: nuevo pageSize o null
//          arg0: div visible,      arg1: nuevo pageSize o null
//      si no fPages:
//          arg0: div1,             arg1: div2, si null -> div2=div1
//          scroll visible: inicio div1 y fin div2

window.scrollT = function(div, touchH, control, params) {
	var my = {};

	if (control == null) control = {};
	var dir = params.dir;
	var fSwipeOnePage = params.fSwipeOnePage;
	var fPages = params.fPages;
	var origSizePage = params.sizePage;
	var sizePage = origSizePage;
	
	var oldControlTouch;
	var ownControl = false;
	var lastT;
	var lot	= (dir == 'x')?'left':'top';
	var WoH = (dir == 'x')?'Width':'Height'
	var minP, realSizeCont, sizeCont;
	var divParent = div.parent();
	
	function calcSizes() {
		var sizeScroll = div['o'+WoH]();
		realSizeCont = divParent['i'+WoH]();
		sizeCont = Math.min(realSizeCont, sizeScroll);
		minP = -(sizeScroll-sizeCont);
		if (fPages) {
			if (origSizePage == null) {
				sizePage = sizeCont;
				if (!fSwipeOnePage) {
					var firstChild = div.children().eq(0);
					if (firstChild) sizePage = firstChild['o'+WoH]();
				}
			}	
			minP-=(sizePage%sizeCont);
		}
	}
	
	function getLotPos() {
		return div.position()[lot];
	}
	
	function setLotPos(p) {
		div.css(lot, Math.round(p)+"px");
	}
	
	my.start = function(difT, force) {
		oldControlTouch = touchH.setControl(controlTouch);
		ownControl = true;
		var curT = touchH.getCurPoint();
		lastT = $.extend({}, curT);
		calcSizes();
		if (difT != null) {
			lastT[dir]-=difT;
			controlTouch.move(dir, difT, curT);
		}	
		if (force != null) {
			controlTouch.swipe(dir, force);
		}
	}
	
	function detachTouchHandler() {
		if (oldControlTouch != null) {
			touchH.setControl(oldControlTouch);
			oldControlTouch = null;
		} 
		var ret = ownControl;
		ownControl = false;
		return ret;
	}
	
	function normalizeP(dp) {
		if (dp>0) return Math.min(dp, realSizeCont)/3;
		if (dp<minP) return minP-Math.min((minP-dp), sizeCont)/3;
		return dp;
	}
	
	function denormalizeP(p) {
		if (p>0) return Math.min(p, realSizeCont)*3;
		if (p<minP) return minP-Math.min(minP-p, sizeCont)*3;
		return p;
	}

	var controlTouch = {
		start: function(target, curT) {
			if (getDOMParents(target, divParent) == null) {
				if (control.newStart && (control.newStart(target, curT))) return;
			}
			noTransition();
			lastT = curT;
		},
		move: function(_dir, difT, curT) {
			if (dir != _dir) { //??
				if (control.move && control.move(_dir, difT, curT)) return;
			}	
			var curP = denormalizeP(getLotPos());
			curP += (curT[dir]-lastT[dir]);
			lastT = curT;
			setLotPos(normalizeP(curP));
		},
		swipe: function(_dir, force) {
			if (dir != _dir) { //??
				if (control.swipe && control.swipe(_dir, difT)) return;
				else endTransition();
				return;
			}	

			var pos = getLotPos();
			if (fPages && fSwipeOnePage) {
				var page = Math[(force>0)?"floor":"ceil"](-(pos+((force>0)?0.5:-0.5))/sizePage);
				var nextPos = -page*sizePage;
				if ((0>=nextPos) && (nextPos>=minP)) {
					transitionTo(nextPos, 250);
					return;
				}	
			}
			var curP = denormalizeP(pos);
			transitionTo(normalizeP(curP+force*5), 250);
		},
		end: function() {
			endTransition();
		},
	}
	
	function finalPos() {
		var pos = getLotPos();
		var finalP;
		var page;

		if (pos > 0) finalP=0;
		else if (pos < minP) finalP = minP;	
		else if (fPages) {
			page = Math.round(-pos/sizePage);
			finalP = -page*sizePage;
		} else finalP = pos;
		
		return {finalP: finalP, curP: pos, page: page};
	}

	function checkFinal() {
		var p = finalPos();
		if (p.finalP == p.curP) {
			if (detachTouchHandler() && control.end) control.end(p.page);
			return true;
		}
		return false;
	}
	
	function endTransition() {
		if (checkFinal()) return;
		var p = finalPos();
		transitionTo(p.finalP, 250); // ?? param
	}

	function transitionEndHandler(ev) {
		noTransition();
		if (checkFinal()) return;
		endTransition();
	}

	function noTransition(fComplete) {
		if (transitionToValue == null) return;
		div.unbind(transitionEndEventNames, transitionEndHandler);
		setLotPos(getLotPos()); // stop transition, no complete
		div.css({transitionProperty: "none"});
		if (fComplete && (transitionToValue != null)) setLotPos(transitionToValue);
		transitionToValue = null;
	}
	
	var transitionToValue;
	function transitionTo(p, duration) {
		noTransition();
		transitionToValue = p;
		if (getLotPos() == p) {
			transitionEndHandler();
			return;
		}
		div.bind(transitionEndEventNames, transitionEndHandler);
		div.css({transition: lot+" "+duration+"ms ease-out 0s"});
		setLotPos(p);
	}
	
/*	my.resize = function(_pageSize) {
		pageSize = _pageSize;
		calcSizes();
		if (transitionToValue == null) {
			var p = finalPos();
			if (ownControl && touchH && touchH.touching()) 
				setLotPos(normalizeP(denormalizeP(p.curP)));
			else transitionTo(p.finalP, 250); // ?? param
		}
	}
*/	
	// pages: (trans, numPage, pageSize), (trans, div, pageSize), (trans)->checkPosition
	// no pages: (trans, div), (trans, div1, div2), (trans, pos0, pos1), (trans)->checkPosition
	my.scrollToVisible = function(trans, arg0, arg1) {
		var p0,p1;
		if (fPages) sizePage = arg1;
		calcSizes();
		if (fPages) {
			if (arg0 != null) {
				if (typeof arg0 == "number") { // numPage
					p0 = arg0*sizePage;
				} else { // child Div
					p0 = arg0.position()[lot];
					p0 = (p0%sizePage)*sizePage;
				}
				p1 = p0+sizePage;
			}
		} else {
			if (arg0 != null) {
				if (typeof arg0 == "number") {
					p0 = arg0;
					p1 = arg1;
				} else {
					p0 = arg0.position()[lot];
					p1 = ((arg1 != null) ? arg1.position()[lot] : p0)+arg0['o'+WoH]();
				}
			}
		}
		if (p0 != null) {
			var pos = -getLotPos();
			if (p0<pos) pos = p0;
			else if (p1>pos+sizeCont) {
				pos = p1-sizeCont;
				if (fPages) pos += sizePage%sizeCont
			} else pos = null;
			if (pos != null) { 
				if (trans) transitionTo(-pos, 250);
				else setLotPos(-pos);
				return;
			}
		} 
		if (transitionToValue == null) {
			var p = finalPos();
			if (ownControl && touchH && touchH.touching()) 
				setLotPos(normalizeP(denormalizeP(p.curP)));
			else if (trans) transitionTo(p.finalP, 250); 
				 else setLotPos(p.finalP); 
		}
	}
	
	my.stop = function() {
		noTransition();
		detachTouchHandler();
	}
	
	my.complete = function(fInmediate) {
		if (fInmediate) {
			noTransition(true);
			var p = finalPos();
			setLotPos(p.finalP);
		}
		detachTouchHandler();
	}
	
	return my;
}

// pageToPage: mueve de una página a otra con touch, mediante transition css
//             puede finalizar en la página de destino o de origen
//     touch1 pude ser null 
//     div1: página actual visible
//     div2: página destino
//     control : {
//        end(fEnd): fin de touch o transición css, 
//                   fEnd: boolean, true si acaba en div2, false si acaba en div1
//     }  
//     params : {
// 		  dir : 'x' o 'y'
//        start1, end1, start2: 
//            start1, end1: movimiento de page1
//            start2: incio de page2, end2 dependera de fOverPage
//            en unidades de size (normalmente 0,1 o -1), (la posición final se multiplicara por size)
//        fOverPage: boolean, page2 no se mueve, esta debajo
//        size: size de page1
//        cancel2ToStart: boolean, si hay touch en touch2 se cancela y vuelve a page1, sino a page2

window.pageToPage = function(div1, touch1, div2, touch2, control, _params) {
	var my = {};

	if (control == null) control = {};
	var params = $.extend({}, _params);

	var oldControlTouch1;
	var oldControlTouch2;
	var ownControl = false;
	var lastT;
	var lot	= (params.dir == 'x')?'left':'top';
	var minP, maxP, sizeCont;
	var difDivs;
	
	function calcSizes() {
		minP = Math.round(params.start1*params.size);
		maxP = Math.round(params.end1*params.size);
		if (maxP<minP) {
			var temp = minP;
			minP = maxP;
			maxP = temp;
		}	
		difDivs = Math.round(params.start2*params.size)-Math.round(params.start1*params.size); 
	}
	
	function getLotPos(div) {
		return div.position()[lot];
	}
	
	function setLotPos(div, p) {
		div.css(lot, Math.round(p)+"px");
	}
	
	my.start = function(difT, force) {
		oldControlTouch1 = (touch1) ? touch1.setControl(controlT1) : null;
		oldControlTouch2 = (touch2) ? touch2.setControl(controlT2) : null;
		ownControl = true;
		div1.css({zIndex: 2});
		div2.css({zIndex: 1});
		if (params.start1 == null) params.start1 = getLotPos(div1)/params.size;
		if (params.start2 == null) params.start2 = getLotPos(div2)/params.size;
		calcSizes();
		setLotPos(div1, Math.round(params.start1*params.size));
		setLotPos(div2, Math.round(params.start2*params.size));

		var curT = (touch1) ? touch1.getCurPoint() : {x:0, y:0};
		lastT = $.extend({}, curT);
		if (difT != null) {
			lastT[params.dir]-=difT;
			controlT1.move(params.dir, difT, curT);
		}	
		if (force != null) {
			controlT1.swipe(params.dir, force);
		}
	}
	
	function detachTouchHandler() {
		if (oldControlTouch1 != null) {
			touch1.setControl(oldControlTouch1);
			oldControlTouch1 = null;
		} 
		if (oldControlTouch2 != null) {
			touch2.setControl(oldControlTouch2);
			oldControlTouch2 = null;
		} 
		var ret = ownControl;
		ownControl = false;
		return ret;
	}
	
	function normalizeP(dp) {
		if (dp<minP) return minP;
		if (dp>maxP) return maxP;
		return dp;
	}
	
	function denormalizeP(p) {
		if (p<minP) return minP;
		if (p>maxP) return maxP;
		return p;
	}

	var controlT1 = {
		start: function(target, curT) {
			if (getDOMParents(target, div1) == null) {
				controlT2.start(target, curT);
				return;
			}
			noTransition();
			lastT = curT;
		},
		move: function(_dir, difT, curT) {
			if (params.dir != _dir) return;
			var curP = denormalizeP(getLotPos(div1));
			curP += (curT[params.dir]-lastT[params.dir]);
			lastT = curT;
			curP = normalizeP(curP);
			setLotPos(div1, curP);
			if (!params.fOverPage) setLotPos(div2, curP+difDivs);
		},
		swipe: function(_dir, force) {
			if (params.dir != _dir) return;
			transitionTo((force > 0) ? maxP : minP, 250);
		},
		end: function() {
			endTransition();
		},
	}
	
	var controlT2 = {
		start: function(target, curT) {
			noTransition();
			var finalP = params[(params.cancel2ToStart) ? "start1" : "end1"]*params.size;
			detachTouchHandler();
			setLotPos(div1, finalP);
			if (!params.fOverPage) setLotPos(div2, finalP+difDivs);
			control.end(!params.cancel2ToStart);
		}
	}
	
	function finalPos() {
		var pos = getLotPos(div1);

		var finalP = (pos < (minP+maxP)/2) ? minP : maxP;
		
		return {finalP: finalP, curP: pos, fEnd:(pos == params.end1*params.size)};
	}

	function checkFinal() {
		var p = finalPos();
		if (p.finalP == p.curP) {
			if (detachTouchHandler() && control.end) control.end(p.fEnd);
			return true;
		}
		return false;
	}
	
	function endTransition() {
		if (checkFinal()) return;
		var p = finalPos();
		transitionTo(p.finalP, 250); // ?? param
	}

	function transitionEndHandler(ev) {
		noTransition();
		if (checkFinal()) return;
		endTransition();
	}

	function noTransition(fComplete) {
		div1.unbind(transitionEndEventNames, transitionEndHandler);
		var transCss = {transitionProperty: "none"};
		var p = getLotPos(div1);
		setLotPos(div1, p); // stop transition, no complete
		div1.css(transCss);
		if (!params.fOverPage) {
			setLotPos(div2, p+difDivs);
			div2.css(transCss);
		}
		if (fComplete && (transitionToValue != null)) {
			setLotPos(div1, transitionToValue);
			if (!params.fOverPage) setLotPos(div2, transitionToValue+difDivs);
		}
		transitionToValue = null;
	}
	
	var transitionToValue;
	function transitionTo(p, duration) {
		transitionToValue = p;
		if (getLotPos(div1) == p) {
			transitionEndHandler();
			return;
		}
		div1.bind(transitionEndEventNames, transitionEndHandler);
		var transCss = {transition: lot+" "+duration+"ms ease-out 0s"}; 
		div1.css(transCss);
		setLotPos(div1, p);
		if (!params.fOverPage) {
			div2.css(transCss);
			setLotPos(div2, p+difDivs);
		}
	}
	
	my.resize = function() {
		calcSizes();
		if (transitionToValue == null) {
			var p = finalPos();
			if (ownControl && touch1 && touch1.touching()) {
				var curP = normalizeP(denormalizeP(p.curP));
				setLotPos(div1, curP);
				if (!params.fOverPage) setLotPos(div2, curP+difDivs);
			} else transitionTo(p.finalP, 250); // ?? param
		}
		if (transitionToValue == null) {
			var p = finalPos();
			transitionTo(p.finalP, 250); // ?? param
		}
	}
	
	my.stop = function() {
		noTransition();
		detachTouchHandler();
	}
	
	my.complete = function(fInmediate) {
		if (fInmediate) {
			noTransition(true);
			var p = finalPos();
			setLotPos(p.finalP);
		}
		detachTouchHandler();
	}
	
	return my;
}

});