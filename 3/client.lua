StopBarGame = function(settings)
    SetNuiFocus(true, true)
    SendNUIMessage({ action = "startStopBar", settings = settings or {} })

    local result = nil

    RegisterNUICallback("gameResult", function(data, cb)
        result = data
        SetNuiFocus(false, false)
        cb("ok")
    end)

    while result == nil do
        Citizen.Wait(0)
    end

    -- wynik to tabela: { success = true/false, score = liczba }
    return result
end

-- Testowa komenda: /stopbar
RegisterCommand("stopbar", function()
    local result = StopBarGame({ difficulty = "medium" })

    if result.success then
        ESX.ShowNotification("✅ Udało się! Wynik: " .. result.score)
    else
        ESX.ShowNotification("❌ Porażka! Wynik: " .. result.score)
    end
end, false)

exports("StopBarGame", StopBarGame)
