let audioCtx = null;

function getCtx() {
	if (!audioCtx) {
		audioCtx = new (window.AudioContext || window.webkitAudioContext)();
	}
	// Resume if suspended (browser autoplay policy)
	if (audioCtx.state === 'suspended') {
		audioCtx.resume();
	}
	return audioCtx;
}

export function playDiceRoll() {
	try {
		const ctx = getCtx();
		const duration = 0.45;
		const bufferSize = Math.floor(ctx.sampleRate * duration);
		const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
		const data = buffer.getChannelData(0);

		for (let i = 0; i < bufferSize; i++) {
			// White noise with exponential decay and a mid-game bump for "tumbling" feel
			const t = i / bufferSize;
			const envelope = Math.exp(-t * 4) + 0.15 * Math.exp(-(t - 0.4) * 20) * (t > 0.35 ? 1 : 0);
			data[i] = (Math.random() * 2 - 1) * envelope;
		}

		const source = ctx.createBufferSource();
		source.buffer = buffer;

		const filter = ctx.createBiquadFilter();
		filter.type = 'bandpass';
		filter.frequency.value = 800;
		filter.Q.value = 0.8;

		const gain = ctx.createGain();
		gain.gain.setValueAtTime(0.35, ctx.currentTime);
		gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

		source.connect(filter);
		filter.connect(gain);
		gain.connect(ctx.destination);
		source.start();
	} catch (e) {
		// Audio not available
	}
}

export function playTileShut() {
	try {
		const ctx = getCtx();
		const now = ctx.currentTime;

		// Wooden clack: two detuned oscillators with fast decay
		[220, 180].forEach((freq, i) => {
			const osc = ctx.createOscillator();
			const gain = ctx.createGain();
			osc.type = 'triangle';
			osc.frequency.setValueAtTime(freq, now);
			osc.frequency.exponentialRampToValueAtTime(freq * 0.4, now + 0.08);
			gain.gain.setValueAtTime(0.3 - i * 0.05, now);
			gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
			osc.connect(gain);
			gain.connect(ctx.destination);
			osc.start(now);
			osc.stop(now + 0.12);
		});
	} catch (e) {
		// Audio not available
	}
}

export function playWin() {
	try {
		const ctx = getCtx();
		const now = ctx.currentTime;
		const notes = [523, 659, 784, 1047]; // C5 E5 G5 C6
		notes.forEach((freq, i) => {
			const osc = ctx.createOscillator();
			const gain = ctx.createGain();
			osc.type = 'sine';
			osc.frequency.value = freq;
			gain.gain.setValueAtTime(0, now + i * 0.12);
			gain.gain.linearRampToValueAtTime(0.25, now + i * 0.12 + 0.02);
			gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.3);
			osc.connect(gain);
			gain.connect(ctx.destination);
			osc.start(now + i * 0.12);
			osc.stop(now + i * 0.12 + 0.35);
		});
	} catch (e) {
		// Audio not available
	}
}
