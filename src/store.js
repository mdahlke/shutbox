import { createStore } from 'vuex'
import { INITIALISE_STORE } from './mutations'

const GAME_STATUS_ACTIVE = 1;
const GAME_STATUS_BEFORE = 0;
const GAME_STATUS_AFTER = 2;

function getSummingItems(a, t) {
	return a.reduce((h, n) => Object.keys(h)
		.reduceRight((m, k) => +k + n <= t ? (m[+k + n] = m[+k + n] ? m[+k + n].concat(m[k].map(sa => sa.concat(n)))
			: m[k].map(sa => sa.concat(n)), m)
			: m, h), {0: [[]]})[t];
}

function defaultStats() {
	return {
		played: 0,
		won: 0,
		lost: 0,
		currentStreak: 0,
		bestStreak: 0,
		scores: [],
		perVariety: {},
		diceRolls: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, total: 0 }
	};
}

const store = createStore({
	state: {
		numbers: [],
		gameVariety: 12,
		gameVarieties: [9, 10, 12, 24],
		numberOfDie: 2,
		diceValues: [],
		openNumbers: [],
		closedNumbers: [],
		currentRoundNumbers: [],
		roundConfirmed: true,
		errorMessage: '',
		gameStatus: GAME_STATUS_BEFORE,
		addForMe: true,
		showTotal: true,
		gameStats: defaultStats()
	},
	getters: {
		getScore: state => {
			return state.openNumbers.length ? state.openNumbers.reduce((a, b) => a + b) : 0;
		},
		getNumbers: (state) => {
			return [...Array(state.gameVariety).keys()].map(i => i + 1);
		},
		getNumberOfDie: state => state.numberOfDie,
		getDiceValues: state => state.diceValues,
		getOpenNumbers: state => state.openNumbers,
		getClosedNumbers: state => state.closedNumbers,
		getCurrentRoundNumbers: state => state.currentRoundNumbers,
		getRoundConfirmed: state => state.roundConfirmed,
		getErrorMessage: state => state.errorMessage,
		isBeforeGame: state => state.gameStatus === GAME_STATUS_BEFORE,
		getGameStatus: state => state.gameStatus,
		getGameStats: state => state.gameStats,
		getGameVarieties: state => state.gameVarieties,
		minDiceForVariety: state => Math.max(2, Math.ceil(state.gameVariety / 6)),
		winProbability: state => {
			const numbers = state.openNumbers;
			const numberOfDie = state.numberOfDie;
			if (numbers.length === 1 && numbers.includes(1)) return 0;
			return ((1 / numberOfDie / (numbers.length)) * 100).toFixed(2);
		},
		possibleShutable: (state, getters) => {
			const available = state.openNumbers;
			const diceValue = getters.diceTotal;
			const lessThanDie = available.filter(e => e <= diceValue);
			return (getSummingItems(lessThanDie, diceValue) || []).reverse();
		},
		currentRoundTotal: state => {
			return state.currentRoundNumbers.length ? state.currentRoundNumbers.reduce((a, b) => a + b) : 0;
		},
		diceTotal: state => {
			return state.diceValues.length ? state.diceValues.reduce((a, b) => a + b) : 0;
		},
		isShutbox: state => state.gameStatus === GAME_STATUS_ACTIVE && state.openNumbers.length === 0
	},
	mutations: {
		[INITIALISE_STORE](state, savedStore) {
			const merged = Object.assign({}, state, savedStore);
			// Ensure stats shape is complete after loading from localStorage
			merged.gameStats = Object.assign(defaultStats(), savedStore.gameStats || {});
			this.replaceState(merged);
		},
		setGameVariety(state, variety) {
			state.gameVariety = Number(variety);
			const minDice = Math.max(2, Math.ceil(Number(variety) / 6));
			if (state.numberOfDie < minDice) {
				state.numberOfDie = minDice;
			}
		},
		setGameStatus(state, status) {
			state.gameStatus = status;
		},
		setNumberOfDie(state, number) {
			const minDice = Math.max(2, Math.ceil(state.gameVariety / 6));
			state.numberOfDie = Math.max(minDice, Number(number));
		},
		setOpenNumbers(state, numbers) {
			state.openNumbers = numbers;
		},
		setDiceValues(state, values) {
			state.diceValues = values;
		},
		addDieValue(state, val) {
			state.diceValues.push(val);
		},
		setErrorMessage(state, values) {
			state.errorMessage = values;
		},
		setCurrentRoundNumbers(state, values) {
			state.currentRoundNumbers = values;
		},
		addCurrentRoundNumber(state, values) {
			state.currentRoundNumbers.push(values);
		},
		setRoundConfirmed(state, val) {
			state.roundConfirmed = val;
		},
		setClosedNumbers(state, closed) {
			state.closedNumbers = closed;
		},
		setAddForMe(state, add) {
			state.addForMe = add;
		},
		setShowTotal(state, show) {
			state.showTotal = show;
		},
		setGameStats(state, stats) {
			state.gameStats = stats;
		},
		recordDiceRoll(state, value) {
			const rolls = { ...state.gameStats.diceRolls };
			rolls[value] = (rolls[value] || 0) + 1;
			rolls.total = (rolls.total || 0) + 1;
			state.gameStats = { ...state.gameStats, diceRolls: rolls };
		},
		resetStats(state) {
			state.gameStats = defaultStats();
		}
	},
	actions: {
		startGame({ commit }) {
			commit('setGameStatus', GAME_STATUS_ACTIVE);
		},
		resetDice({ commit, getters }) {
			for (let i = 0; i < getters.getNumberOfDie; i++) {
				commit('addDieValue', 0);
			}
		},
		resetErrorMessage({ commit }) {
			commit('setErrorMessage', '');
		},
		resetRound({ commit, dispatch }) {
			commit('setCurrentRoundNumbers', []);
			commit('setDiceValues', []);
			dispatch('resetErrorMessage', []);
			dispatch('resetDice', []);
		},
		resetGame({ commit, dispatch, getters }) {
			commit('setRoundConfirmed', true);
			commit('setClosedNumbers', []);
			commit('setGameStatus', GAME_STATUS_BEFORE);
			commit('setOpenNumbers', getters.getNumbers);
			return dispatch('resetRound', []);
		},
		confirmShut({ commit, getters, dispatch }) {
			return new Promise((resolve, reject) => {
				dispatch('resetErrorMessage');
				const total = getters.currentRoundTotal;

				if (total === getters.diceTotal) {
					if (getters.getCurrentRoundNumbers.length) {
						const currentRound = getters.getCurrentRoundNumbers;
						const closedNumbers = getters.getClosedNumbers;
						const closed = closedNumbers.concat(currentRound);
						commit('setClosedNumbers', closed);
						const openNumbers = getters.getOpenNumbers.filter(a => !closed.includes(a));
						commit('setOpenNumbers', openNumbers);
					} else {
						commit('setClosedNumbers', getters.getCurrentRoundNumbers);
					}
					commit('setRoundConfirmed', true);
					return dispatch('resetRound').then(resolve);
				} else {
					commit('setErrorMessage', "That doesn't add up");
					reject();
				}
			});
		},
		toggleShut({ dispatch, getters, commit }, number) {
			dispatch('resetErrorMessage');
			const index = getters.getCurrentRoundNumbers.indexOf(number);
			if (index !== -1) {
				const currentNumbers = [...getters.getCurrentRoundNumbers];
				currentNumbers.splice(index, 1);
				commit('setCurrentRoundNumbers', currentNumbers);
			} else {
				commit('addCurrentRoundNumber', number);
			}
		},
		clearShutboxWin({ commit }) {
			commit('setGameStatus', GAME_STATUS_BEFORE);
		},
		recordGame({ commit, state, getters }) {
			return new Promise((resolve) => {
				const stats = JSON.parse(JSON.stringify(state.gameStats));
				const variety = String(state.gameVariety);
				const score = getters.getScore;
				const won = state.openNumbers.length === 0;

				stats.played++;
				if (won) {
					stats.won++;
					stats.currentStreak = (stats.currentStreak || 0) + 1;
					if (stats.currentStreak > (stats.bestStreak || 0)) {
						stats.bestStreak = stats.currentStreak;
					}
				} else {
					stats.lost++;
					stats.currentStreak = 0;
				}

				stats.scores.push(score);

				if (!stats.perVariety[variety]) {
					stats.perVariety[variety] = { played: 0, won: 0, lost: 0, scores: [] };
				}
				stats.perVariety[variety].played++;
				if (won) stats.perVariety[variety].won++;
				else stats.perVariety[variety].lost++;
				stats.perVariety[variety].scores.push(score);

				commit('setGameStats', stats);
				resolve();
			});
		},
		endGame({ commit, dispatch }) {
			return dispatch('recordGame').then(() => {
				commit('setGameStatus', GAME_STATUS_AFTER);
			});
		},
		resetStats({ commit }) {
			commit('resetStats');
		}
	}
});

store.subscribe((mutation, state) => {
	const clonedState = JSON.parse(JSON.stringify(state));
	localStorage.setItem('store', JSON.stringify(clonedState));
});

export default store;
