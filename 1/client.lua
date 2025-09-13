-- Funkcja uruchamiająca minigierkę
ReactionGame = function()
    SetNuiFocus(true, false) -- focus tylko na myszkę/klawiaturę w grze, bez blokady kursora
    SendNUIMessage({ action = "startReaction" })

    local success = nil

    -- callback z NUI -> zwraca wynik gry
    RegisterNUICallback("gameResult", function(result, cb)
        success = result
        SetNuiFocus(false, false)
        cb("ok")
    end)

    -- czekamy aż gracz skończy grę
    while success == nil do
        Citizen.Wait(0)
    end

    return success
end

-- Testowa komenda (wpisz /reaction w grze)
RegisterCommand("reaction", function()
    local success = ReactionGame()

    if success then
        ESX.ShowNotification("✅ Reakcja udana!")
    else
        ESX.ShowNotification("❌ Porażka!")
    end
end, false)

-- Export żeby można było używać w innych skryptach
exports("ReactionGame", ReactionGame)
