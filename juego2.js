// Clases del juego
class Sword {
  constructor(name, multiplier) {
      this.name = name;
      this.multiplier = multiplier;
  }
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

class Bracelet {
  constructor(name, effect) {
      this.name = name;
      this.effect = effect;
  }
}

class Potion {
  constructor(name, effect) {
      this.name = name;
      this.effect = effect;
  }
}

class Monster {
  constructor(name, hp, attack, avatar, ability) {
      this.name = name;
      this.hp = hp;
      this.attack = attack;
      this.avatar = avatar;
      this.ability = ability; // Nueva propiedad para habilidades especiales
  }

  useSpecialAbility(player) {
      if (this.ability) {
          this.ability(player, this);
      }
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
      this.attackMultiplier = 1; // Nuevo multiplicador de ataque
      this.bracelet = null;
      this.potions = [];
      this.dodgeChance = 0.1; // Probabilidad de esquivar inicial
  }

  attack() {
      const baseDamage = Math.floor(Math.random() * 6) + 1;
      const damageMultiplier = this.skillActive && this.playerClass === "Guerrero" ? 2 : 1;
      return Math.floor(baseDamage * this.sword.multiplier * this.attackMultiplier * damageMultiplier);
  }

  block() {
      return this.shield && Math.random() < this.shield.blockChance;
  }

  dodge() {
      return Math.random() < this.dodgeChance;
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

  usePotion(potion) {
      if (this.potions.includes(potion)) {
          potion.effect(this);
          this.potions = this.potions.filter(p => p !== potion); // Elimina la poción usada del inventario
          updatePlayerStats();
      }
  }

  equipBracelet(bracelet) {
      this.bracelet = bracelet;
      bracelet.effect(this); // Aplica el efecto del brazalete al jugador
  }
}

// Seleccionar la clase del jugador
let selectedClass = '';

function selectClass(playerClass) {
  selectedClass = playerClass;
  document.querySelectorAll('#classButtons button').forEach(button => {
      button.classList.remove('selected');
  });
  document.querySelector(`button[onclick="selectClass('${playerClass}')"]`).classList.add('selected');
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
const bracelets = {
  fuerza: new Bracelet("Fuerza", (player) => player.attackMultiplier += 0.15),
  defensa: new Bracelet("Defensa", (player) => player.shield.blockChance += 0.1),
  agilidad: new Bracelet("Agilidad", (player) => player.dodgeChance += 0.1)
};

const potions = {
  curacion: new Potion("Curación", (player) => player.recoverHealth(20)),
  fortaleza: new Potion("Fortaleza", (player) => player.attackMultiplier += 0.15),
  proteccion: new Potion("Protección", (player) => player.shield.blockChance += 0.1),
  energia: new Potion("Energía", (player) => player.skillUses = Math.min(player.skillUses + 2, 3)) // Recarga hasta 2 habilidades
};

const specialAbilities = {
  mago: (player, monster) => {
      if (Math.random() < 0.3) {
          monster.hp += 3;
          document.getElementById("message").innerText += `\n¡${monster.name} ha recuperado 3 puntos de salud!`;
      }
  },
  guerrero: (player, monster) => {
      if (Math.random() < 0.15) {
          document.getElementById("message").innerText += `\n¡${monster.name} ha bloqueado el ataque de ${player.name} e inflige daño!`;
          const damage = Math.floor(Math.random() * monster.attack) + 1;
          player.hp -= damage;
          document.getElementById("message").innerText += `\n${player.name} ha recibido ${damage} puntos de daño.`;
          return true; // Ataque del jugador bloqueado
      }
      return false;
  },
  explorador: (player, monster) => {
      if (Math.random() < 0.1) {
          player.shield.hp = 0;
          document.getElementById("message").innerText += `\n¡${monster.name} ha roto el escudo de ${player.name}!`;
          document.getElementById("blockButton").disabled = true;
      }
  }
};

// Empezar el juego
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
  if (index === 9) {
      return new Monster("Jefe Final", 100, 10, "images/boss.gif");
  }

  const monsterTypes = [
      { name: "Monstruo Común", hp: 20 + index * 5, attack: 5 + index, avatar: "images/niñaAraña.gif" },
      { name: "Monstruo Mago", hp: 20 + index * 5, attack: 5 + index, avatar: "images/niñaAraña.gif", ability: specialAbilities.mago },
      { name: "Monstruo Guerrero", hp: 20 + index * 5, attack: 5 + index, avatar: "images/niñaAraña.gif", ability: specialAbilities.guerrero },
      { name: "Monstruo Explorador", hp: 20 + index * 5, attack: 5 + index, avatar: "images/niñaAraña.gif", ability: specialAbilities.explorador },
  ];

  const randomMonster = monsterTypes[Math.floor(Math.random() * monsterTypes.length)];
  return new Monster(randomMonster.name, randomMonster.hp, randomMonster.attack, randomMonster.avatar, randomMonster.ability);
}
function playerAttack() {
  const damage = player.attack();
  let message = `${player.name} ataca al ${monster.name} con su espada de ${player.sword.name} y le hace ${damage} de daño.`;

  // Verificar si el monstruo bloquea el ataque
  if (monster.ability && monster.ability === specialAbilities.guerrero && monster.ability(player, monster)) {
      // Ataque bloqueado, no se reduce la salud del monstruo
      updateStats(message);
      return;
  }

  monster.hp -= damage;
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
          bracelet: getRandomBracelet(),
          potion: getRandomPotion(),
      };
      message += `\nEl monstruo dejó caer una espada de ${currentWeaponDrop.sword.name}, un escudo de ${currentWeaponDrop.shield.name}, un brazalete de ${currentWeaponDrop.bracelet.name} y una poción de ${currentWeaponDrop.potion.name}.`;

      document.getElementById("attackButton").classList.add("hidden");
      document.getElementById("blockButton").classList.add("hidden");
      document.getElementById("skillButton").classList.add("hidden");
      document.getElementById("changeWeaponButton").classList.remove("hidden");
      document.getElementById("keepWeaponButton").classList.remove("hidden");
      document.getElementById("usePotionButton").classList.remove("hidden");
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
  const dodged = player.dodge();
  let message = baseMessage;

  if (dodged) {
      message += `\n${player.name} esquiva el ataque del ${monster.name}.`;
  } else {
      const damage = Math.floor(Math.random() * monster.attack) + 1;
      player.hp -= damage;
      message += `\nEl ${monster.name} contraataca e inflige ${damage} puntos de daño.`;

      if (monster.ability && monster.ability !== specialAbilities.guerrero) {
          monster.ability(player, monster);
      }

      if (player.hp <= 0) {
          endGame(false);
      }
  }

  updateStats(message);
}

function changeWeapon() {
  player.sword = currentWeaponDrop.sword;
  player.shield = new Shield(currentWeaponDrop.shield.name, currentWeaponDrop.shield.blockChance, currentWeaponDrop.shield.hp); // Obtener un nuevo escudo con la cantidad correcta de vida
  player.equipBracelet(currentWeaponDrop.bracelet); // Equipar el brazalete nuevo
  player.potions.push(currentWeaponDrop.potion); // Añadir la poción al inventario
  document.getElementById("blockButton").disabled = false; // Reactivar botón de bloquear si se tiene un escudo
  prepareNextMonster(`${player.name} ahora usa la espada de ${player.sword.name}, el escudo de ${player.shield.name}, el brazalete de ${player.bracelet.name} y ha recibido una poción de ${currentWeaponDrop.potion.name}.`);

  addAnimation(document.getElementById('currentWeapon'), 'weapon-change');
  addAnimation(document.getElementById('currentShield'), 'weapon-change');
  updatePlayerStats();
}

function keepWeapon() {
  prepareNextMonster(`${player.name} decide mantener su espada de ${player.sword.name}, su escudo de ${player.shield.name}, su brazalete de ${player.bracelet.name} y sus pociones.`);
}

function prepareNextMonster(message) {
  monster = generateMonster(monstersDefeated);

  document.getElementById("monsterAvatar").src = monster.avatar;

  document.getElementById("changeWeaponButton").classList.add("hidden");
  document.getElementById("keepWeaponButton").classList.add("hidden");
  document.getElementById("attackButton").classList.remove("hidden");
  document.getElementById("blockButton").classList.remove("hidden");
  document.getElementById("skillButton").classList.remove("hidden");
  document.getElementById("usePotionButton").classList.add("hidden");

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
  document.getElementById("playerShieldBlock").innerText = player.shield ? (player.shield.blockChance * 100).toFixed(0) + '%' : "N/A";
  document.getElementById("skillUses").innerText = player.skillUses;
  document.getElementById("playerBracelet").innerText = player.bracelet ? player.bracelet.name : "Ninguno";
  document.getElementById("playerPotions").innerText = player.potions.map(p => p.name).join(", ");
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

function getRandomBracelet() {
  const keys = Object.keys(bracelets);
  return bracelets[keys[Math.floor(Math.random() * keys.length)]];
}

function getRandomPotion() {
  const keys = Object.keys(potions);
  return potions[keys[Math.floor(Math.random() * keys.length)]];
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

function usePotion() {
  if (player && player.potions.length > 0) {
      const potion = player.potions.pop(); // Usa la última poción añadida
      potion.effect(player);
      document.getElementById("message").innerText += `\nHas usado una poción de ${potion.name}.`;
      updatePlayerStats();
  } else {
      document.getElementById("message").innerText += `\nNo tienes pociones disponibles.`;
  }
}






















  
  



