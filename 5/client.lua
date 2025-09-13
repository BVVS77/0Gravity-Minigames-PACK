-- Funkcja uruchamiająca minigierkę Simon Says z poziomem trudności
SimonGame = function(difficulty)
    SetNuiFocus(true, true)
    SendNUIMessage({ action = "startSimon", difficulty = difficulty or "easy" })

    local success = nil

    RegisterNUICallback("gameResult", function(result, cb)
        success = result
        SetNuiFocus(false, false)
        cb("ok")
    end)

    while success == nil do
        Citizen.Wait(0)
    end

    return success
end

-- Testowe komendy
RegisterCommand("simon_easy", function()
    local success = SimonGame("easy")
    ESX.ShowNotification(success and "✅ Easy wygrane!" or "❌ Easy przegrane!")
end, false)

RegisterCommand("simon_medium", function()
    local success = SimonGame("medium")
    ESX.ShowNotification(success and "✅ Medium wygrane!" or "❌ Medium przegrane!")
end, false)

RegisterCommand("simon_hard", function()
    local success = SimonGame("hard")
    ESX.ShowNotification(success and "✅ Hard wygrane!" or "❌ Hard przegrane!")
end, false)

exports("SimonGame", SimonGame)
