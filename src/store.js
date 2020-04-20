import Vue from 'vue';
import Vuex from 'vuex';
import {INITIALISE_STORE} from './mutations';

const GAME_STATUS_ACTIVE = 1;
const GAME_STATUS_BEFORE = 0;
const GAME_STATUS_AFTER = 2;

Vue.use(Vuex);

const store = new Vuex.Store({
	state: {
		numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
		numberOfDie: 2,
		diceValues: [],
		openNumbers: [],
		closedNumbers: [],
		currentRoundNumbers: [],
		roundConfirmed: true,
		errorMessage: '',
		gameStatus: GAME_STATUS_BEFORE,
		addForMe: true
	},
	getters: {
		getScore: state => {
			return state.openNumbers.length ? state.openNumbers.reduce((a, b) => a + b) : 0;
		},
		getNumbers: state => state.numbers,
		getNumberOfDie: state => state.numberOfDie,
		getDiceValues: state => state.diceValues,
		getOpenNumbers: state => state.openNumbers,
		getClosedNumbers: state => state.closedNumbers,
		getCurrentRoundNumbers: state => state.currentRoundNumbers,
		getRoundConfirmed: state => state.roundConfirmed,
		getErrorMessage: state => state.errorMessage,
		isBeforeGame: state => state.gameStatus === GAME_STATUS_BEFORE,
		
		diceTotal: state => {
			return state.diceValues.length ? state.diceValues.reduce((a, b) => a + b) : 0;
		},
		isShutbox: state => state.gameStatus === GAME_STATUS_ACTIVE && state.openNumbers.length === 0,
	},
	mutations: {
		[INITIALISE_STORE](state, store) {
			// Replace the state object with the stored item
			this.replaceState(
				Object.assign(state, store)
			);
		},
		setGameStatus(state, status) {
			state.gameStatus = status;
		},
		setNumberOfDie(state, number) {
			state.numberOfDie = Number(number);
		},
		setOpenNumbers(state, numbers) {
			state.openNumbers = numbers;
		},
		setDiceValues(state, values) {
			state.diceValues = values;
		},
		addDieValue(state, val) {
			console.log({val});
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
		}
	},
	actions: {
		startGame({commit}) {
			commit('setGameStatus', GAME_STATUS_ACTIVE);
		},
		resetDice({commit, getters, state}) {
			for (let i = 0; i < getters.getNumberOfDie; i++) {
				commit('addDieValue', 0);
			}
		},
		resetErrorMessage({commit}) {
			commit('setErrorMessage', '');
		},
		resetRound({commit, dispatch}) {
			commit('setCurrentRoundNumbers', []);
			commit('setDiceValues', []);
			dispatch('resetErrorMessage', []);
			dispatch('resetDice', []);
		},
		resetGame({commit, dispatch, getters}) {
			commit('setRoundConfirmed', true);
			commit('setClosedNumbers', []);
			commit('setGameStatus', GAME_STATUS_BEFORE);
			commit('setOpenNumbers', getters.getNumbers);
			dispatch('resetRound', []);
		},
		confirmShut({commit, getters, dispatch}) {
			dispatch('resetErrorMessage');
			const total = getters.getCurrentRoundNumbers.length ? getters.getCurrentRoundNumbers.reduce((a, b) => a + b) : 0;
			
			if (total === getters.diceTotal) {
				if (getters.getCurrentRoundNumbers.length) {
					const currentRound = getters.getCurrentRoundNumbers;
					const closedNumbers = getters.getClosedNumbers;
					const closed = closedNumbers.concat(currentRound);
					commit('setClosedNumbers', closed);
					
					const openNumbers = getters.getOpenNumbers.filter(a => !closed.includes(a));
					console.log({closedNumbers, openNumbers});
					
					commit('setOpenNumbers', openNumbers);
				} else {
					commit('setClosedNumbers', getters.getCurrentRoundNumbers);
				}
				commit('setRoundConfirmed', true);
				dispatch('resetRound');
			} else {
				commit('setErrorMessage', 'That doesn\'t add up');
			}
		},
		toggleShut({dispatch, getters, commit}, number) {
			dispatch('resetErrorMessage');
			const index = getters.getCurrentRoundNumbers.indexOf(number);
			
			console.log({index});
			
			if (index !== -1) {
				const currentNumbers = getters.getCurrentRoundNumbers;
				currentNumbers.splice(index, 1);
				commit('setCurrentRoundNumbers', currentNumbers);
			} else {
				commit('addCurrentRoundNumber', number);
			}
		}
	}
});


store.subscribe((mutation, state) => {
	const clonedState = JSON.parse(JSON.stringify(state));
	
	// Store the state object as a JSON string
	localStorage.setItem('store', JSON.stringify(clonedState));
});


export default store;
