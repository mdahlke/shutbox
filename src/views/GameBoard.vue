<template>
	<section id="game-board">
		<!-- Win overlay -->
		<div @click="handleWinOverlayClick"
		     :class="{'is-shutbox': isShutbox}"
		     class="shutbox-won">
			🎉🎉 You Won! 🎉🎉
		</div>

		<h1>Shutbox</h1>

		<div v-if="showTotal" class="your-score">
			Your score: <span v-if="!isBeforeGame">{{ score }}</span><span v-else>n/a</span>
		</div>

		<section class="board-wrap">
			<div class="available">
				<ul class="shut-items">
					<li v-for="number in numbers"
					    :key="'tile-' + number"
					    @click="handleTileClick(number)"
					    :class="[
					    	'number-' + number,
					    	{
					    		shut: isShut(number),
					    		selected: isSelected(number),
					    		highlight: shouldHighlight(number),
					    	}
					    ]"
					    class="shut-item">
						<div class="tile-flipper" :class="{ flipped: isShut(number) }">
							<div class="tile-front">{{ number }}</div>
							<div class="tile-back"></div>
						</div>
					</li>
				</ul>
			</div>

			<div v-if="addForMe && currentRoundTotal" class="round-score">
				{{ currentRoundTotal }}
			</div>

			<div class="dice-area">
				<Die
					v-for="i in numberOfDie"
					:key="'die-' + i"
					:ref="el => { dieRefs[i - 1] = el }"
					:value="diceValues[i - 1] || 1"
					:size="dieSize"
					:instant="autoplayInstant"
					:dieIndex="i - 1"
				/>
				<div v-if="addForMe && diceTotal" class="dice-total">
					= {{ diceTotal }}
				</div>
			</div>
		</section>

		<div class="action-buttons">
			<button v-if="isActiveGame && shuttable"
			        @click="confirmAndRollDice"
			        :disabled="isRolling || (!roundConfirmed && !(currentRoundNumbers.length && currentRoundTotal === diceTotal))"
			        class="btn btn-big"
			        type="button">Roll
			</button>
			<button v-else
			        @click="startGameAndRoll"
			        :disabled="isRolling || doAutoplay"
			        class="btn btn-big"
			        type="button">Start &amp; Roll
			</button>

			<div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

			<!-- Autoplay -->
			<div class="autoplay-controls">
				<button v-if="!doAutoplay"
				        @click="startAutoplay"
				        class="btn btn-outline"
				        type="button">▶ Autoplay
				</button>
				<button v-else
				        @click="stopAutoplay"
				        class="btn btn-outline btn-stop"
				        type="button">■ Stop
				</button>
				<div class="speed-control">
					<label>Speed:
						<input type="range" v-model.number="autoplaySpeed" min="1" max="4" step="1" />
						<span class="speed-label">{{ speedLabel }}</span>
					</label>
				</div>
			</div>

			<div class="bottom-controls">
				<button @click="resetGame" class="btn btn-small btn-reset">Reset</button>
				<button @click="showStats = true" class="btn btn-small btn-stats">📊 Stats</button>
				<button @click="settingsOpen = !settingsOpen" class="btn btn-small btn-settings">
					⚙ {{ settingsOpen ? '▲' : '▼' }}
				</button>
			</div>

			<!-- Settings drawer -->
			<transition name="drawer">
				<div v-if="settingsOpen" class="settings-panel">
					<div class="settings-row">
						<label for="game-variety">Game variety</label>
						<select v-model="gameVariety" id="game-variety" :disabled="isActiveGame">
							<option v-for="v in gameVarieties" :key="v" :value="v">{{ v }} numbers</option>
						</select>
					</div>
					<div class="settings-row">
						<label for="number-of-die">Dice count</label>
						<input v-model.number="numberOfDie"
						       id="number-of-die"
						       type="number"
						       :min="minDiceForVariety"
						       max="8"
						       :disabled="isActiveGame" />
						<small>min {{ minDiceForVariety }} for {{ gameVariety }}-number game</small>
					</div>
					<div class="settings-row">
						<label for="add-for-me">Do the math for me</label>
						<input v-model="addForMe" id="add-for-me" type="checkbox" />
					</div>
					<div class="settings-row">
						<label for="show-total">Show score</label>
						<input v-model="showTotal" id="show-total" type="checkbox" />
					</div>
					<p v-if="isActiveGame" class="settings-note">
						Start a new game to change variety or dice count.
					</p>
				</div>
			</transition>
		</div>

		<div v-if="addForMe" class="shuttable">
			<p>Shut-able combinations</p>
			<ul class="possible-shutable">
				<li v-for="(n, index) in possibleShutable" :key="index">
					<span v-for="(x, key) in n" :key="'combo-' + key">{{ x }}</span>
				</li>
			</ul>
		</div>

		<!-- Quick stats modal -->
		<teleport to="body">
			<div v-if="showStats" class="modal-overlay" @click.self="showStats = false">
				<div class="modal-box">
					<button class="modal-close" @click="showStats = false">✕</button>
					<h2>Quick Stats</h2>
					<div class="stat-grid">
						<div class="stat-card">
							<span class="stat-value">{{ gameStats.played }}</span>
							<span class="stat-label">Played</span>
						</div>
						<div class="stat-card win">
							<span class="stat-value">{{ gameStats.won }}</span>
							<span class="stat-label">Won</span>
						</div>
						<div class="stat-card loss">
							<span class="stat-value">{{ gameStats.lost }}</span>
							<span class="stat-label">Lost</span>
						</div>
						<div class="stat-card">
							<span class="stat-value">{{ winRate }}%</span>
							<span class="stat-label">Win Rate</span>
						</div>
						<div class="stat-card">
							<span class="stat-value">{{ bestScore }}</span>
							<span class="stat-label">Best Score</span>
						</div>
						<div class="stat-card">
							<span class="stat-value">{{ gameStats.bestStreak }}</span>
							<span class="stat-label">Best Streak</span>
						</div>
					</div>
					<router-link to="/stats" @click="showStats = false" class="stats-link">
						View full stats →
					</router-link>
				</div>
			</div>
		</teleport>
	</section>
</template>

<script>
	import { mapGetters, mapMutations, mapActions } from 'vuex';
	import Die from '../components/Die.vue';
	import { playDiceRoll, playTileShut, playWin } from '../utils/sounds.js';

	export default {
		name: 'GameBoard',
		components: { Die },
		data() {
			return {
				dieRefs: [],
				isRolling: false,
				doAutoplay: false,
				autoplaySpeed: 2,
				settingsOpen: false,
				showStats: false,
			};
		},
		computed: {
			...mapGetters({
				diceTotal: 'diceTotal',
				numbers: 'getNumbers',
				closedNumbers: 'getClosedNumbers',
				isBeforeGame: 'isBeforeGame',
				getGameStatus: 'getGameStatus',
				score: 'getScore',
				isShutbox: 'isShutbox',
				currentRoundTotal: 'currentRoundTotal',
				possibleShutable: 'possibleShutable',
				gameVarieties: 'getGameVarieties',
				gameStats: 'getGameStats',
				minDiceForVariety: 'minDiceForVariety',
			}),
			isActiveGame() {
				return this.getGameStatus === 1;
			},
			shuttable() {
				return !!this.possibleShutable.length;
			},
			autoplayInstant() {
				return this.autoplaySpeed === 4;
			},
			speedLabel() {
				return ['Slow', 'Normal', 'Fast', 'Instant'][this.autoplaySpeed - 1];
			},
			moveDelay() {
				return [1500, 700, 200, 0][this.autoplaySpeed - 1];
			},
			dieSize() {
				if (this.numberOfDie <= 2) return 80;
				if (this.numberOfDie <= 4) return 68;
				return 56;
			},
			winRate() {
				if (!this.gameStats.played) return 0;
				return Math.round((this.gameStats.won / this.gameStats.played) * 100);
			},
			bestScore() {
				const scores = this.gameStats.scores;
				if (!scores || !scores.length) return 'n/a';
				return Math.min(...scores);
			},
			diceValues: {
				get() { return this.$store.state.diceValues; },
				set(val) { this.setDiceValues(val); },
			},
			numberOfDie: {
				get() { return this.$store.state.numberOfDie; },
				set(val) { this.setNumberOfDie(val); },
			},
			errorMessage: {
				get() { return this.$store.state.errorMessage; },
				set(val) { this.setErrorMessage(val); },
			},
			currentRoundNumbers: {
				get() { return this.$store.state.currentRoundNumbers; },
				set(val) { this.setCurrentRoundNumbers(val); },
			},
			roundConfirmed: {
				get() { return this.$store.state.roundConfirmed; },
				set(val) { this.setRoundConfirmed(val); },
			},
			addForMe: {
				get() { return this.$store.state.addForMe; },
				set(val) { this.setAddForMe(val); },
			},
			showTotal: {
				get() { return this.$store.state.showTotal; },
				set(val) { this.setShowTotal(val); },
			},
			gameVariety: {
				get() { return this.$store.state.gameVariety; },
				set(val) { this.setGameVariety(val); },
			},
		},
		methods: {
			...mapMutations([
				'setNumberOfDie', 'setDiceValues', 'addDieValue',
				'setErrorMessage', 'setCurrentRoundNumbers', 'addCurrentRoundNumber',
				'setRoundConfirmed', 'setAddForMe', 'setShowTotal',
				'setGameStatus', 'setGameVariety', 'recordDiceRoll',
			]),
			...mapActions([
				'resetGame', 'resetErrorMessage',
				'confirmShut', 'toggleShut', 'clearShutboxWin', 'endGame',
			]),
			wait(ms) {
				return new Promise(r => setTimeout(r, Math.max(0, ms)));
			},
			getRandom() {
				return Math.floor(Math.random() * 6) + 1;
			},
			isSelected(number) {
				return this.currentRoundNumbers.includes(number);
			},
			isShut(number) {
				return this.closedNumbers.includes(number);
			},
			shouldHighlight(number) {
				return this.addForMe &&
					this.possibleShutable.length > 0 &&
					this.possibleShutable[0].includes(number);
			},
			handleTileClick(number) {
				if (this.isShut(number) || !this.isActiveGame) return;
				this.$store.dispatch('toggleShut', number);
			},
			handleWinOverlayClick() {
				this.clearShutboxWin();
			},
			async startGameAndRoll() {
				await this.resetGame();
				this.setGameStatus(1);
				this.setRoundConfirmed(true);
				await this.rollDice();
			},
			async rollDice() {
				if (!this.roundConfirmed || this.isRolling) return;

				this.isRolling = true;
				this.resetErrorMessage();
				this.setGameStatus(1);
				this.setDiceValues([]);

				const values = [];
				for (let i = 0; i < this.numberOfDie; i++) {
					const v = this.getRandom();
					values.push(v);
					this.addDieValue(v);
					this.recordDiceRoll(v);
				}

				this.setRoundConfirmed(false);

				if (!this.autoplayInstant) playDiceRoll();

				await Promise.all(values.map((v, i) => {
					const die = this.dieRefs[i];
					return die ? die.roll(v) : Promise.resolve();
				}));

				this.isRolling = false;

				if (!this.possibleShutable.length) {
					await this.endGame();
				}
			},
			async confirmAndRollDice() {
				try {
					await this.$store.dispatch('confirmShut');
					if (!this.autoplayInstant) {
						playTileShut();
						await this.wait(300);
					}
					if (this.roundConfirmed) {
						await this.rollDice();
					}
				} catch (e) {
					// confirmShut rejected — numbers don't add up
				}
			},
			async startAutoplay() {
				if (this.doAutoplay) return;
				this.doAutoplay = true;
				await this.resetGame();
				this.setGameStatus(1);
				this.setRoundConfirmed(true);
				this.autoplayLoop();
			},
			stopAutoplay() {
				this.doAutoplay = false;
			},
			async autoplayLoop() {
				while (this.doAutoplay) {
					await this.rollDice();
					await this.wait(this.moveDelay);

					if (!this.doAutoplay) break;

					if (!this.possibleShutable.length) {
						// Loss (or already-won game fed into endGame) — reset and restart
						await this.wait(this.autoplayInstant ? 50 : 1000);
						if (!this.doAutoplay) break;
						await this.resetGame();
						this.setGameStatus(1);
						this.setRoundConfirmed(true);
						continue;
					}

					// Select the best available combination
					this.$store.commit('setCurrentRoundNumbers', [...this.possibleShutable[0]]);
					await this.$store.dispatch('confirmShut');

					if (!this.autoplayInstant) playTileShut();
					await this.wait(this.autoplayInstant ? 10 : this.moveDelay);

					// Check for win (all tiles shut)
					if (this.$store.state.openNumbers.length === 0) {
						if (!this.autoplayInstant) playWin();
						await this.endGame();
						await this.wait(this.autoplayInstant ? 50 : 1000);
						if (!this.doAutoplay) break;
						await this.resetGame();
						this.setGameStatus(1);
						this.setRoundConfirmed(true);
					}
				}
			},
		},
	};
</script>

<style scoped lang="scss">
	.board-wrap {
		position: relative;
		margin: 0 auto;
		padding-bottom: 20px;
		border: 20px solid saddlebrown;
		background-color: darkgreen;
		background-image: url(../assets/felt-2.jpg);
		background-size: 100% 100%;
		border-image-source: url(../assets/wood-grain-4.png);
		border-image-slice: 40;
		box-shadow: inset 0 0 50px black;
		max-width: 900px;
	}

	.available {
		border-top: 40px solid transparent;
		border-image-source: url(../assets/wood-grain-4.png);
		border-image-slice: 90;
	}

	.round-score {
		position: absolute;
		top: 50%;
		left: 50%;
		font-weight: 600;
		color: #054928;
		font-size: 24px;
	}

	/* ── Tile flip ── */
	.shut-items {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		margin: 2px 0 20px;
		padding: 0;
		border-bottom: 2px solid silver;
		list-style: none;

		.shut-item {
			flex: 1 0 0;
			margin: 0 2px;
			height: 70px;
			perspective: 400px;
			cursor: pointer;

			&.shut {
				cursor: not-allowed;
				pointer-events: none;
			}

			&.highlight .tile-front {
				outline: 2px dashed #baf7a6;
				box-shadow: inset 0 0 13px 2px #baf7a6;
			}

			&.selected .tile-front {
				background-color: #3a8f3a;
				color: #fff;
			}
		}
	}

	.tile-flipper {
		width: 100%;
		height: 100%;
		transform-style: preserve-3d;
		transition: transform 0.55s cubic-bezier(0.4, 0, 0.2, 1);

		&.flipped {
			transform: rotateX(180deg);
		}
	}

	.tile-front,
	.tile-back {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		backface-visibility: hidden;
		border-right: 1px solid black;
	}

	.tile-front {
		background: #e2a67b;
		color: saddlebrown;
		font-size: 1.1rem;
		box-shadow: 1px 0 #733f19;
		transition: background-color 0.15s, color 0.15s;
	}

	.tile-back {
		background: saddlebrown;
		transform: rotateX(180deg);
	}

	/* ── Dice area ── */
	.dice-area {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		align-items: center;
		gap: 28px;
		padding: 24px 16px;
		min-height: 130px;
		/* let the bounce animation spill outside the flex row without
		   breaking the board layout — clip happens at the board border */
		overflow: visible;

		.dice-total {
			color: #fff;
			font-size: 1.4rem;
			font-weight: 600;
			text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.7);
			margin-left: 8px;
		}
	}

	/* ── Action buttons ── */
	.action-buttons {
		padding: 10px 0;
	}

	.btn {
		margin: 6px 4px;
		border: none;
		cursor: pointer;
		border-radius: 3px;
		font-size: 15px;

		&.btn-big {
			font-size: 20px;
			padding: 10px 28px;
			background: #fefefe;
			color: #222;

			&:disabled {
				opacity: 0.25;
				cursor: not-allowed;
			}
		}

		&.btn-small {
			padding: 6px 14px;
			font-size: 13px;
		}

		&.btn-reset { background: darkred; color: #fff; }
		&.btn-stats { background: #2c3e85; color: #fff; }
		&.btn-settings { background: #555; color: #fff; }

		&.btn-outline {
			background: transparent;
			border: 2px solid #555;
			color: #333;
			padding: 6px 16px;
			border-radius: 4px;

			&.btn-stop {
				border-color: darkred;
				color: darkred;
			}
		}
	}

	/* ── Autoplay controls ── */
	.autoplay-controls {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 16px;
		margin: 10px 0;
		flex-wrap: wrap;
	}

	.speed-control {
		font-size: 14px;

		label {
			display: flex;
			align-items: center;
			gap: 8px;
		}

		input[type=range] {
			width: 100px;
			accent-color: saddlebrown;
		}

		.speed-label {
			min-width: 48px;
			text-align: left;
			font-weight: 600;
		}
	}

	/* ── Bottom controls ── */
	.bottom-controls {
		display: flex;
		justify-content: center;
		gap: 8px;
		margin-top: 16px;
	}

	/* ── Settings drawer ── */
	.settings-panel {
		background: #f5f0e8;
		border: 1px solid #c8b89a;
		border-radius: 6px;
		padding: 16px 24px;
		margin: 12px auto;
		max-width: 420px;
		text-align: left;
	}

	.settings-row {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 12px;

		label {
			min-width: 160px;
			font-weight: 500;
			font-size: 14px;
		}

		select,
		input[type=number] {
			border: 1px solid #bbb;
			border-radius: 4px;
			padding: 4px 8px;
			font-size: 14px;
			background: #fff;

			&:disabled { opacity: 0.5; }
		}

		input[type=checkbox] {
			width: 18px;
			height: 18px;
			accent-color: saddlebrown;
		}

		small {
			color: #888;
			font-size: 11px;
		}
	}

	.settings-note {
		font-size: 12px;
		color: #a06030;
		margin: 4px 0 0;
		font-style: italic;
	}

	.drawer-enter-active,
	.drawer-leave-active {
		transition: opacity 0.2s, transform 0.2s;
	}

	.drawer-enter-from,
	.drawer-leave-to {
		opacity: 0;
		transform: translateY(-6px);
	}

	/* ── Error ── */
	.error-message {
		color: red;
		margin: 4px 0;
		font-size: 14px;
	}

	/* ── Shutables list ── */
	.shuttable {
		margin-top: 20px;

		p {
			font-weight: 600;
			margin-bottom: 4px;
		}
	}

	.possible-shutable {
		list-style: none;
		padding: 0;

		li span:not(:last-of-type)::after {
			content: ', ';
		}
	}

	/* ── Win overlay ── */
	.shutbox-won {
		display: none;
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.79);
		color: white;
		align-items: center;
		justify-content: center;
		font-size: 10vmin;
		z-index: 9;
		cursor: pointer;

		&.is-shutbox { display: flex; }
	}

	/* ── Stats modal ── */
	.modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.6);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 100;
	}

	.modal-box {
		background: #fff;
		border-radius: 10px;
		padding: 28px 32px;
		max-width: 420px;
		width: 90%;
		position: relative;
		box-shadow: 0 8px 40px rgba(0, 0, 0, 0.3);

		h2 { margin: 0 0 20px; font-size: 1.4rem; }
	}

	.modal-close {
		position: absolute;
		top: 12px;
		right: 14px;
		background: none;
		border: none;
		font-size: 18px;
		cursor: pointer;
		color: #666;

		&:hover { color: #000; }
	}

	.stat-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 12px;
		margin-bottom: 20px;
	}

	.stat-card {
		background: #f5f5f5;
		border-radius: 8px;
		padding: 12px 8px;
		text-align: center;
		display: flex;
		flex-direction: column;
		gap: 4px;

		&.win { background: #e8f5e9; }
		&.loss { background: #fce4e4; }

		.stat-value {
			font-size: 1.5rem;
			font-weight: 700;
			color: #1a1a2e;
		}

		.stat-label {
			font-size: 11px;
			text-transform: uppercase;
			letter-spacing: 0.5px;
			color: #666;
		}
	}

	.stats-link {
		display: inline-block;
		color: #2c3e85;
		font-weight: 600;
		text-decoration: none;

		&:hover { text-decoration: underline; }
	}

	.your-score {
		margin-bottom: 10px;
		font-size: 1rem;
	}
</style>
