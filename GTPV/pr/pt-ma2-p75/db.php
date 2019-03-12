<?php

$ConnDB = FALSE;

function openDB() { 
	global $ConnDB;
	$Dsn = "Driver={SQL Server};Server=localhost,1433;Database=G_Gtpv;";
	$ConnDB = odbc_connect($Dsn, "G_Gtpv", "G_Gtpv7643");
	if ($ConnDB === FALSE) enviarError("401# open DB"); 
}

function closeDB() {
	global $ConnDB;
	if ($ConnDB != FALSE) odbc_close($ConnDB);	
}

function db_get_result($sql, $i) {
	$val = odbc_result($sql, $i);
	if ($val === NULL) return NULL;
	switch (odbc_field_type($sql, $i)) {
		case 'float':
		case 'real':
			$val = (string)(float)$val;
			break;	
	}
	return $val;
}

?>
