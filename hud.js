const HUD = {
    suns: 150,
    score: 0,
    selectedPlant: null,
    selectedCost: 0,
    isShovelActive: false,

    init() {
        this.updateSunDisplay();
        this.updateScoreDisplay();
        this.setupFullscreen();
        this.setupRestart();
        this.setupStartButton();
        this.setupShovel();
    },

    updateSuns(amount) {
        this.suns += amount;
        this.updateSunDisplay();
    },

    resetSuns() {
        this.suns = 150;
        this.updateSunDisplay();
    },

    updateSunDisplay() {
        document.getElementById('sun-count').innerText = this.suns;
    },

    addScore(points) {
        this.score += points;
        this.updateScoreDisplay();
    },

    resetScore() {
        this.score = 0;
        this.updateScoreDisplay();
    },

    updateScoreDisplay() {
        document.getElementById('score-count').innerText = this.score;
    },

    updateWaveDisplay(wave) {
        document.getElementById('wave-count').innerText = wave;
    },

    setSelectedPlant(plantName, cost) {
        this.isShovelActive = false;
        document.getElementById('shovel-btn').classList.remove('selected');
        this.selectedPlant = plantName;
        this.selectedCost = cost;
    },

    clearSelection() {
        this.selectedPlant = null;
        this.selectedCost = 0;
        this.isShovelActive = false;
        document.querySelectorAll('.seed-card, .shovel-card').forEach(c => c.classList.remove('selected'));
    },

    setupShovel() {
        const shovelBtn = document.getElementById('shovel-btn');
        shovelBtn.addEventListener('click', () => {
            document.querySelectorAll('.seed-card').forEach(c => c.classList.remove('selected'));
            this.selectedPlant = null;
            this.selectedCost = 0;
            this.isShovelActive = !this.isShovelActive;

            if (this.isShovelActive) {
                shovelBtn.classList.add('selected');
            } else {
                shovelBtn.classList.remove('selected');
            }
        });
    },

    setupFullscreen() {
        const btn = document.getElementById('fullscreen-btn');
        const container = document.getElementById('game-container');

        btn.addEventListener('click', () => {
            if (!document.fullscreenElement) {
                container.requestFullscreen().catch(err => {
                    alert(`Erro ao tentar modo tela cheia: ${err.message}`);
                });
            } else {
                document.exitFullscreen();
            }
        });
    },

    setupRestart() {
        const btn = document.getElementById('restart-btn');
        btn.addEventListener('click', () => {
            Game.restart();
        });
    },

    setupStartButton() {
        const startBtn = document.getElementById('start-game-btn');
        const startMenu = document.getElementById('start-menu');

        startBtn.addEventListener('click', () => {
            SoundManager.playBGM();
            startMenu.style.display = 'none';
            Game.start();
        });
    }
};

HUD.init();