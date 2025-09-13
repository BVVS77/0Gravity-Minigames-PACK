-- Funkcja uruchamiająca minigierkę szybkiego pisania
TypingGame = function()
    SetNuiFocus(true, true) -- fokus na myszkę i klawiaturę
    SendNUIMessage({ action = "startTyping" })

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

-- Testowa komenda: /typing
RegisterCommand("typing", function()
    local success = TypingGame()

    if success then
        ESX.ShowNotification("✅ Wpisałeś poprawnie!")
    else
        ESX.ShowNotification("❌ Porażka!")
    end
end, false)

exports("TypingGame", TypingGame)
