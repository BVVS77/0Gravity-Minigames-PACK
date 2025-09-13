-- Funkcja uruchamiająca Dodging Objects
-- params = {
--   gameTime = czas gry w sekundach,
--   baseSpeed = prędkość początkowa przeszkód,
--   baseSpawnRate = spawn co ile ms,
--   playerSpeed = prędkość gracza,
--   difficulty = "easy" | "medium" | "hard"
-- }
DodgingGame = function(params)
    params = params or {}

    -- domyślne wartości
    local cfg = {
        gameTime = params.gameTime or 10,
        baseSpeed = params.baseSpeed or 4,
        baseSpawnRate = params.baseSpawnRate or 800,
        playerSpeed = params.playerSpeed or 20,
        difficulty = params.difficulty or "medium"
    }

    SetNuiFocus(true, false)
    SendNUIMessage({
        action = "startDodgingGame",
        config = cfg
    })

    local result = nil

    -- Odbieramy wynik z NUI
    RegisterNUICallback("gameResult", function(data, cb)
        result = data -- { success = bool, score = number }
        SetNuiFocus(false, false)
        cb("ok")
    end)

    -- Czekamy na zakończenie gry
    while result == nil do
        Citizen.Wait(0)
    end

    return result.success, result.score
end

-- Komenda testowa
-- użycie: /dodging easy | /dodging medium | /dodging hard
RegisterCommand("dodging", function(source, args)
    local diff = args[1] or "medium"

    local settings = {
        difficulty = diff
    }

    if diff == "easy" then
        settings.gameTime = 8
        settings.baseSpeed = 3
        settings.baseSpawnRate = 1000
    elseif diff == "hard" then
        settings.gameTime = 12
        settings.baseSpeed = 6
        settings.baseSpawnRate = 600
    else
        -- medium
        settings.gameTime = 10
        settings.baseSpeed = 4
        settings.baseSpawnRate = 800
    end

    local success, score = DodgingGame(settings)

    if success then
        ESX.ShowNotification(("✅ Przetrwałeś! Wynik: %s"):format(score))
    else
        ESX.ShowNotification(("❌ Porażka! Wynik: %s"):format(score))
    end
end, false)

-- Export do użycia w innych skryptach
exports("DodgingGame", DodgingGame)
