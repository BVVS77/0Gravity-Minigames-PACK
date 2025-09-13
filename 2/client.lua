-- Funkcja uruchamiająca Memory Code
MemoryGame = function(difficulty)
    -- domyślnie medium
    difficulty = difficulty or "medium"

    SetNuiFocus(true, false)
    SendNUIMessage({
        action = "startMemoryGame",
        difficulty = difficulty
    })

    local success = nil

    -- Odbieramy wynik z NUI
    RegisterNUICallback("gameResult", function(result, cb)
        success = result
        SetNuiFocus(false, false)
        cb("ok")
    end)

    -- Czekamy na zakończenie gry
    while success == nil do
        Citizen.Wait(0)
    end

    return success
end

-- Komenda testowa
-- użycie: /memory easy | /memory medium | /memory hard
RegisterCommand("memory", function(source, args)
    local diff = args[1] or "medium"
    local result = MemoryGame(diff)

    if result then
        ESX.ShowNotification("✅ Sekwencja poprawna!")
    else
        ESX.ShowNotification("❌ Błędna sekwencja!")
    end
end, false)

-- Export do użycia w innych skryptach
exports("MemoryGame", MemoryGame)
