<?php

/*set_error_handler(errorHandler, E_RECOVERABLE_ERROR);

function errorHandler ( $errno , $errstr , $errfile , $errline , $errcontext ) {
	echo $errno."\n".$errstr."\n".$errfile."\n".$errline."\n";
	print_r($errcontext);
	die();	
}
*/

include("db.php");
include("escapeXMLCC.php");
include("respuesta.php");
include("debug.php");
include("peticion.php");
include("sincronizar.php");


function enviarError($str) {
	throw new Exception($str);
}

$docIn = NULL;
$docElIn = NULL;
$cliente = NULL;
$Sesion = NULL;


try {
	createResp();

	$docIn = new DOMDocument();
	$docIn->load('php://input');
	if ($docIn === FALSE) enviarError(1);
	$docElIn = $docIn->documentElement;

	openDB();
	if (!processNodeInit()) {
		// error Password

	} else {
		$estado = processNodeSesion();
		switch ($estado) {
			case 'fechas sincro' :
				sincronizarTablas();
				break;
			case 'sincronizar' :
				appendDocOut(createNodeSesion("fin"));
				break;
			case NULL :
			default:	
				obtenerFechaSincroCliente();	
		}
	}
} catch (Exception $e) {
	appendDocOut(createElementOut("error", $e->getMessage()));
}
appendDocOut(createNodeComunicacion(60));
closeDB();
sendResp();
//echo("fin");
?>
