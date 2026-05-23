<template>
	<!-- .die-mover handles the bounce path; .die-scene owns the perspective -->
	<div class="die-mover" ref="mover">
		<div class="die-scene" :style="{ '--die-size': size + 'px' }">
			<div class="die-cube" :style="cubeStyle">
				<!-- Front face: pip layout is dynamic so it always lands clean and flat -->
				<div class="die-face face-front">
					<span v-for="(pos, i) in pipLayout" :key="i" :class="['pip', pos]"></span>
				</div>
				<!-- Remaining faces are decorative — visible only mid-tumble -->
				<div class="die-face face-back">
					<span class="pip top-left"></span><span class="pip top-right"></span>
					<span class="pip mid-left"></span><span class="pip mid-right"></span>
					<span class="pip bot-left"></span><span class="pip bot-right"></span>
				</div>
				<div class="die-face face-top">
					<span class="pip top-right"></span><span class="pip bot-left"></span>
				</div>
				<div class="die-face face-bottom">
					<span class="pip top-left"></span><span class="pip top-right"></span>
					<span class="pip center"></span>
					<span class="pip bot-left"></span><span class="pip bot-right"></span>
				</div>
				<div class="die-face face-right">
					<span class="pip top-right"></span>
					<span class="pip center"></span>
					<span class="pip bot-left"></span>
				</div>
				<div class="die-face face-left">
					<span class="pip top-left"></span><span class="pip top-right"></span>
					<span class="pip bot-left"></span><span class="pip bot-right"></span>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
const PIP_LAYOUTS = {
	1: ['center'],
	2: ['top-right', 'bot-left'],
	3: ['top-right', 'center', 'bot-left'],
	4: ['top-left', 'top-right', 'bot-left', 'bot-right'],
	5: ['top-left', 'top-right', 'center', 'bot-left', 'bot-right'],
	6: ['top-left', 'top-right', 'mid-left', 'mid-right', 'bot-left', 'bot-right']
};

export default {
	name: 'Die',
	props: {
		value:    { type: Number, default: 1 },
		size:     { type: Number, default: 72 },
		instant:  { type: Boolean, default: false },
		dieIndex: { type: Number, default: 0 }
	},
	emits: ['roll-complete'],
	data() {
		return {
			rotX: 0,
			rotY: 0,
			duration: 0,
			displayValue: this.value,
			moveAnim: null
		};
	},
	computed: {
		cubeStyle() {
			return {
				transform: `rotateX(${this.rotX}deg) rotateY(${this.rotY}deg)`,
				transition: `transform ${this.duration}ms cubic-bezier(0.22, 0.61, 0.36, 1)`
			};
		},
		pipLayout() {
			return PIP_LAYOUTS[this.displayValue] || ['center'];
		}
	},
	mounted() {
		this.displayValue = this.value;
	},
	methods: {
		snapToFace(value) {
			if (this.moveAnim) { this.moveAnim.cancel(); this.moveAnim = null; }
			// Snap rotX/rotY to nearest multiple of 360 so front face is always shown
			this.rotX = Math.round(this.rotX / 360) * 360;
			this.rotY = Math.round(this.rotY / 360) * 360;
			this.duration = 0;
			this.displayValue = value;
		},
		async roll(targetValue) {
			if (this.instant) {
				this.snapToFace(targetValue);
				this.$emit('roll-complete');
				return;
			}

			if (this.moveAnim) { this.moveAnim.cancel(); this.moveAnim = null; }

			// Stagger dice so they feel independent
			if (this.dieIndex > 0) await new Promise(r => setTimeout(r, this.dieIndex * 40));

			const ROLL_MS = 820;
			const yShift  = this.dieIndex * 10;

			// ── Measure actual distances so the bounce hits the real board edge ──
			const moverEl  = this.$refs.mover;
			const boardEl  = moverEl.closest('.board-wrap');
			const moverRect = moverEl.getBoundingClientRect();
			let toLeftWall = 145;
			let startX     = 220;
			if (boardEl) {
				const boardRect  = boardEl.getBoundingClientRect();
				const border     = 20; // matches the 20px board border
				toLeftWall = Math.max(60, moverRect.left - boardRect.left - border);
				startX     = Math.max(150, boardRect.right - moverRect.right - border + 30);
			}

			// Rightward bounces are capped so the die never looks like it hit a right wall.
			// b1 is at most ~35px right of the die's natural position regardless of board width.
			const b1 = Math.min(Math.round(toLeftWall * 0.22), 35);
			const b2 = Math.round(b1 * 0.45);  // leftward secondary
			const b3 = Math.round(b2 * 0.40);  // tiny rightward wiggle

			// Random final resting spot so each roll looks different
			const finalX   = Math.round(Math.random() * 20 - 12); // bias left: -12 to +8
			const finalY   = Math.round(Math.random() * 12 - 6);
			const finalRot = (Math.random() * 16 - 8).toFixed(1);

			// Update pips now, before the die moves — the throw animation hides the change
			this.displayValue = targetValue;

			// ── Bounce movement on the wrapper (no perspective here) ──
			this.moveAnim = moverEl.animate(
				[
					{ transform: `translate(${startX}px, -16px)`,                                              offset: 0,    easing: 'ease-in' },
					{ transform: `translate(${-toLeftWall}px, ${14 + yShift}px) scaleX(1.1) scaleY(0.9)`,      offset: 0.30, easing: 'ease-out' },
					{ transform: `translate(${b1}px, -20px)`,                                                  offset: 0.50, easing: 'ease-in' },
					{ transform: `translate(${-b2}px, ${5 + yShift * 0.35}px) scaleX(1.05) scaleY(0.95)`,     offset: 0.67, easing: 'ease-out' },
					{ transform: `translate(${b3}px, -6px)`,                                                   offset: 0.81, easing: 'ease-in' },
					{ transform: `translate(${Math.round(finalX * 0.3)}px, ${Math.round(finalY * 0.3)}px)`,   offset: 0.91, easing: 'ease-out' },
					{ transform: `translate(${finalX}px, ${finalY}px) rotate(${finalRot}deg)`,                 offset: 1 }
				],
				// fill:'forwards' keeps the random resting position until the next roll cancels it
				{ duration: ROLL_MS, fill: 'forwards' }
			);

			// ── 3-D spin: always returns to front face (multiples of 360°) ──
			// Random 3–5 extra full spins in each axis so each roll looks different
			const spinsX = (3 + Math.floor(Math.random() * 3)) * 360;
			const spinsY = (3 + Math.floor(Math.random() * 3)) * 360;
			// Snap current accumulated rotation to the nearest multiple of 360 first
			this.rotX = Math.round(this.rotX / 360) * 360 + spinsX;
			this.rotY = Math.round(this.rotY / 360) * 360 + spinsY;
			this.duration = ROLL_MS;

			await new Promise(r => setTimeout(r, ROLL_MS + 20));

			this.duration = 0;
			// Normalise accumulated rotation to avoid unbounded growth over many rolls
			this.rotX = this.rotX % 3600;
			this.rotY = this.rotY % 3600;

			// Keep moveAnim reference so the next roll can cancel the fill and reset position
			this.$emit('roll-complete');
		}
	}
};
</script>

<style scoped lang="scss">
$pip-size: 22%;

.die-mover {
	display: inline-flex;
}

.die-scene {
	width: var(--die-size);
	height: var(--die-size);
	/* Large perspective = nearly orthographic — face looks flat once settled */
	perspective: 900px;
	display: inline-flex;
	align-items: center;
	justify-content: center;
}

.die-cube {
	width: var(--die-size);
	height: var(--die-size);
	position: relative;
	transform-style: preserve-3d;
	/* No filter — filter flattens preserve-3d and breaks the 3-D cube */
}

.die-face {
	position: absolute;
	width: var(--die-size);
	height: var(--die-size);
	background: #fefefe;
	border: 2px solid #bbb;
	border-radius: 12%;
	box-shadow: inset 0 0 8px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.35);

	&.face-front  { transform: translateZ(calc(var(--die-size) / 2)); }
	&.face-back   { transform: rotateY(180deg) translateZ(calc(var(--die-size) / 2)); }
	&.face-top    { transform: rotateX(90deg) translateZ(calc(var(--die-size) / 2)); }
	&.face-bottom { transform: rotateX(-90deg) translateZ(calc(var(--die-size) / 2)); }
	&.face-right  { transform: rotateY(90deg) translateZ(calc(var(--die-size) / 2)); }
	&.face-left   { transform: rotateY(-90deg) translateZ(calc(var(--die-size) / 2)); }
}

.pip {
	position: absolute;
	width: $pip-size;
	height: $pip-size;
	background: #1a1a2e;
	border-radius: 50%;
	box-shadow: inset 1px 1px 2px rgba(255, 255, 255, 0.2);

	&.top-left  { top: 15%; left: 15%; }
	&.top-right { top: 15%; right: 15%; }
	&.mid-left  { top: 50%; left: 15%; transform: translateY(-50%); }
	&.mid-right { top: 50%; right: 15%; transform: translateY(-50%); }
	&.center    { top: 50%; left: 50%; transform: translate(-50%, -50%); }
	&.bot-left  { bottom: 15%; left: 15%; }
	&.bot-right { bottom: 15%; right: 15%; }
}
</style>
