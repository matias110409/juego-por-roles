// Clases del juego
class Sword {
  constructor(name, multiplier) {
      this.name = name;
      this.multiplier = multiplier;
  }
}
let selectedClass = '';

function selectClass(playerClass) {
    selectedClass = playerClass;
    document.querySelectorAll('#classButtons button').forEach(button => {
        button.classList.remove('selected');
    });
    document.querySelector(`button[onclick="selectClass('${playerClass}')"]`).classList.add('selected');
}



class Shield {
  constructor(name, blockChance, hp) {
      this.name = name;
      this.blockChance = blockChance;
      this.hp = hp;
  }

  takeDamage(damage) {
      this.hp -= damage;
      if (this.hp <= 0) {
          this.hp = 0;
          return true; // El escudo se rompe
      }
      return false; // El escudo aún tiene vida
  }

  repair() {
      this.hp = shields[this.name.toLowerCase()].hp;
  }
}

class Monster {
  constructor(name, hp, attack, avatar) {
      this.name = name;
      this.hp = hp;
      this.attack = attack;
      this.avatar = avatar;
  }
}

class Player {
  constructor(name, playerClass) {
      this.name = name;
      this.hp = 50;
      this.sword = swords.madera;
      this.shield = new Shield("Madera", 0.1, 10);
      this.playerClass = playerClass;
      this.skillUses = 3;
      this.skillActive = false;
      this.damageReductionActive = false; // Nueva propiedad para Guerrero
  }

  attack() {
      const baseDamage = Math.floor(Math.random() * 6) + 1;
      const damageMultiplier = this.skillActive && this.playerClass === "Guerrero" ? 2 : 1;
      return Math.floor(baseDamage * this.sword.multiplier * damageMultiplier);
  }
  block() {
    return this.shield && Math.random() < this.shield.blockChance;
  }
  

  takeShieldDamage(damage) {
    const shieldBreakSound = document.getElementById("shieldBreakSound");
    if (this.shield && this.shield.takeDamage(damage)) {
        shieldBreakSound.play();
        document.getElementById("message").innerText += `\n¡Tu escudo se ha roto!`;
        document.getElementById("blockButton").disabled = true;
    }
    updatePlayerStats();
  }
  

  recoverHealth(amount) {
      this.hp = Math.min(this.hp + amount, 50); // Recuperar vida del jugador
  }

  useSkill() {
      if (this.skillUses > 0) {
          switch (this.playerClass) {
              case "Guerrero":
                  this.skillActive = true;
                  this.damageReductionActive = true; // Activar la reducción de daño
                  document.getElementById("message").innerText += `\n¡Habilidad de Guerrero activada! Daño aumentado por 2 y reducción de daño recibida en un 50% en esta ronda.`;
                  break;
              case "Mago":
                  this.recoverHealth(15);
                  this.shield.blockChance += 0.05; // Incrementar la probabilidad de bloqueo
                  document.getElementById("message").innerText += `\n¡Habilidad de Mago activada! Recuperas 15 puntos de vida y tu probabilidad de bloqueo aumenta un 5%.`;
                  updateStats(); // Asegurar que la vida se actualice inmediatamente
                  break;
              case "Explorador":
                  this.shield.repair();
                  if (Math.random() < 0.5) {
                      this.upgradeSword();
                      document.getElementById("message").innerText += `\n¡Habilidad de Explorador activada! Escudo reparado completamente y tu espada ha sido mejorada.`;
                  } else {
                      document.getElementById("message").innerText += `\n¡Habilidad de Explorador activada! Escudo reparado completamente.`;
                  }
                  document.getElementById("blockButton").disabled = false; // Reactivar el botón de bloquear
                  break;
          }
          this.skillUses--;
          updatePlayerStats(); // Actualizar las estadísticas del jugador
      } else {
          document.getElementById("message").innerText += `\nNo te quedan habilidades para usar.`;
      }
  }

  upgradeSword() {
      const swordKeys = Object.keys(swords);
      const currentSwordIndex = swordKeys.indexOf(this.sword.name.toLowerCase());
      if (currentSwordIndex < swordKeys.length - 1) {
          this.sword = swords[swordKeys[currentSwordIndex + 1]];
      }
  }
}

// Asegúrate de desactivar las propiedades de la habilidad del Guerrero después de la ronda.
function endTurn() {
  if (player.playerClass === "Guerrero" && player.damageReductionActive) {
      player.damageReductionActive = false; // Desactivar la reducción de daño después de la ronda
  }
  if (player.playerClass === "Guerrero" && player.skillActive) {
      player.skillActive = false; // Desactivar el aumento de daño después de la ronda
  }
}



// Variables globales
const swords = {
  madera: new Sword("Madera", 1),
  hierro: new Sword("Hierro", 1.5),
  oro: new Sword("Oro", 2),
  diamante: new Sword("Diamante", 3),
  obsidiana: new Sword("Obsidiana", 4),
};

const shields = {
  madera: new Shield("Madera", 0.1, 10),
  hierro: new Shield("Hierro", 0.15, 15),
  oro: new Shield("Oro", 0.2, 20),
  diamante: new Shield("Diamante", 0.25, 25),
  obsidiana: new Shield("Obsidiana", 0.3, 30),
};

let player, monster, monstersDefeated = 0, currentWeaponDrop;

function startGame() {
  const playerName = document.getElementById("playerNameInput").value.trim();
  if (!playerName) {
      alert("Por favor, ingresa tu nombre.");
      return;
  }
  if (!selectedClass) {
      alert("Por favor, elige tu clase.");
      return;
  }

  player = new Player(playerName, selectedClass);
  monster = generateMonster(monstersDefeated);

  document.getElementById("playerName").innerText = player.name;
  document.getElementById("playerClass").innerText = selectedClass;
  updateEquipment();
  updateStats();
  updatePlayerStats();

  document.getElementById("start-screen").classList.add("hidden");
  document.getElementById("game-screen").classList.remove("hidden");
}


function generateMonster(index) {
  const isBoss = index === 9;
  const name = isBoss ? "Jefe Final" : `Monstruo ${index + 1}`;
  const hp = isBoss ? 100 : 20 + index * 5;
  const attack = isBoss ? 10 : 5 + index;
  const avatar = isBoss ? "images/boss.gif" : "images/niñaAraña.gif";

  return new Monster(name, hp, attack, avatar);
}
function playerAttack() {
  const damage = player.attack();
  monster.hp -= damage;
  let message = `${player.name} ataca al ${monster.name} con su espada de ${player.sword.name} y le hace ${damage} de daño.`;

  addAnimation(document.getElementById('playerHealthFill'), 'attack-animation');

  if (monster.hp <= 0) {
      monstersDefeated++;
      message += `\n¡Has derrotado al ${monster.name}!`;

      if (monstersDefeated === 10) {
          endGame(true);
          return;
      }

      currentWeaponDrop = {
          sword: getRandomSword(),
          shield: getRandomShield(),
      };
      message += `\nEl monstruo dejó caer una espada de ${currentWeaponDrop.sword.name} y un escudo de ${currentWeaponDrop.shield.name}.`;

      document.getElementById("attackButton").classList.add("hidden");
      document.getElementById("blockButton").classList.add("hidden");
      document.getElementById("skillButton").classList.add("hidden");
      document.getElementById("changeWeaponButton").classList.remove("hidden");
      document.getElementById("keepWeaponButton").classList.remove("hidden"); // Mostrar botón "Mantener Conjunto" al derrotar a un monstruo
  } else {
      monsterAttack(message);
  }

  updateStats(message);
}

function playerBlock() {
  const blocked = player.block();
  const blockSound = document.getElementById("blockSound");
  const shieldBreakSound = document.getElementById("shieldBreakSound");
  let message = `${player.name} intenta bloquear el ataque del ${monster.name}.`;

  if (blocked) {
      player.recoverHealth(15); // Recuperar 15 puntos de vida al bloquear exitosamente
      blockSound.play(); // Reproducir sonido de bloqueo
      message += `\n¡El escudo bloqueó completamente el ataque! Recuperas 15 puntos de vida.`;
  } else {
      const damage = Math.floor(Math.random() * monster.attack) + 1;
      player.hp -= damage;
      player.takeShieldDamage(damage); // El escudo recibe daño si no se logra bloquear
      if (player.shield && player.shield.hp === 0) shieldBreakSound.play(); // Reproducir sonido de rotura del escudo si se rompe
      player.recoverHealth(5); // Recuperar 5 puntos de vida al intentar bloquear
      message += `\nNo logró bloquear. Recibió ${damage} puntos de daño y recupera 5 puntos de vida.`;
  }

  if (player.hp <= 0) {
      endGame(false);
      return;
  }

  addAnimation(document.getElementById('playerHealthFill'), 'block-animation');
  updateStats(message);
}

function monsterAttack(baseMessage) {
  const damage = Math.floor(Math.random() * monster.attack) + 1;
  player.hp -= damage;

  const message = `${baseMessage}\nEl ${monster.name} contraataca e inflige ${damage} puntos de daño.`;

  if (player.hp <= 0) {
      endGame(false);
  }

  updateStats(message);
}

function changeWeapon() {
  player.sword = currentWeaponDrop.sword;
  player.shield = new Shield(currentWeaponDrop.shield.name, currentWeaponDrop.shield.blockChance, currentWeaponDrop.shield.hp); // Obtener un nuevo escudo con la cantidad correcta de vida
  document.getElementById("blockButton").disabled = false; // Reactivar botón de bloquear si se tiene un escudo
  prepareNextMonster(`${player.name} ahora usa la espada de ${player.sword.name} y el escudo de ${player.shield.name}.`);

  addAnimation(document.getElementById('currentWeapon'), 'weapon-change');
  addAnimation(document.getElementById('currentShield'), 'weapon-change');
  updatePlayerStats();
}

function keepWeapon() {
  prepareNextMonster(`${player.name} decide mantener su espada de ${player.sword.name} y su escudo de ${player.shield.name}.`);
}

function prepareNextMonster(message) {
  monster = generateMonster(monstersDefeated);

  document.getElementById("monsterAvatar").src = monster.avatar;

  document.getElementById("changeWeaponButton").classList.add("hidden");
  document.getElementById("keepWeaponButton").classList.add("hidden"); // Asegurarse de que el botón "Mantener Conjunto" esté oculto
  document.getElementById("attackButton").classList.remove("hidden");
  document.getElementById("blockButton").classList.remove("hidden");
  document.getElementById("skillButton").classList.remove("hidden"); // Mostrar botón de habilidad cuando se luche contra el monstruo

  if (player.playerClass === "Guerrero") {
      player.skillActive = false; // Desactivar habilidad de Guerrero al pasar al siguiente monstruo
  }

  updateEquipment();
  updateStats(message);
}

function updateEquipment() {
  document.getElementById("currentWeapon").innerText = player.sword.name;
  document.getElementById("currentShield").innerText = player.shield ? player.shield.name : "Sin Escudo";
}

function updateStats(message = "") {
  const playerHealthPercent = Math.max((player.hp / 50) * 100, 0);
  const monsterHealthPercent = Math.max((monster.hp / 100) * 100, 0);
  document.getElementById("playerHealthFill").style.width = `${playerHealthPercent}%`;
  document.getElementById("monsterHealthFill").style.width = `${monsterHealthPercent}%`;

  document.getElementById("message").innerText = message;
}

function updatePlayerStats() {
  document.getElementById("playerSword").innerText = player.sword.name;
  document.getElementById("playerSwordDamage").innerText = player.sword.multiplier;
  document.getElementById("playerShield").innerText = player.shield ? player.shield.name : "Sin Escudo";
  document.getElementById("playerShieldHp").innerText = player.shield ? player.shield.hp : "N/A";
  document.getElementById("playerShieldBlock").innerText = player.shield ? (player.shield.blockChance * 100) + '%' : "N/A";
  document.getElementById("skillUses").innerText = player.skillUses;
}

function endGame(victory) {
  document.getElementById("game-screen").classList.add("hidden");
  document.getElementById("end-screen").classList.remove("hidden");

  document.getElementById("endMessage").innerText = victory
      ? `¡Felicidades ${player.name}! Has derrotado al jefe final.`
      : `¡${player.name} ha sido derrotado! Intenta de nuevo.`;

  document.getElementById("restartButton").classList.remove("hidden");
}

function restartGame() {
  monstersDefeated = 0;
  player.shield = new Shield("Madera", 0.1, 10); // Reiniciar el escudo del jugador a su valor inicial
  document.getElementById("blockButton").disabled = false; // Reactivar el botón de bloqueo
  player.skillUses = 3; // Restablecer usos de habilidades
  player.skillActive = false; // Desactivar habilidad activa

  // Cambiar el avatar del enemigo al monstruo común
  document.getElementById("monsterAvatar").src = "images/niñaAraña.gif"; // Asegúrate de que la ruta de la imagen sea correcta

  document.getElementById("end-screen").classList.add("hidden");
  document.getElementById("start-screen").classList.remove("hidden");
  updatePlayerStats(); // Actualizar las estadísticas del jugador para reflejar el nuevo escudo y habilidades
}

function getRandomSword() {
  const keys = Object.keys(swords);
  return swords[keys[Math.floor(Math.random() * keys.length)]];
}

function getRandomShield() {
  const keys = Object.keys(shields);
  return shields[keys[Math.floor(Math.random() * keys.length)]];
}

// Funciones de animación
function addAnimation(element, animationClass) {
  element.classList.add(animationClass);
  setTimeout(() => {
    element.classList.remove(animationClass);
  }, 500);
}

function useSkill() {
  if (player) {
      player.useSkill();
  }
}



















  
  



