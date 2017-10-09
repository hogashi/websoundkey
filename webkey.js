// webkey.js

const text = t => {
  document.body.insertAdjacentHTML('afterbegin', `<pre>${t}</pre>`)
};

class SoundKey {
  constructor() {
    // create web audio api context
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    this.state = {
      octave: 4,
      frequencyMap: {},
    };
  }

  addFrequencyMap({keys = [], octave = 4, head = 0}) {
    keys.forEach((key, i) => {
      this.state.frequencyMap[key] = {
        freq      : 0,
        oscillator: null,
        isReady   : true,
      };
      this.state.frequencyMap[key].freq = 440 * Math.pow(2, (i + head + 12 * (octave - 4)) / 12);
    });
  }

  // getter
  freq(key) {
    if (!key || !this.state.frequencyMap[key]) {
      return 0;
    }
    return this.state.frequencyMap[key].freq * Math.pow(2, this.state.octave - 4);
  }

  _createOscillator(key = 'a', type = 'square') {
    // create Oscillator node
    this.state.frequencyMap[key].oscillator = this.audioCtx.createOscillator();
    // debugger;
    this.state.frequencyMap[key].oscillator.type = type;
    this.state.frequencyMap[key].oscillator.frequency.value = this.freq(key); // value in hertz
    this.state.frequencyMap[key].oscillator.connect(this.audioCtx.destination);
  }

  startSound(key) {
    if (key && !!this.state.frequencyMap[key] && this.state.frequencyMap[key].isReady) {
      // debugger;
      this.state.frequencyMap[key].isReady = false;
      this._createOscillator(key, 'sine');
      this.state.frequencyMap[key].oscillator.start();
      // text(`start:${this.state.frequencyMap[key].freq}`);
    }
  }

  stopSound(key) {
    if (key && !!this.state.frequencyMap[key]) {
      // debugger;
      this.state.frequencyMap[key].isReady = true;
      this.state.frequencyMap[key].oscillator.stop();
      // text(`stop: ${this.state.frequencyMap[key].freq}`);
    }
  }

  upOctave() {
    this.state.octave += 1;
    if (this.state.octave > 8) {
      this.state.octave = 8;
    }
  }

  downOctave() {
    this.state.octave -= 1;
    if (this.state.octave < 1) {
      this.state.octave = 1;
    }
  }
}

class Webkey {
  constructor() {
    this.keyCor = [
      {
        keys  : 'azsxcfvgbnjmk,l./:\\]'.split(''),
        octave: 4,
        head  : -1  // 'a' is code B#(A-)
      },
      {
        keys  : 'q2w3er5t6y7ui9o0p@^['.split(''),
        octave: 5,
        head  : 3  // 'q' is code C
      },
    ];
    this.soundKey = new SoundKey();
    this.keyCor.forEach(kc => {
      this.soundKey.addFrequencyMap(kc);
    });

    document.addEventListener('keydown', this._startSound.bind(this));
    document.addEventListener('keyup',   this._stopSound.bind(this));
  }

  _startSound(e) {
    console.log('down: ' + e.key);
    switch (e.key) {
      case 'ArrowUp':
      case 'ArrowRight':
        this.soundKey.upOctave();
        break;
      case 'ArrowDown':
      case 'ArrowLeft':
        this.soundKey.downOctave();
        break;
      default:
        this.soundKey.startSound(e.key);
        break;
    }
  }

  _stopSound(e) {
    console.log('up: ' + e.key);
    this.soundKey.stopSound(e.key);
  }
}

const webkey = new Webkey();
