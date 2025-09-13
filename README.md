````markdown
# 0G_MINIGAMEs 🎮

A pack of **6 interactive minigames** built for **FiveM / ZerOGravity**.  
Each game includes its own LUA script and HTML/JS/CSS interface, designed to be lightweight, responsive, and easy to integrate into any FiveM server.  

---

## ✨ Included Minigames

### 🎮 1. Quick Reaction  
- **Description**: A simple reflex game – you must click quickly.  
- **Usage**:  
  ```lua
  local success = exports["your_resource"]:ReactionGame()

  if success then
      ESX.ShowNotification("✅ Success!")
  else
      ESX.ShowNotification("❌ Failed!")
  end
````

---

### 🎮 2. Memory Code PRO

* **Description**: Remember and type the sequence.
* **Difficulties**: `"easy"`, `"medium"`, `"hard"`.
* **Usage**:

  ```lua
  local success = exports["your_resource"]:MemoryGame("medium")

  if success then
      ESX.ShowNotification("✅ Correct sequence!")
  else
      ESX.ShowNotification("❌ Wrong sequence!")
  end
  ```

---

### 🎮 3. Typing Test

* **Description**: Type the displayed text quickly and correctly.
* **Usage**:

  ```lua
  local success = exports["your_resource"]:TypingGame()

  if success then
      ESX.ShowNotification("✅ Typed correctly!")
  else
      ESX.ShowNotification("❌ Failed!")
  end
  ```

---

### 🎮 4. Memory Clicker (Simon Says)

* **Description**: Classic “Simon Says” – click the memorized sequence.
* **Difficulties**: `"easy"`, `"medium"`, `"hard"`.
* **Usage**:

  ```lua
  local success = exports["your_resource"]:SimonGame("medium")

  if success then
      ESX.ShowNotification("✅ Correct sequence!")
  else
      ESX.ShowNotification("❌ Wrong sequence!")
  end
  ```

---

### 🎮 5. Stop The Bar PRO

* **Description**: Stop the moving bar at the right moment.
* **Presets**:

  * `"easy"` → 2 rounds, slower bar, wider zone
  * `"medium"` → 3 rounds, medium speed
  * `"hard"` → 4 rounds, fast bar, narrow zone
* **Usage**:

  ```lua
  local result = exports["your_resource"]:StopBarGame({ difficulty = "hard" })

  if result.success then
      ESX.ShowNotification("✅ Success! Score: " .. result.score)
  else
      ESX.ShowNotification("❌ Failed! Score: " .. result.score)
  end
  ```
* **Custom Settings** (full configuration available):

  ```lua
  local result = exports["your_resource"]:StopBarGame({
      rounds = 5,
      triesPerRound = 2,
      roundTimeMs = 6000,
      baseSpeed = 1.2,
      zoneMin = 0.16,
      zoneMax = 0.28,
      jitter = 0.05,
      scoreWin = 100,
      scorePerfectBonus = 50,
      perfectThreshold = 0.1
  })
  ```

---

### 🎮 6. Dodging Objects PRO

* **Description**: Survive by dodging falling objects.
* **Presets**:

  * `"easy"` → 8 seconds, slow obstacles, rare spawn
  * `"medium"` → 10 seconds, medium speed and spawn
  * `"hard"` → 12 seconds, fast obstacles, frequent spawn
* **Usage**:

  ```lua
  local result = exports["your_resource"]:DodgingGame({ difficulty = "hard" })

  if result.success then
      ESX.ShowNotification("✅ Survived! Score: " .. result.score)
  else
      ESX.ShowNotification("❌ Failed! Score: " .. result.score)
  end
  ```
* **Custom Settings**:

  ```lua
  local result = exports["your_resource"]:DodgingGame({
      gameTime = 15,
      baseSpeed = 5,
      baseSpawnRate = 700,
      playerSpeed = 25,
      difficulty = "custom",
      difficultyScale = 1.07
  })
  ```

---

## 🛠️ Installation

1. Clone the repository or download it to your server:

   ```bash
   git clone https://github.com/your-nickname/0G_MINIGAMEs.git
   ```
2. Copy the `0G_MINIGAMEs` folder into your `resources/` directory.
3. Add this line to your `server.cfg`:

   ```
   ensure 0G_MINIGAMEs
   ```
4. Restart your server – minigames are ready! 🚀

---

## 📂 Project Structure

```
0G_MINIGAMEs/
│── howuse.md
│── 1/ (Quick Reaction)
│── 2/ (Memory Code PRO)
│── 3/ (Typing Test)
│── 4/ (Memory Clicker)
│── 5/ (Stop The Bar PRO)
│── 6/ (Dodging Objects PRO)
```

---

## 📜 License

Released under the **MIT License** – feel free to use, modify, and share, just keep attribution.

---

## 👤 Author

Created by **ZerOGravity**.

```
