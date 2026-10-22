const Game = {
    gridRows: 5,
    gridCols: 8,
    board: [],
    zombies: [],
    bullets: [],
    wave: 1,
    zombiesSpawnedInWave: 0,
    zombiesPerWave: 5,
    spawnerInterval: null,
    loopInterval: null,
    sunInterval: null,
    skySunInterval: null,

    init() {
        this.createGrid();
        this.setupPlantSelector();
    },

    start() {
        this.startWave();
        this.startSunGenerator();
        this.startSkySunSpawner();
        this.startGameLoop();
    },

    restart() {
        clearInterval(this.spawnerInterval);
        clearInterval(this.loopInterval);
        clearInterval(this.sunInterval);
        clearInterval(this.skySunInterval);

        document.querySelectorAll('.zombie, .bullet, .sun-drop').forEach(el => el.remove());
        this.zombies = [];
        this.bullets = [];
        this.wave = 1;
        this.zombiesSpawnedInWave = 0;
        this.zombiesPerWave = 5;

        HUD.resetSuns();
        HUD.resetScore();
        HUD.clearSelection();
        HUD.updateWaveDisplay(this.wave);

        this.createGrid();
        this.start();
    },

    createGrid() {
        const gridElement = document.getElementById('lawn-grid');
        gridElement.innerHTML = '';

        for (let r = 0; r < this.gridRows; r++) {
            this.board[r] = [];
            for (let c = 0; c < this.gridCols; c++) {
                this.board[r][c] = { plant: null };

                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.classList.add((r + c) % 2 === 0 ? 'type-a' : 'type-b');
                cell.dataset.row = r;
                cell.dataset.col = c;

                cell.addEventListener('click', () => this.handleCellClick(r, c, cell));
                gridElement.appendChild(cell);
            }
        }
    },

    setupPlantSelector() {
        const cards = document.querySelectorAll('.seed-card');
        cards.forEach(card => {
            card.addEventListener('click', () => {
                cards.forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');

                const plantName = card.dataset.plant;
                const cost = parseInt(card.dataset.cost);
                HUD.setSelectedPlant(plantName, cost);
                SoundManager.play('plant');
            });
        });
    },

    handleCellClick(r, c, cellElement) {
        if (HUD.isShovelActive) {
            if (this.board[r][c].plant !== null) {
                this.board[r][c].plant = null;
                cellElement.innerHTML = '';
                SoundManager.play('plant');
            }
            HUD.clearSelection();
            return;
        }

        if (!HUD.selectedPlant) return;

        if (HUD.suns < HUD.selectedCost) {
            alert('Sóis insuficientes!');
            return;
        }

        if (this.board[r][c].plant !== null) {
            return;
        }

        HUD.updateSuns(-HUD.selectedCost);
        this.board[r][c].plant = {
            type: HUD.selectedPlant,
            health: HUD.selectedPlant === 'wallnut' ? 300 : 100
        };
if (HUD.selectedPlant === 'peashooter') {
    cellElement.innerHTML = '<img src="pea.png" class="plant-img" alt="Peashooter">';
} else if (HUD.selectedPlant === 'sunflower') {
    cellElement.innerHTML = '<img src="sunflower.png" class="plant-img" alt="Sunflower">';
} else if (HUD.selectedPlant === 'snowpea') {
    cellElement.innerHTML = '<img src="snowpea.png" class="plant-img" alt="Snow Pea">';
} else if (HUD.selectedPlant === 'repeater') {
    cellElement.innerHTML = '<img src="repeater.png" class="plant-img" alt="Repeater">';
} else if (HUD.selectedPlant === 'wallnut') {
    cellElement.innerHTML = '<img src="wallnut.png" class="plant-img" alt="Wall-nut">';
} else if (HUD.selectedPlant === 'cherrybomb') {
    cellElement.innerHTML = '<img src="cherrybomb.png" class="plant-img" alt="Cherry Bomb">';
    setTimeout(() => this.explodeCherry(r, c, cellElement), 1000);
}

        SoundManager.play('plant');
        HUD.clearSelection();
    },

    explodeCherry(r, c, cellElement) {
        cellElement.innerText = '💥';
        SoundManager.play('shoot');

        for (let z = this.zombies.length - 1; z >= 0; z--) {
            const zombie = this.zombies[z];
            if (Math.abs(zombie.row - r) <= 1 && zombie.xPos > 50 && zombie.xPos < 900) {
                zombie.element.remove();
                this.zombies.splice(z, 1);
                HUD.addScore(10);
            }
        }

        setTimeout(() => {
            this.board[r][c].plant = null;
            cellElement.innerHTML = '';
        }, 500);
    },

    startSunGenerator() {
        this.sunInterval = setInterval(() => {
            for (let r = 0; r < this.gridRows; r++) {
                for (let c = 0; c < this.gridCols; c++) {
                    if (this.board[r][c].plant && this.board[r][c].plant.type === 'sunflower') {
                        this.spawnSunItem(120 + c * 100, 120 + r * 95);
                    }
                }
            }
        }, 8000);
    },

    startSkySunSpawner() {
        this.skySunInterval = setInterval(() => {
            const randomX = 150 + Math.random() * 700;
            const randomY = 150 + Math.random() * 350;
            this.spawnSunItem(randomX, randomY);
        }, 10000);
    },

    spawnSunItem(x, y) {
        const container = document.getElementById('game-container');
        const sun = document.createElement('div');
        sun.classList.add('sun-drop');
        sun.innerText = '☀️';
        sun.style.left = `${x}px`;
        sun.style.top = `${y}px`;

        sun.addEventListener('click', () => {
            HUD.updateSuns(25);
            SoundManager.play('sun');
            sun.remove();
        });

        container.appendChild(sun);

        setTimeout(() => {
            if (sun.parentNode) sun.remove();
        }, 8000);
    },

    startWave() {
        HUD.updateWaveDisplay(this.wave);
        this.zombiesSpawnedInWave = 0;
        
        const spawnSpeed = Math.max(1500, 5000 - (this.wave * 400));

        clearInterval(this.spawnerInterval);
        this.spawnerInterval = setInterval(() => {
            if (this.zombiesSpawnedInWave < this.zombiesPerWave) {
                this.spawnZombie();
                this.zombiesSpawnedInWave++;
            } else {
                clearInterval(this.spawnerInterval);
            }
        }, spawnSpeed);
    },

    spawnZombie() {
        const randomRow = Math.floor(Math.random() * this.gridRows);
        const container = document.getElementById('game-container');

        const zombieElement = document.createElement('div');
        zombieElement.classList.add('zombie');
        zombieElement.innerText = '🧟';
        zombieElement.style.position = 'absolute';
        zombieElement.style.fontSize = '38px';
        zombieElement.style.left = '900px';
        zombieElement.style.top = `${100 + randomRow * 95}px`;

        container.appendChild(zombieElement);

        this.zombies.push({
            row: randomRow,
            xPos: 900,
            health: 40 + (this.wave * 10),
            speed: 4 + Math.min(this.wave, 8),
            element: zombieElement
        });
    },

    checkNextWave() {
        if (this.zombiesSpawnedInWave >= this.zombiesPerWave && this.zombies.length === 0) {
            this.wave++;
            this.zombiesPerWave += 3;
            HUD.updateSuns(50);
            this.startWave();
        }
    },

    startGameLoop() {
        this.loopInterval = setInterval(() => {
            for (let r = 0; r < this.gridRows; r++) {
                for (let c = 0; c < this.gridCols; c++) {
                    const plant = this.board[r][c].plant;
                    if (plant && (plant.type === 'peashooter' || plant.type === 'snowpea' || plant.type === 'repeater')) {
                        const hasZombieInRow = this.zombies.some(z => z.row === r && z.xPos > (c * 100));
                        if (hasZombieInRow) {
                            this.shootBullet(r, c, plant.type);
                        }
                    }
                }
            }

            this.moveZombies();
            this.moveBullets();
            this.checkCollisions();
            this.checkNextWave();
        }, 300);
    },

    shootBullet(row, col, type) {
        const container = document.getElementById('game-container');
        const bulletElement = document.createElement('div');
        bulletElement.classList.add('bullet');
        bulletElement.innerText = type === 'snowpea' ? '🥶' : (type === 'repeater' ? '🔴' : '🟢');
        bulletElement.style.position = 'absolute';
        bulletElement.style.fontSize = '18px';
        bulletElement.style.left = `${120 + col * 100}px`;
        bulletElement.style.top = `${115 + row * 95}px`;

        container.appendChild(bulletElement);

        this.bullets.push({
            row: row,
            xPos: 120 + col * 100,
            type: type,
            element: bulletElement
        });

        SoundManager.play('shoot');
    },

    moveZombies() {
        this.zombies.forEach(zombie => {
            zombie.xPos -= zombie.speed;
            zombie.element.style.left = `${zombie.xPos}px`;

            if (zombie.xPos < 50) {
                alert(`Os Zumbis comeram os seus cérebros! Você sobreviveu até a Onda ${this.wave}.`);
                this.restart();
            }
        });
    },

    moveBullets() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.xPos += 22;
            bullet.element.style.left = `${bullet.xPos}px`;

            if (bullet.xPos > 940) {
                bullet.element.remove();
                this.bullets.splice(i, 1);
            }
        }
    },

    checkCollisions() {
        for (let b = this.bullets.length - 1; b >= 0; b--) {
            const bullet = this.bullets[b];

            for (let z = this.zombies.length - 1; z >= 0; z--) {
                const zombie = this.zombies[z];

                if (bullet.row === zombie.row && Math.abs(bullet.xPos - zombie.xPos) < 25) {
                    const damage = bullet.type === 'repeater' ? 40 : 25;
                    zombie.health -= damage;

                    if (bullet.type === 'snowpea') {
                        zombie.speed = Math.max(2, zombie.speed - 2);
                    }

                    bullet.element.remove();
                    this.bullets.splice(b, 1);

                    if (zombie.health <= 0) {
                        zombie.element.remove();
                        this.zombies.splice(z, 1);
                        HUD.addScore(5);
                    }
                    break;
                }
            }
        }
    }
};

window.onload = () => {
    Game.init();
};

