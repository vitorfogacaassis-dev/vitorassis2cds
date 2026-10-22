const SoundManager = {
    bgm: null,
    isMuted: false,

    init() {
        this.bgm = new Audio('plants.mp3');
        this.bgm.loop = true;
        this.bgm.volume = 0.3;
    },

    playBGM() {
        if (this.bgm && this.bgm.paused) {
            this.bgm.play().catch(() => {});
        }
    },

    stopBGM() {
        if (this.bgm) {
            this.bgm.pause();
            this.bgm.currentTime = 0;
        }
    },

    play(soundName) {
        if (this.isMuted) return;

        let soundFile = '';
        if (soundName === 'plant') soundFile = 'plant.mp3';
        if (soundName === 'shoot') soundFile = 'shoot.mp3';
        if (soundName === 'sun') soundFile = 'sun.mp3';

        if (soundFile) {
            const audio = new Audio(soundFile);
            audio.volume = 0.6;
            audio.play().catch(() => {});
        }
    }
};

SoundManager.init();