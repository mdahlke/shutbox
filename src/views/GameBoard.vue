<template>
	<section id="game-board">
		<h1>Shutbox</h1>
		
		<div class="available">
			<ul class="shut-items">
				<li v-for="number in getNumbers"
				    @click="toggleShut(number)"
				    :class="{ 'shut': isShut(number) }"
				    class="shut-item">{{ number }}
				</li>
			</ul>
			
			<div class="round-shut">{{ roundShut }}</div>
		</div>
		
		<div class="dice">
			<div class="rolled">
				<strong>Die 1</strong>: <span>{{ die1 }}</span>
				<br />
				<strong>Die 2</strong>: <span>{{ die2 }}</span>
			</div>
			
			<button v-if="!roundConfirmed"
			        @click="confirmShut">
				Confirm
			</button>
			
			<button v-if="roundConfirmed"
			        @click="rollDice"
			        type="button">Roll
			</button>
			
			<div v-if="errorMessage"
			     class="error-message">{{ errorMessage }}
			</div>
			
			<div class="reset">
				<button @click="resetGame">
					Reset Game
				</button>
			</div>
		
		</div>
	</section>
</template>

<script>
	import {mapGetters} from 'vuex';
	
	export default {
		name: 'GameBoard',
		data() {
			return {
				die1: 0,
				die2: 0,
				shut: [],
				roundShut: [],
				errorMessage: '',
				roundConfirmed: true
			};
		},
		computed: {
			...mapGetters({
				getNumbers: 'getNumbers'
			})
		},
		methods: {
			rollDice() {
				this.resetErrorMessage();
				if (this.roundConfirmed) {
					// new round
					this.roundShut = [];
					
					this.die1 = this.getRandom();
					this.die2 = this.getRandom();
					
					this.roundConfirmed = false;
					
					this.availableToDrop();
				}
			},
			getRandom() {
				return Math.floor(Math.random() * 6) + 1;
			},
			availableToDrop() {
				const total = this.diceTotal;
				
				
			},
			diceTotal() {
				return this.die1 + this.die2;
			},
			toggleShut(number) {
				this.resetErrorMessage();
				const index = this.roundShut.indexOf(number);
				
				if (index !== -1) {
					this.roundShut.splice(index, 1);
				} else {
					this.roundShut.push(number);
				}
			},
			confirmShut() {
				this.resetErrorMessage();
				const total = this.roundShut.reduce((a, b) => a + b);
				const diceTotal = this.diceTotal();
				
				if (total === diceTotal) {
					this.shut = this.shut.concat(this.roundShut);
					this.resetDice();
					this.roundConfirmed = true;
				} else {
					this.errorMessage = 'That doesn\'t add up';
				}
			},
			isShut(number) {
				return this.shut.includes(number);
			},
			resetDice() {
				this.die1 = 0;
				this.die2 = 0;
			},
			resetErrorMessage() {
				this.errorMessage = '';
			},
			resetGame() {
				this.resetDice();
				this.shut = [];
				this.roundShut = [];
			}
		}
	};
</script>

<style scoped lang="scss">
	
	.shut {
		text-decoration: line-through;
	}
	
	.error-message {
		color: red;
	}
	
	.shut-items {
		display: flex;
		justify-content: center;
		list-style: none;
		
		.shut-item {
			flex: 0 0 auto;
			margin: 0 2px;
			padding: 30px 15px;
			background-color: brown;
			color: white;
			cursor: pointer;
			
			&.shut {
				color: brown;
			}
		}
	}
	
	.reset {
		margin-top: 10vh;
	}
</style>
