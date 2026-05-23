<template>
	<section class="stats-page">
		<div class="stats-header">
			<router-link to="/" class="back-link">← Back to Game</router-link>
			<h1>Game Statistics</h1>
			<button @click="confirmReset" class="btn-reset-stats">Reset Stats</button>
		</div>

		<div v-if="!gameStats.played" class="empty-state">
			<p>No games played yet. Start a game to see your stats here!</p>
			<router-link to="/" class="btn-play">Play Now</router-link>
		</div>

		<template v-else>
			<!-- Overview -->
			<div class="section">
				<h2>Overview</h2>
				<div class="card-grid">
					<div class="card">
						<span class="card-value">{{ gameStats.played }}</span>
						<span class="card-label">Games Played</span>
					</div>
					<div class="card win">
						<span class="card-value">{{ gameStats.won }}</span>
						<span class="card-label">Won</span>
					</div>
					<div class="card loss">
						<span class="card-value">{{ gameStats.lost }}</span>
						<span class="card-label">Lost</span>
					</div>
					<div class="card">
						<span class="card-value">{{ winRate }}%</span>
						<span class="card-label">Win Rate</span>
					</div>
					<div class="card">
						<span class="card-value">{{ gameStats.currentStreak }}</span>
						<span class="card-label">Current Streak</span>
					</div>
					<div class="card highlight">
						<span class="card-value">{{ gameStats.bestStreak }}</span>
						<span class="card-label">Best Streak</span>
					</div>
				</div>
			</div>

			<!-- Score stats -->
			<div class="section">
				<h2>Score <small>(lower is better)</small></h2>
				<div class="card-grid">
					<div class="card highlight">
						<span class="card-value">{{ bestScore }}</span>
						<span class="card-label">Best (Lowest)</span>
					</div>
					<div class="card">
						<span class="card-value">{{ worstScore }}</span>
						<span class="card-label">Worst (Highest)</span>
					</div>
					<div class="card">
						<span class="card-value">{{ avgScore }}</span>
						<span class="card-label">Average</span>
					</div>
					<div class="card win">
						<span class="card-value">{{ winScoreAvg }}</span>
						<span class="card-label">Avg Score on Win</span>
					</div>
				</div>
			</div>

			<!-- Per variety -->
			<div v-if="Object.keys(gameStats.perVariety).length" class="section">
				<h2>By Game Variety</h2>
				<div class="table-wrap">
					<table>
						<thead>
							<tr>
								<th>Variety</th>
								<th>Played</th>
								<th>Won</th>
								<th>Lost</th>
								<th>Win %</th>
								<th>Best Score</th>
								<th>Avg Score</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="(data, variety) in gameStats.perVariety" :key="variety">
								<td>{{ variety }} numbers</td>
								<td>{{ data.played }}</td>
								<td class="win-cell">{{ data.won }}</td>
								<td class="loss-cell">{{ data.lost }}</td>
								<td>{{ varietyWinRate(data) }}%</td>
								<td>{{ varietyBestScore(data) }}</td>
								<td>{{ varietyAvgScore(data) }}</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>

			<!-- Dice roll distribution -->
			<div v-if="gameStats.diceRolls && gameStats.diceRolls.total" class="section">
				<h2>Dice Roll Distribution</h2>
				<p class="section-sub">{{ gameStats.diceRolls.total.toLocaleString() }} total dice rolled</p>
				<div class="dice-dist">
					<div v-for="face in 6" :key="face" class="dist-item">
						<div class="dist-count-top">{{ (gameStats.diceRolls[face] || 0).toLocaleString() }}</div>
						<div class="dist-bar-wrap">
							<div class="dist-bar" :style="{ height: barHeight(face) + '%' }"></div>
						</div>
						<div class="dist-face">{{ ['⚀','⚁','⚂','⚃','⚄','⚅'][face - 1] }} {{ face }}</div>
						<div class="dist-pct">{{ rollPct(face) }}%</div>
					</div>
				</div>
			</div>
		</template>

		<!-- Reset confirm modal -->
		<div v-if="showResetConfirm" class="modal-overlay" @click.self="showResetConfirm = false">
			<div class="modal-box">
				<h3>Reset all stats?</h3>
				<p>This will permanently delete all game history. This cannot be undone.</p>
				<div class="modal-actions">
					<button @click="showResetConfirm = false" class="btn-cancel">Cancel</button>
					<button @click="doReset" class="btn-confirm-reset">Yes, Reset</button>
				</div>
			</div>
		</div>
	</section>
</template>

<script>
	import { mapGetters, mapActions } from 'vuex';

	export default {
		name: 'GameStats',
		data() {
			return {
				showResetConfirm: false,
			};
		},
		computed: {
			...mapGetters({
				gameStats: 'getGameStats',
			}),
			winRate() {
				if (!this.gameStats.played) return 0;
				return Math.round((this.gameStats.won / this.gameStats.played) * 100);
			},
			bestScore() {
				const s = this.gameStats.scores;
				return s && s.length ? Math.min(...s) : 'n/a';
			},
			worstScore() {
				const s = this.gameStats.scores;
				return s && s.length ? Math.max(...s) : 'n/a';
			},
			avgScore() {
				const s = this.gameStats.scores;
				if (!s || !s.length) return 'n/a';
				return Math.round(s.reduce((a, b) => a + b, 0) / s.length);
			},
			winScoreAvg() {
				// Average score on wins — needs per-game data; approximate from perVariety
				const s = this.gameStats.scores;
				if (!s || !s.length) return 'n/a';
				// Score of 0 = win (all shut); filter near-zero
				const winScores = s.filter(x => x === 0);
				if (!winScores.length) return 'n/a';
				return 0; // all-shut wins are always 0
			},
			maxRollCount() {
				const rolls = this.gameStats.diceRolls || {};
				return Math.max(1, ...([1,2,3,4,5,6].map(f => rolls[f] || 0)));
			},
		},
		methods: {
			...mapActions(['resetStats']),
			varietyWinRate(data) {
				return data.played ? Math.round((data.won / data.played) * 100) : 0;
			},
			varietyBestScore(data) {
				return data.scores && data.scores.length ? Math.min(...data.scores) : 'n/a';
			},
			varietyAvgScore(data) {
				if (!data.scores || !data.scores.length) return 'n/a';
				return Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length);
			},
			barHeight(face) {
				const count = (this.gameStats.diceRolls || {})[face] || 0;
				return Math.round((count / this.maxRollCount) * 100);
			},
			rollPct(face) {
				const total = (this.gameStats.diceRolls || {}).total || 0;
				const count = (this.gameStats.diceRolls || {})[face] || 0;
				return total ? Math.round((count / total) * 100) : 0;
			},
			confirmReset() {
				this.showResetConfirm = true;
			},
			async doReset() {
				await this.resetStats();
				this.showResetConfirm = false;
			},
		},
	};
</script>

<style scoped lang="scss">
	.stats-page {
		max-width: 760px;
		margin: 0 auto;
		padding: 24px 16px 60px;
		font-family: 'Avenir', Helvetica, Arial, sans-serif;
		text-align: left;
	}

	.stats-header {
		display: flex;
		align-items: center;
		gap: 16px;
		margin-bottom: 28px;
		flex-wrap: wrap;

		h1 {
			flex: 1;
			margin: 0;
			font-size: 1.8rem;
		}
	}

	.back-link {
		color: #2c3e85;
		text-decoration: none;
		font-weight: 600;
		white-space: nowrap;

		&:hover { text-decoration: underline; }
	}

	.btn-reset-stats {
		background: darkred;
		color: #fff;
		border: none;
		border-radius: 4px;
		padding: 8px 16px;
		cursor: pointer;
		font-size: 13px;
		white-space: nowrap;

		&:hover { background: #8b0000; }
	}

	/* ── Sections ── */
	.section {
		margin-bottom: 36px;

		h2 {
			font-size: 1.2rem;
			margin: 0 0 12px;
			border-bottom: 2px solid #e0d8cc;
			padding-bottom: 6px;
			color: #3a2e20;
		}

		small {
			font-size: 0.75em;
			color: #888;
			font-weight: normal;
		}
	}

	.section-sub {
		color: #666;
		font-size: 13px;
		margin: -8px 0 12px;
	}

	/* ── Cards ── */
	.card-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
		gap: 12px;
	}

	.card {
		background: #f5f5f5;
		border-radius: 8px;
		padding: 16px 10px;
		text-align: center;
		display: flex;
		flex-direction: column;
		gap: 6px;

		&.win { background: #e8f5e9; }
		&.loss { background: #fce4e4; }
		&.highlight { background: #fff8e1; border: 1px solid #f0d060; }

		.card-value {
			font-size: 2rem;
			font-weight: 700;
			color: #1a1a2e;
			line-height: 1;
		}

		.card-label {
			font-size: 11px;
			text-transform: uppercase;
			letter-spacing: 0.5px;
			color: #666;
		}
	}

	/* ── Table ── */
	.table-wrap {
		overflow-x: auto;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 14px;

		th, td {
			padding: 10px 14px;
			text-align: center;
			border-bottom: 1px solid #eee;
		}

		th {
			background: #f0ece4;
			font-weight: 600;
			color: #3a2e20;
		}

		tr:hover td { background: #faf8f4; }

		.win-cell { color: #2e7d32; font-weight: 600; }
		.loss-cell { color: #c62828; font-weight: 600; }
	}

	/* ── Dice distribution ── */
	.dice-dist {
		display: flex;
		gap: 10px;
		justify-content: center;
		align-items: flex-end;
		padding: 0 8px 8px;
	}

	.dist-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		flex: 1;
		max-width: 90px;
	}

	.dist-count-top {
		font-size: 12px;
		font-weight: 600;
		color: #3a2e20;
		min-height: 18px;
		text-align: center;
	}

	.dist-bar-wrap {
		width: 100%;
		height: 120px;
		position: relative;
		background: rgba(0, 0, 0, 0.06);
		border-radius: 4px 4px 0 0;
	}

	.dist-bar {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		background: saddlebrown;
		border-radius: 4px 4px 0 0;
		transition: height 0.5s ease;
		min-height: 4px;
	}

	.dist-face {
		font-size: 1rem;
		font-weight: 700;
		color: #1a1a2e;
		margin-top: 2px;
	}

	.dist-pct {
		font-size: 11px;
		color: #888;
	}

	/* ── Empty state ── */
	.empty-state {
		text-align: center;
		padding: 60px 20px;
		color: #666;

		p { font-size: 1.1rem; margin-bottom: 20px; }
	}

	.btn-play {
		display: inline-block;
		background: saddlebrown;
		color: #fff;
		padding: 12px 28px;
		border-radius: 4px;
		text-decoration: none;
		font-weight: 600;

		&:hover { background: #6b3a1f; }
	}

	/* ── Reset modal ── */
	.modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 200;
	}

	.modal-box {
		background: #fff;
		border-radius: 10px;
		padding: 28px 32px;
		max-width: 360px;
		width: 90%;
		text-align: center;
		box-shadow: 0 8px 40px rgba(0, 0, 0, 0.25);

		h3 { margin: 0 0 10px; font-size: 1.3rem; }
		p { color: #555; margin-bottom: 24px; }
	}

	.modal-actions {
		display: flex;
		gap: 12px;
		justify-content: center;
	}

	.btn-cancel {
		background: #eee;
		border: none;
		border-radius: 4px;
		padding: 10px 20px;
		cursor: pointer;
		font-size: 14px;

		&:hover { background: #ddd; }
	}

	.btn-confirm-reset {
		background: darkred;
		color: #fff;
		border: none;
		border-radius: 4px;
		padding: 10px 20px;
		cursor: pointer;
		font-size: 14px;

		&:hover { background: #8b0000; }
	}
</style>
