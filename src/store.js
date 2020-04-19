import Vue from 'vue';
import Vuex from 'vuex';

const GAME_STATUS_ACTIVE = 1;
const GAME_STATUS_BEFORE = 0;
const GAME_STATUS_AFTER = 2;

Vue.use(Vuex);

const store = new Vuex.Store({
	state: {
		numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
		openNumbers: [],
		closedNumbers: [],
		gameStatus: GAME_STATUS_BEFORE
		
	},
	getters: {
		getNumbers: state => state.numbers
	},
	mutations: {},
	actions: {}
});


store.subscribe((mutation, state) => {
	// `accessToken` will be stored separately from the store
	const clonedState = JSON.parse(JSON.stringify(state));
	delete clonedState.accessToken;
	
	if (mutation.type !== ACCESS_TOKEN) {
		// Store the state object as a JSON string
		localStorage.setItem('store', JSON.stringify(clonedState));
	}
});


export default store;
