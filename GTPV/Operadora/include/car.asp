<%

function getCarValue ( byval cad, byval buscar, byval separador )

	dim pos
	dim longitut
	dim valor

	pos      = 0
	longitut = 0

	if isnull ( separador ) then separador = "]"

	pos = instr ( cad, buscar )

	if pos = 0 then exit function

	pos         = pos + len ( buscar ) + 1
	longitut    = instr ( pos, cad, separador ) - pos
	valor       = mid ( cad, pos, longitut )
	getCarValue = valor

end function

function car ( byref C )

	dim i
	dim level

	i     = 0
	level = 0

	do
		i = i + 1
		if mid ( C, i, 1 ) = "]" then level = level - 1
		if mid ( C, i, 1 ) = "[" then level = level + 1
	loop while level <> 0 and i < len ( C )

	car = left ( C, i )
	if car <> "" then
		car = mid  ( car, 2, len ( car ) - 2 )
		C   = mid  ( C, i + 1 )
	end if

end function

function SolsAscii(St)
	
	st = join ( split ( st, "'" ), " " )
	st = join ( split ( st, "�" ), "o" )
	st = join ( split ( st, "�" ), "a" )

	st = join ( split ( st, "�" ), "a" )
	st = join ( split ( st, "�" ), "a" )
	st = join ( split ( st, "�" ), "a" )
	st = join ( split ( st, "�" ), "a" )

	st = join ( split ( st, "�" ), "e" )
	st = join ( split ( st, "�" ), "e" )
	st = join ( split ( st, "�" ), "e" )
	st = join ( split ( st, "�" ), "e" )

	st = join ( split ( st, "�" ), "i" )
	st = join ( split ( st, "�" ), "i" )
	st = join ( split ( st, "�" ), "i" )
	st = join ( split ( st, "�" ), "i" )

	st = join ( split ( st, "�" ), "o" )
	st = join ( split ( st, "�" ), "o" )
	st = join ( split ( st, "�" ), "o" )
	st = join ( split ( st, "�" ), "o" )

	st = join ( split ( st, "�" ), "u" )
	st = join ( split ( st, "�" ), "u" )
	st = join ( split ( st, "�" ), "u" )
	st = join ( split ( st, "�" ), "u" )
	
	st = join ( split ( st, "�" ), "a" )
	st = join ( split ( st, "�" ), "a" )
	st = join ( split ( st, "�" ), "a" )
	st = join ( split ( st, "�" ), "a" )

	st = join ( split ( st, "�" ), "e" )
	st = join ( split ( st, "�" ), "e" )
	st = join ( split ( st, "�" ), "e" )
	st = join ( split ( st, "�" ), "e" )

	st = join ( split ( st, "�" ), "i" )
	st = join ( split ( st, "�" ), "i" )
	st = join ( split ( st, "�" ), "i" )
	st = join ( split ( st, "�" ), "i" )

	st = join ( split ( st, "�" ), "o" )
	st = join ( split ( st, "�" ), "o" )
	st = join ( split ( st, "�" ), "o" )
	st = join ( split ( st, "�" ), "o" )

	st = join ( split ( st, "�" ), "u" )
	st = join ( split ( st, "�" ), "u" )
	st = join ( split ( st, "�" ), "u" )
	st = join ( split ( st, "�" ), "u" )

	SolsAscii = st
end function


%>