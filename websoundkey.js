// webkey.js

// debug method
const text = t => {
  document.body.insertAdjacentHTML('afterbegin', `<pre>${t}</pre>`)
};

// sound keyboard class which has audio context
class SoundKey {
  constructor() {
    // create web audio api context
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    this.gainNode = this.audioCtx.createGain();
    this.gainNode.gain.value = 0.5;
    this.gainNode.connect(this.audioCtx.destination);
    this.state = {
      volume: 100,
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
    this.state.frequencyMap[key].oscillator.connect(this.gainNode);
  }

  startSound(key) {
    if (key && !!this.state.frequencyMap[key] && this.state.frequencyMap[key].isReady) {
      // debugger;
      this.state.frequencyMap[key].isReady = false;
      this._createOscillator(key);
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

  setOctave(octave, relative = false) {
    if (!octave) {
      return
    }
    if (relative) {
      this.state.octave += octave;
    }
    else {
      this.state.octave = octave;
    }

    if (this.state.octave < 1) {
      this.state.octave = 1;
    }
    else if (this.state.octave > 8) {
      this.state.octave = 8;
    }
  }

  setVolume(volume = 1, relative = false) {
    if (relative) {
      this.gainNode.gain.value += volume;
    }
    else {
      this.gainNode.gain.value = volume;
    }

    if (this.gainNode.gain.value < 0) {
      this.gainNode.gain.value = 0;
    }
    else if (this.gainNode.gain.value > 1) {
      this.gainNode.gain.value = 1;
    }
  }
}

//
class WebKey {
  constructor() {
    this.keyCor = [
      {
        keys  : 'azsxcfvgbnjmk,l./:\\]'.split(''),
        octave: 3,
        head  : -1  // 'a' is code B#(A-)
      },
      {
        keys  : 'q2w3er5t6y7ui9o0p@^['.split(''),
        octave: 4,
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
    // console.log('down: ' + e.key);
    switch (e.key) {
      case 'ArrowUp':
        this.soundKey.setVolume(0.02, true);
        break;
      case 'ArrowRight':
        this.soundKey.setOctave(1, true);
        break;
      case 'ArrowDown':
        this.soundKey.setVolume(-0.02, true);
        break;
      case 'ArrowLeft':
        this.soundKey.setOctave(-1, true);
        break;
      default:
        this.soundKey.startSound(e.key);
        break;
    }
  }

  _stopSound(e) {
    // console.log('up: ' + e.key);
    this.soundKey.stopSound(e.key);
  }
}

const webKey = new WebKey();
