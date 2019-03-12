﻿Namespace hostGTpv

    Public Class H_ConceptosEntrega
        Private Shared jsConceptosEntrega As New jsObject() From {{"O", New jsArray()}, {"A", New jsArray()}}
        'Public Shared Version As Double = 1

        Public Shared Sub actualize(ByVal _conceptosEntrega As Dictionary(Of String, String()))
            jsConceptosEntrega.Clear()
            For Each kv In _conceptosEntrega
                jsConceptosEntrega(kv.Key) = kv.Value.Clone()
            Next
            actualizeSat(actualizeSatType.All)
        End Sub

        Private Shared sats As New Dictionary(Of ISat, IObj)

        Private Shared Function getComHandler(ByVal obj As IObj) As delCallbackHS
            Return Sub(ret As Object, params As Object)
                       Dim data As CObjData = obj.data
                       If data.callbackCreateAct IsNot Nothing Then
                           Dim f = data.callbackCreateAct
                           data.callbackCreateAct = Nothing
                           f()
                       End If
                   End Sub
        End Function

        Private Class CObjData
            Public act_All As Boolean
            Public callbackCreateAct As action '??11
            Public comHandler As delCallbackHS
        End Class
        Public Shared Sub createSat(ByVal sat As ISat, ByVal callback As action)
            Dim obj = sat.createObj("ConceptosEntrega", createObjSat, AddressOf createObjHost, Nothing, AddressOf availableCommHandler)
            sats(sat) = obj
            obj.data = New CObjData()
            Dim data As CObjData = obj.data
            data.act_All = True
            data.comHandler = getComHandler(obj)
            data.callbackCreateAct = callback

        End Sub

        Public Shared Sub destroySat(ByVal sat As ISat)
            If sats.ContainsKey(sat) Then
                Dim obj = sats(sat)
                obj.data = Nothing
                sats.Remove(sat)
            End If
        End Sub

        Private Shared Sub availableCommHandler(ByVal objSat As IObj)
            Dim objSat_Data As CObjData = objSat.data
            If objSat_Data.act_All Then
                objSat.call("actualize", New jsArray() From {jsConceptosEntrega}, objSat_Data.comHandler)
                objSat_Data.act_All = False
            End If
        End Sub

        Private Enum actualizeSatType
            All
        End Enum
        Private Shared Sub actualizeSat(ByVal type As actualizeSatType, Optional ByVal noActObj As IObj = Nothing)
            For Each kv As KeyValuePair(Of ISat, IObj) In sats
                Dim obj = kv.Value
                If noActObj Is obj Then Continue For
                Dim obj_Data As CObjData = obj.data
                If type = actualizeSatType.All Then obj_Data.act_All = True
                obj.readyComm()
            Next
        End Sub

        Private Shared Function createObjHost(ByVal obj As IObj) As Dictionary(Of String, [Delegate])
            Return New Dictionary(Of String, [Delegate])
        End Function
        Private Shared createObjSat As New jsFunction("function(host) { return createConceptosEntrega(host); }")

    End Class

End Namespace