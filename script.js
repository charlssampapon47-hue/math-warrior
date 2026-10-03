const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const equationEl = document.getElementById('equation');
const answersEl = document.getElementById('answers');
const battleLogEl = document.getElementById('battleLog');
const scoreLabel = document.getElementById('scoreLabel');
const playerHpEl = document.getElementById('playerHp');
const playerHpFill = document.getElementById('playerHpFill');
const enemyHpEl = document.getElementById('enemyHp');
const enemyHpFill = document.getElementById('enemyHpFill');
const enemyNameEl = document.getElementById('enemyName');
const enemyLevelEl = document.getElementById('enemyLevel');
const playerLevelEl = document.getElementById('playerLevel');

const MAX_PLAYER_HP = 100;
const ENEMY_TYPES = ['Goblin', 'Wraith', 'Skeleton', 'Dragonling', 'Shadow Mage', 'Titan'];

let gameActive = false;
let playerHealth = MAX_PLAYER_HP;
let enemyHealth = 30;
let playerLevel = 1;
let score = 0;
let currentQuestion = null;
let enemiesDefeated = 0;

function setBattleLog(message) {
  battleLogEl.textContent = message;
}

function updateHud() {
  playerHpEl.textContent = Math.max(0, playerHealth);
  enemyHpEl.textContent = Math.max(0, enemyHealth);
  playerHpFill.style.width = `${(playerHealth / MAX_PLAYER_HP) * 100}%`;
  enemyHpFill.style.width = `${(enemyHealth / getEnemyMaxHp()) * 100}%`;
  scoreLabel.textContent = `Score: ${score}`;
  playerLevelEl.textContent = `Lv. ${playerLevel}`;
}

function getEnemyMaxHp() {
  return 25 + (playerLevel - 1) * 12;
}

function createEnemy() {
  const enemyIndex = Math.min(ENEMY_TYPES.length - 1, Math.floor(Math.random() * ENEMY_TYPES.length));
  const enemyName = ENEMY_TYPES[enemyIndex];
  const enemyLevel = Math.max(1, playerLevel);
  enemyNameEl.textContent = enemyName;
  enemyLevelEl.textContent = `Lv. ${enemyLevel}`;
  enemyHealth = getEnemyMaxHp();
  updateHud();
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateQuestion() {
  const operations = ['+', '-', '*'];
  const operation = operations[getRandomInt(0, operations.length - 1)];
  let a;
  let b;
  let answer;

  if (operation === '+') {
    a = getRandomInt(3 + playerLevel, 14 + playerLevel * 2);
    b = getRandomInt(2 + playerLevel, 12 + playerLevel * 2);
    answer = a + b;
  } else if (operation === '-') {
    a = getRandomInt(8 + playerLevel * 2, 30 + playerLevel * 3);
    b = getRandomInt(2 + playerLevel, a - 1);
    answer = a - b;
  } else {
    a = getRandomInt(2, 9 + playerLevel);
    b = getRandomInt(2, 8 + playerLevel);
    answer = a * b;
  }

  const wrongAnswers = new Set([answer]);

  while (wrongAnswers.size < 4) {
    let offset = getRandomInt(-8, 8);
    const candidate = answer + offset;
    if (candidate !== answer && candidate > 0) {
      wrongAnswers.add(candidate);
    }
  }

  const choices = Array.from(wrongAnswers);
  const correctIndex = getRandomInt(0, choices.length - 1);
  const correctChoice = choices[correctIndex];
  choices[correctIndex] = answer;

  const ordered = [answer, ...choices.filter((value) => value !== answer)];
  const shuffled = ordered
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);

  currentQuestion = {
    expression: `${a} ${operation} ${b}`,
    answer,
    choices: shuffled,
  };

  equationEl.textContent = currentQuestion.expression;
  answersEl.innerHTML = '';

  currentQuestion.choices.forEach((choice) => {
    const button = document.createElement('button');
    button.textContent = choice;
    button.className = 'answer-btn';
    button.addEventListener('click', () => handleAnswer(choice));
    answersEl.appendChild(button);
  });
}

function handleAnswer(value) {
  if (!gameActive || !currentQuestion) return;

  const allButtons = [...answersEl.querySelectorAll('button')];
  allButtons.forEach((button) => {
    button.disabled = true;
  });

  if (value === currentQuestion.answer) {
    const damage = Math.max(8, 10 + playerLevel * 2);
    enemyHealth -= damage;
    score += 10 + playerLevel * 2;
    setBattleLog(`Correct! You strike for ${damage} damage.`);

    if (enemyHealth <= 0) {
      enemiesDefeated += 1;
      playerLevel += 1;
      score += 25;
      setBattleLog(`Victory! ${ENEMY_TYPES[Math.floor(Math.random() * ENEMY_TYPES.length)]} falls. Level up.`);
      gameActive = false;
      setTimeout(() => {
        createEnemy();
        generateQuestion();
        gameActive = true;
      }, 1200);
      updateHud();
      return;
    }
  } else {
    const damage = Math.max(5, 6 + playerLevel);
    playerHealth -= damage;
    score = Math.max(0, score - 5);
    setBattleLog(`Wrong answer! The enemy hits for ${damage} damage.`);

    if (playerHealth <= 0) {
      setBattleLog('The warrior falls. Press restart to try again.');
      gameActive = false;
      startBtn.textContent = 'Battle Again';
      startBtn.classList.remove('hidden');
      restartBtn.classList.remove('hidden');
      updateHud();
      return;
    }
  }

  updateHud();

  setTimeout(() => {
    generateQuestion();
    if (gameActive) {
      setBattleLog('A new challenge appears.');
    }
  }, 900);
}

function resetGame() {
  playerHealth = MAX_PLAYER_HP;
  playerLevel = 1;
  score = 0;
  enemiesDefeated = 0;
  gameActive = true;
  startBtn.classList.add('hidden');
  restartBtn.classList.add('hidden');
  setBattleLog('The arena trembles. Ready your mind and sword.');
  createEnemy();
  generateQuestion();
  updateHud();
}

startBtn.addEventListener('click', () => {
  resetGame();
});

restartBtn.addEventListener('click', () => {
  resetGame();
});

updateHud();
createEnemy();
generateQuestion();
startBtn.classList.remove('hidden');
restartBtn.classList.add('hidden');
