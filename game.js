const players = [];
let currentPlayer = 0;
let gameState = {
  territories: {},
  bank: {},
  deployed: {},
  preDeployment: {}, // Added to store pre-deployment state
  phase: 'deployment',
  cards: [],
  continentClaims: { Africa: 0, Asia: 0, Australia: 0, Europe: 0, NorthAmerica: 0, SouthAmerica: 0 },
  deck: [],
  wildcardsPlayed: 0,
  round: 1
};
let selectedTerritory = null;
let selectedCard = null;
let inputBuffer = '';
const territories = [
  'alaska', 'northwest_territory', 'greenland', 'alberta', 'ontario', 'quebec',
  'western_united_states', 'eastern_united_states', 'central_america', 'venezuela',
  'peru', 'brazil', 'argentina', 'iceland', 'scandinavia', 'ukraine', 'great_britain',
  'northern_europe', 'western_europe', 'southern_europe', 'north_africa', 'egypt',
  'east_africa', 'congo', 'south_africa', 'madagascar', 'ural', 'siberia', 'yakutsk',
  'kamchatka', 'irkutsk', 'afghanistan', 'china', 'mongolia', 'japan', 'middle_east',
  'india', 'siam', 'indonesia', 'new_guinea', 'western_australia', 'eastern_australia'
];
const cardDeck = [
  { name: 'afghanistan', type: 'infantry' },
  { name: 'alaska', type: 'artillery' },
  { name: 'alberta', type: 'artillery' },
  { name: 'argentina', type: 'infantry' },
  { name: 'brazil', type: 'infantry' },
  { name: 'central_america', type: 'infantry' },
  { name: 'china', type: 'artillery' },
  { name: 'congo', type: 'artillery' },
  { name: 'east_africa', type: 'infantry' },
  { name: 'eastern_australia', type: 'cavalry' },
  { name: 'eastern_united_states', type: 'artillery' },
  { name: 'egypt', type: 'cavalry' },
  { name: 'great_britain', type: 'infantry' },
  { name: 'greenland', type: 'cavalry' },
  { name: 'iceland', type: 'cavalry' },
  { name: 'india', type: 'cavalry' },
  { name: 'indonesia', type: 'infantry' },
  { name: 'irkutsk', type: 'artillery' },
  { name: 'japan', type: 'cavalry' },
  { name: 'kamchatka', type: 'artillery' },
  { name: 'madagascar', type: 'cavalry' },
  { name: 'middle_east', type: 'artillery' },
  { name: 'mongolia', type: 'cavalry' },
  { name: 'new_guinea', type: 'cavalry' },
  { name: 'northwest_territory', type: 'cavalry' },
  { name: 'north_africa', type: 'infantry' },
  { name: 'northern_europe', type: 'cavalry' },
  { name: 'ontario', type: 'artillery' },
  { name: 'peru', type: 'cavalry' },
  { name: 'quebec', type: 'artillery' },
  { name: 'scandinavia', type: 'infantry' },
  { name: 'siam', type: 'cavalry' },
  { name: 'siberia', type: 'infantry' },
  { name: 'south_africa', type: 'artillery' },
  { name: 'southern_europe', type: 'infantry' },
  { name: 'ukraine', type: 'infantry' },
  { name: 'ural', type: 'infantry' },
  { name: 'venezuela', type: 'cavalry' },
  { name: 'western_australia', type: 'artillery' },
  { name: 'western_europe', type: 'infantry' },
  { name: 'western_united_states', type: 'artillery' },
  { name: 'yakutsk', type: 'artillery' },
  { name: 'wildcard', type: 'null' },
  { name: 'wildcard', type: 'null' }
];
const continents = {
  NorthAmerica: ['alaska', 'northwest_territory', 'greenland', 'alberta', 'ontario', 'quebec', 'western_united_states', 'eastern_united_states', 'central_america'],
  SouthAmerica: ['venezuela', 'peru', 'brazil', 'argentina'],
  Europe: ['iceland', 'scandinavia', 'ukraine', 'great_britain', 'northern_europe', 'western_europe', 'southern_europe'],
  Africa: ['north_africa', 'egypt', 'east_africa', 'congo', 'south_africa', 'madagascar'],
  Asia: ['ural', 'siberia', 'yakutsk', 'kamchatka', 'irkutsk', 'afghanistan', 'china', 'mongolia', 'japan', 'middle_east', 'india', 'siam'],
  Australia: ['indonesia', 'new_guinea', 'western_australia', 'eastern_australia']
};
const continentBaseBonuses = {
  NorthAmerica: 5,
  Europe: 5,
  Asia: 7,
  Africa: 3,
  SouthAmerica: 2,
  Australia: 2
};

function showLogin() {
  console.log('showLogin called');
  document.getElementById('welcome').style.display = 'none';
  document.getElementById('login').style.display = 'flex';
  updatePlayerInputs();
}

function loadGame() {
  document.getElementById('error').textContent = 'Load Game not implemented yet';
}

document.getElementById('numPlayers').addEventListener('change', updatePlayerInputs);

function updatePlayerInputs() {
  const num = parseInt(document.getElementById('numPlayers').value) || 2;
  const playerInputs = document.getElementById('playerInputs');
  const allColors = ['red', 'blue', 'pink', 'yellow', 'green', 'black'];
  
  const currentInputs = [];
  for (let i = 1; i <= 6; i++) {
    const nameInput = document.getElementById(`player${i}-name`);
    const colorSelect = document.getElementById(`player${i}-color`);
    if (nameInput && colorSelect) {
      currentInputs[i - 1] = {
        name: nameInput.value,
        color: colorSelect.value
      };
    }
  }

  playerInputs.innerHTML = '';
  for (let i = 1; i <= num; i++) {
    const usedColors = new Set(currentInputs.slice(0, i - 1).map(input => input?.color).filter(Boolean));
    const availableColors = allColors.filter(color => !usedColors.has(color));
    const nameValue = currentInputs[i - 1]?.name || '';
    const colorValue = currentInputs[i - 1]?.color || availableColors[0] || allColors[i - 1] || 'red';
    
    playerInputs.innerHTML += `
      <div style="margin-bottom: 10px;">
        <label style="color: black; margin-right: 5px;">Player ${i} name:</label>
        <input type="text" id="player${i}-name" value="${nameValue}" style="color: black; width: 150px;" oninput="enableColorSelect(${i})">
        <label style="color: black; margin-left: 10px; margin-right: 5px;">Color:</label>
        <select id="player${i}-color" style="color: black;" onchange="updatePlayerInputs()" ${!nameValue ? 'disabled' : ''}>
          ${availableColors.map(color => `<option value="${color}" ${color === colorValue ? 'selected' : ''}>${color.charAt(0).toUpperCase() + color.slice(1)}</option>`).join('')}
        </select>
      </div>
    `;
  }
}

function enableColorSelect(playerIndex) {
  const nameInput = document.getElementById(`player${playerIndex}-name`);
  const colorSelect = document.getElementById(`player${playerIndex}-color`);
  if (nameInput.value.trim()) {
    colorSelect.disabled = false;
  } else {
    colorSelect.disabled = true;
  }
}

document.getElementById('playerForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const numPlayers = parseInt(document.getElementById('numPlayers').value);
  players.length = 0;
  const usedColors = new Set();
  let error = '';
  
  for (let i = 1; i <= numPlayers; i++) {
    const name = document.getElementById(`player${i}-name`).value.trim();
    const color = document.getElementById(`player${i}-color`).value;
    if (!name) {
      error = 'All players must have a name.';
      break;
    }
    if (usedColors.has(color)) {
      error = 'Each player must have a unique color.';
      break;
    }
    usedColors.add(color);
    players.push({ name, color, territories: [], cards: [], armies: 0 });
  }
  
  if (error) {
    const errorDiv = document.createElement('div');
    errorDiv.style.color = 'red';
    errorDiv.textContent = error;
    document.getElementById('playerInputs').appendChild(errorDiv);
    return;
  }
  
  players.sort(() => Math.random() - 0.5);
  localStorage.setItem('players', JSON.stringify(players));
  initializeGame();
});

function initializeGame() {
  gameState.deck = [...cardDeck];
  shuffle(gameState.deck);
  const shuffled = [...territories].sort(() => Math.random() - 0.5);
  const perPlayer = Math.floor(42 / players.length);
  const remainder = 42 % players.length;
  
  let territoryIndex = 0;
  players.forEach((player, i) => {
    const numTerritories = perPlayer + (i < remainder ? 1 : 0);
    player.territories = shuffled.slice(territoryIndex, territoryIndex + numTerritories);
    territoryIndex += numTerritories;
    player.armies = players.length === 2 ? 40 : players.length === 3 ? 35 : players.length === 4 ? 30 : players.length === 5 ? 25 : 20;
    gameState.bank[player.name] = player.armies - player.territories.length;
    gameState.deployed[player.name] = {};
    player.territories.forEach(t => {
      gameState.territories[t] = { owner: player.name, armies: 1 };
      const text = document.getElementById(`${t}-text`);
      const ellipse = document.getElementById(t);
      if (text && ellipse) {
        text.textContent = '001';
        text.style.fill = player.color === 'pink' ? 'black' : 'white';
        ellipse.style.fill = player.color;
        ellipse.classList.remove('unowned');
        console.log(`Initialized ${t}: owner=${player.name}, color=${player.color}, armies=1`);
      } else {
        console.error(`Failed to initialize ${t}: text=${!!text}, ellipse=${!!ellipse}`);
        if (ellipse) {
          ellipse.style.fill = 'gray';
          ellipse.classList.add('unowned');
          if (text) text.textContent = '000';
        }
      }
    });
    console.log(`Player ${player.name}: ${player.territories.length} territories, ${player.armies} armies, bank=${gameState.bank[player.name]}`);
  });
  
  const assignedTerritories = players.flatMap(p => p.territories);
  const unassigned = territories.filter(t => !assignedTerritories.includes(t));
  if (unassigned.length > 0) {
    console.error(`Unassigned territories: ${unassigned.join(', ')}`);
    unassigned.forEach(t => {
      const text = document.getElementById(`${t}-text`);
      const ellipse = document.getElementById(t);
      if (ellipse) {
        ellipse.style.fill = 'gray';
        ellipse.classList.add('unowned');
        if (text) text.textContent = '000';
      }
    });
  }
  
  console.log(`Territories initialized: ${Object.keys(gameState.territories).length}, Players: ${players.length}`);
  document.getElementById('login').style.display = 'none';
  document.getElementById('game').style.display = 'flex';
  startDeployment();
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function startDeployment() {
  const player = players[currentPlayer];
  gameState.phase = 'deployment';
  // Store pre-deployment state
  gameState.preDeployment[player.name] = {
    bank: gameState.bank[player.name],
    territories: {}
  };
  player.territories.forEach(t => {
    gameState.preDeployment[player.name].territories[t] = gameState.territories[t].armies;
  });
  document.getElementById('playerPrompt').textContent = `${player.name}, Deploy Armies`;
  document.getElementById('bank').textContent = gameState.bank[player.name];
  document.getElementById('deploymentButtons').style.display = 'flex';
  document.getElementById('cardPanel').style.display = 'none';
  updateStats();
  console.log(`Start deployment for ${player.name}: bank=${gameState.bank[player.name]}, territories=${player.territories.join(', ')}`);
}

function selectTerritory(id) {
  console.log(`selectTerritory called for ${id}`);
  const player = players[currentPlayer];
  if (gameState.phase === 'cardPlay' && selectedCard) {
    applyCardEffect(id);
    return;
  }
  if (!player.territories.includes(id)) {
    console.log(`Territory ${id} not owned by ${player.name}`);
    document.getElementById('error').textContent = `Cannot select ${id}: not owned`;
    return;
  }
  if (selectedTerritory === id) {
    deselectTerritory();
    return;
  }
  if (selectedTerritory) {
    document.getElementById(selectedTerritory).classList.remove('highlight');
  }
  selectedTerritory = id;
  document.getElementById(id).classList.add('highlight');
  document.addEventListener('wheel', handleScroll);
  document.addEventListener('keydown', handleKeydown);
  document.getElementById('error').textContent = `Selected ${id}`;
}

function handleScroll(e) {
  if (!selectedTerritory) return;
  const player = players[currentPlayer];
  let armies = parseInt(document.getElementById(`${selectedTerritory}-text`).textContent);
  const delta = e.deltaY < 0 ? 1 : -1;
  const deployed = gameState.deployed[player.name][selectedTerritory] || 0;
  const bank = gameState.bank[player.name];

  if (delta > 0 && bank <= 0) {
    document.getElementById('error').textContent = 'Bank is empty';
    return;
  }
  if (delta < 0 && armies <= 1 && deployed <= 0) {
    document.getElementById('error').textContent = 'Cannot reduce below 1 army';
    return;
  }

  armies += delta;
  gameState.bank[player.name] -= delta;
  gameState.deployed[player.name][selectedTerritory] = deployed + delta;
  document.getElementById(`${selectedTerritory}-text`).textContent = armies.toString().padStart(3, '0');
  document.getElementById('bank').textContent = gameState.bank[player.name];
  document.getElementById('error').textContent = '';
  console.log(`Scroll: ${selectedTerritory}, delta=${delta}, armies=${armies}, bank=${gameState.bank[player.name]}, deployed=${gameState.deployed[player.name][selectedTerritory]}`);
}

function handleKeydown(e) {
  if (!selectedTerritory) return;
  const player = players[currentPlayer];
  let armies = parseInt(document.getElementById(`${selectedTerritory}-text`).textContent);
  const deployed = gameState.deployed[player.name][selectedTerritory] || 0;
  const bank = gameState.bank[player.name];

  if (e.key === 'Enter') {
    if (!inputBuffer) {
      deselectTerritory();
      return;
    }
    let delta = parseInt(inputBuffer);
    if (isNaN(delta)) {
      document.getElementById('error').textContent = 'Invalid input';
      inputBuffer = '';
      deselectTerritory();
      return;
    }
    if (inputBuffer.startsWith('-')) {
      if (armies + delta < 1 || deployed + delta < 0) {
        document.getElementById('error').textContent = 'Cannot reduce below 1 army';
        inputBuffer = '';
        deselectTerritory();
        return;
      }
    } else {
      if (delta > bank) {
        document.getElementById('error').textContent = 'Not enough armies in bank';
        inputBuffer = '';
        deselectTerritory();
        return;
      }
    }
    armies += delta;
    gameState.bank[player.name] -= delta;
    gameState.deployed[player.name][selectedTerritory] = deployed + delta;
    document.getElementById(`${selectedTerritory}-text`).textContent = armies.toString().padStart(3, '0');
    document.getElementById('bank').textContent = gameState.bank[player.name];
    console.log(`Keyboard: ${selectedTerritory}, input=${inputBuffer}, delta=${delta}, armies=${armies}, bank=${gameState.bank[player.name]}, deployed=${gameState.deployed[player.name][selectedTerritory]}`);
    inputBuffer = '';
    document.getElementById('error').textContent = '';
    deselectTerritory();
  } else if (e.key === '-') {
    if (!inputBuffer) inputBuffer = '-';
  } else if (/[0-9]/.test(e.key)) {
    inputBuffer += e.key;
  } else if (e.key === 'Backspace') {
    inputBuffer = inputBuffer.slice(0, -1);
  }
}

function deselectTerritory() {
  if (selectedTerritory) {
    document.getElementById(selectedTerritory).classList.remove('highlight');
    document.removeEventListener('wheel', handleScroll);
    document.removeEventListener('keydown', handleKeydown);
    selectedTerritory = null;
    inputBuffer = '';
    document.getElementById('error').textContent = '';
  }
}

function toggleArmiesLaid() {
  console.log('toggleArmiesLaid called');
  const player = players[currentPlayer];
  const show = document.getElementById('armiesLaid').textContent === 'Show Armies';
  document.getElementById('armiesLaid').textContent = show ? 'Hide Armies' : 'Show Armies';
  player.territories.forEach(t => {
    const deployed = gameState.deployed[player.name][t] || 0;
    const el = document.getElementById(t);
    const text = document.getElementById(`${t}-text`);
    if (deployed > 0 && show && el && text) {
      el.style.fill = 'rgba(255, 255, 0, 0.3)';
      text.textContent += ` (+${deployed})`;
    } else if (el && text) {
      el.style.fill = player.color;
      text.textContent = gameState.territories[t].armies.toString().padStart(3, '0');
      text.style.fill = player.color === 'pink' ? 'black' : 'white';
    }
  });
}

function resetDeployment() {
  console.log('resetDeployment called');
  const player = players[currentPlayer];
  // Restore pre-deployment state
  gameState.bank[player.name] = gameState.preDeployment[player.name].bank;
  player.territories.forEach(t => {
    gameState.territories[t].armies = gameState.preDeployment[player.name].territories[t];
    const text = document.getElementById(`${t}-text`);
    const ellipse = document.getElementById(t);
    if (text && ellipse) {
      text.textContent = gameState.territories[t].armies.toString().padStart(3, '0');
      text.style.fill = player.color === 'pink' ? 'black' : 'white';
      ellipse.style.fill = player.color;
    }
  });
  gameState.deployed[player.name] = {};
  document.getElementById('bank').textContent = gameState.bank[player.name];
  document.getElementById('armiesLaid').textContent = 'Show Armies';
  document.getElementById('error').textContent = '';
  console.log(`Reset: ${player.name}, bank=${gameState.bank[player.name]}, territories=${player.territories.map(t => `${t}:${gameState.territories[t].armies}`).join(', ')}`);
}

function confirmDeployment() {
  console.log('confirmDeployment called');
  const player = players[currentPlayer];
  if (gameState.bank[player.name] > 0) {
    document.getElementById('error').textContent = 'Deploy all armies before confirming';
    return;
  }
  document.getElementById('error').textContent = '';
  player.territories.forEach(t => {
    gameState.territories[t].armies = parseInt(document.getElementById(`${t}-text`).textContent);
  });
  currentPlayer = (currentPlayer + 1) % players.length;
  if (currentPlayer === 0 && gameState.phase === 'deployment') {
    gameState.phase = 'game';
    currentPlayer = Math.floor(Math.random() * players.length);
    startGame();
  } else {
    startDeployment();
  }
}

function startGame() {
  const player = players[currentPlayer];
  calculateIncome();
  gameState.phase = 'cardPlay';
  document.getElementById('playerPrompt').textContent = `${player.name}, Play Cards`;
  document.getElementById('deploymentButtons').style.display = 'none';
  document.getElementById('cardPanel').style.display = 'block';
  displayCards();
}

function calculateIncome() {
  const player = players[currentPlayer];
  let territoryBonus = Math.max(3, Math.floor(player.territories.length / 3));
  let continentBonus = 0;
  for (const [continent, terrs] of Object.entries(continents)) {
    if (terrs.every(t => gameState.territories[t].owner === player.name)) {
      continentBonus += continentBaseBonuses[continent] * (gameState.continentClaims[continent] + 1);
      gameState.continentClaims[continent]++;
    }
  }
  gameState.bank[player.name] = (gameState.bank[player.name] || 0) + territoryBonus + continentBonus;
  document.getElementById('bank').textContent = gameState.bank[player.name];
  document.getElementById('error').textContent = `Income: ${territoryBonus} (territories) + ${continentBonus} (continents) = ${territoryBonus + continentBonus} armies`;
}

function displayCards() {
  const player = players[currentPlayer];
  const cardList = document.getElementById('cardList');
  cardList.innerHTML = player.cards.map((c, i) => `
    <div class="card ${selectedCard === i ? 'selected' : ''}" onclick="selectCard(${i})">
      ${c.name} (${c.type})
    </div>
  `).join('');
}

function selectCard(index) {
  const player = players[currentPlayer];
  if (selectedCard !== null) {
    document.getElementById('cardList').children[selectedCard].classList.remove('selected');
  }
  selectedCard = index;
  document.getElementById('cardList').children[index].classList.add('selected');
  const card = player.cards[index];
  document.getElementById('error').textContent = `Selected ${card.name}. Click a territory to apply, or choose Play Book/Skip.`;
}

function applyCardEffect(territoryId) {
  const player = players[currentPlayer];
  const card = player.cards[selectedCard];
  if (card.name === 'wildcard') {
    document.getElementById('error').textContent = 'Wildcard options: Aerial Attack or Territory assignment (not implemented yet)';
    return;
  }
  const target = gameState.territories[territoryId];
  if (!target) {
    document.getElementById('error').textContent = 'Invalid territory';
    return;
  }
  if (target.owner === player.name) {
    target.armies += 2;
    document.getElementById(`${territoryId}-text`).textContent = target.armies.toString().padStart(3, '0');
    document.getElementById('error').textContent = `Added 2 armies to ${territoryId}`;
  } else {
    target.armies -= 2;
    if (target.armies <= 0) {
      target.owner = player.name;
      target.armies = 1;
      player.territories.push(territoryId);
      const otherPlayer = players.find(p => p.name !== player.name && p.territories.includes(territoryId));
      if (otherPlayer) {
        otherPlayer.territories = otherPlayer.territories.filter(t => t !== territoryId);
      }
      const text = document.getElementById(`${territoryId}-text`);
      const ellipse = document.getElementById(territoryId);
      if (text && ellipse) {
        text.style.fill = player.color === 'pink' ? 'black' : 'white';
        ellipse.style.fill = player.color;
        ellipse.classList.remove('unowned');
      }
      document.getElementById('error').textContent = `Conquered ${territoryId}`;
    } else {
      document.getElementById('error').textContent = `Removed 2 armies from ${territoryId}`;
    }
    document.getElementById(`${territoryId}-text`).textContent = target.armies.toString().padStart(3, '0');
  }
  player.cards.splice(selectedCard, 1);
  selectedCard = null;
  displayCards();
  updateStats();
}

function playCard() {
  const player = players[currentPlayer];
  if (selectedCard === null) {
    document.getElementById('error').textContent = 'Select a card first';
    return;
  }
  const card = player.cards[selectedCard];
  if (card.name === 'wildcard') {
    document.getElementById('error').textContent = 'Wildcard options: Aerial Attack or Territory assignment (not implemented yet)';
    return;
  }
  document.getElementById('error').textContent = `Click a territory to apply ${card.name}`;
}

function playBook() {
  const player = players[currentPlayer];
  if (player.cards.length < 3) {
    document.getElementById('error').textContent = 'Need 3 cards to play a book';
    return;
  }
  const selectedCards = [];
  for (let i = 0; i < player.cards.length && selectedCards.length < 3; i++) {
    if (document.getElementById('cardList').children[i].classList.contains('selected')) {
      selectedCards.push(i);
    }
  }
  if (selectedCards.length !== 3) {
    document.getElementById('error').textContent = 'Select exactly 3 cards for a book';
    return;
  }
  const cards = selectedCards.map(i => player.cards[i]);
  const isValidBook = (
    cards.every(c => c.type === cards[0].type && c.type !== 'null') ||
    (new Set(cards.map(c => c.type)).size === 3 && !cards.some(c => c.type === 'null')) ||
    cards.some(c => c.type === 'null')
  );
  if (!isValidBook) {
    document.getElementById('error').textContent = 'Invalid book: Must be 3 of same type, one of each type, or include a wildcard';
    return;
  }
  gameState.bank[player.name] = (gameState.bank[player.name] || 0) + 10;
  document.getElementById('bank').textContent = gameState.bank[player.name];
  selectedCards.sort((a, b) => b - a).forEach(i => player.cards.splice(i, 1));
  selectedCard = null;
  displayCards();
  document.getElementById('error').textContent = 'Book played: +10 armies to bank';
  updateStats();
}

function skipCardPlay() {
  const player = players[currentPlayer];
  if (player.cards.length >= 5) {
    document.getElementById('error').textContent = 'Must play cards to reduce below 5';
    return;
  }
  gameState.phase = 'deployment';
  document.getElementById('playerPrompt').textContent = `${player.name}, Deploy Armies`;
  document.getElementById('deploymentButtons').style.display = 'flex';
  document.getElementById('cardPanel').style.display = 'none';
  document.getElementById('error').textContent = '';
  updateStats();
}

function updateStats() {
  const playerStatsOverlay = document.getElementById('playerStatsOverlay');
  playerStatsOverlay.innerHTML = '';
  const lineHeight = 20;
  const padding = 10;
  const statsLines = [];
  
  players.forEach(player => {
    const ownedContinents = Object.entries(continents)
      .filter(([_, terrs]) => terrs.every(t => gameState.territories[t]?.owner === player.name))
      .map(([continent]) => continent);
    player.armies = player.territories.reduce((sum, t) => sum + (gameState.territories[t]?.armies || 0), 0);
    statsLines.push(`${player.name}: ${player.cards.length} Cards, ${player.territories.length} Territories, ${player.armies} Armies, Continents – ${ownedContinents.join(', ') || 'None'}`);
  });
  statsLines.push(`${gameState.deck.length} Cards left in the Deck, ${gameState.wildcardsPlayed} Wildcards played`);
  statsLines.push(`Continents next payoff: Australia ${2 * (gameState.continentClaims.Australia + 1)}, South America ${2 * (gameState.continentClaims.SouthAmerica + 1)}, Africa ${3 * (gameState.continentClaims.Africa + 1)}, North America ${5 * (gameState.continentClaims.NorthAmerica + 1)}, Europe ${5 * (gameState.continentClaims.Europe + 1)}, Asia ${7 * (gameState.continentClaims.Asia + 1)}`);
  
  const maxWidth = 1400;
  const height = 5 * lineHeight + 2 * padding;
  
  playerStatsOverlay.innerHTML = `
    <rect x="5" y="5" width="${maxWidth}" height="${height}" fill="white" stroke="black" stroke-width="1"/>
  `;
  
  // Position players: Guido (left), Nooch (right), Karl (below Guido), Mickey (below Nooch)
  playerStatsOverlay.innerHTML += `
    <text x="${padding}" y="${padding + 21}" class="player-stats-text">${statsLines[0]}</text>
    <text x="${maxWidth / 2}" y="${padding + 21}" class="player-stats-text">${statsLines[2]}</text>
    <text x="${padding}" y="${padding + 21 + lineHeight}" class="player-stats-text">${statsLines[1]}</text>
    <text x="${maxWidth / 2}" y="${padding + 21 + lineHeight}" class="player-stats-text">${statsLines[3]}</text>
    <text x="${padding}" y="${padding + 21 + 2 * lineHeight}" class="player-stats-text">${statsLines[4]}</text>
    <text x="${padding}" y="${padding + 21 + 3 * lineHeight}" class="player-stats-text">${statsLines[5]}</text>
  `;
}