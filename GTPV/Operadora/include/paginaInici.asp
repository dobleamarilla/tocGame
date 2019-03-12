<%

' --- PAGINAS DE INICIO -----------------------------------------------------------------------------------------------------------------

function paginas ( byval n )
	select case n
		case 2:
			paginas = "Resultats"
		case 4:
			paginas = "Gesti�"
		case 5:
			paginas = "Gesti�|Comandes|Factures|Resultats|TPV|CRM|APPCC"
		case 9, 99:
			paginas = "Gesti�|Comandes|Factures|Resultats|TPV|CRM|APPCC|�tils"
		case else:
			paginas = "Gesti�|Comandes|TPV|CRM|APPCC"
	end select
end function

function paginasV ( byval n )
	select case n
		case 2:
			paginasV = "/resultados/"
		case 4:
			paginasV = "/gestion/"
		case 5:
			paginasV = "/gestion/|/comandes/|/facturas/|/resultados/|/hw/|/crm/|/appcc/"
		case 9, 99:
			paginasV = "/gestion/|/comandes/|/facturas/|/resultados/|/hw/|/crm/|/appcc/|/utils/"
		case else:
			paginasV = "/gestion/|/comandes/|/hw/|/crm/|/appcc/"
	end select
end function

%>