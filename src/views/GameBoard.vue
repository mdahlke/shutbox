<template>
	<section id="game-board">
		<h1>Shutbox</h1>
		
		<div class="available">
			<ul class="shut-items">
				<li v-for="number in getNumbers"
				    @click="toggleShut(number)"
				    :class="{ 'shut': isShut(number), 'selected': isSelected(number) }"
				    class="shut-item">{{ number }}
				</li>
			</ul>
		</div>
		
		<div class="dice">
			<span v-for="die in diceValues"
			      class="die"
			>{{ die }}</span>
		</div>
		
		<div v-if="diceTotal()"
		     class="dice-total">
			{{ diceTotal() }}
		</div>
		
		<div class="action-buttons">
			
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
				numberOfDie: 2,
				diceValues: [],
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
		created() {
			this.resetDice();
		},
		methods: {
			rollDice() {
				this.resetErrorMessage();
				if (this.roundConfirmed) {
					// new round
					this.roundShut = [];
					this.diceValues = [];
					
					console.log(this.numberOfDie);
					
					for (let i = 0; i < this.numberOfDie; i++) {
						this.diceValues.push(this.getRandom());
					}
					
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
			dieValue(index) {
				console.log({index});
				return this.diceValues[index];
			},
			diceTotal() {
				return this.diceValues.length ? this.diceValues.reduce((a, b) => a + b) : 0;
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
				const total = this.roundShut.length ? this.roundShut.reduce((a, b) => a + b) : 0;
				const diceTotal = this.diceTotal();
				
				if (total === diceTotal) {
					if (this.roundShut.length) {
						this.shut = this.shut.concat(this.roundShut);
					} else {
						this.shut = this.roundShut;
					}
					this.resetDice();
					this.roundConfirmed = true;
					this.roundShut = [];
					this.diceValues = [];
				} else {
					this.errorMessage = 'That doesn\'t add up';
				}
			},
			isSelected(number) {
				return this.roundShut.includes(number);
			},
			isShut(number) {
				return this.shut.includes(number);
			},
			resetDice() {
				for (let i = 0; i < this.numberOfDie; i++) {
					this.diceValues.push(0);
				}
			},
			resetErrorMessage() {
				this.errorMessage = '';
			},
			resetGame() {
				this.resetDice();
				this.shut = [];
				this.roundShut = [];
				this.roundConfirmed = true;
				this.diceValues = [];
				this.errorMessage = '';
			}
		}
	};
</script>

<style scoped lang="scss">
	
	.shut {
		text-decoration: line-through;
		background-color: saddlebrown;
	}
	
	.selected {
		font-weight: bold;
		text-decoration: underline;
		background-color: green;
	}
	
	.error-message {
		color: red;
	}
	
	.shut-items {
		display: flex;
		justify-content: center;
		list-style: none;
		margin-left: 0;
		padding-left: 0;
		
		.shut-item {
			flex: 1 1 auto;
			margin: 0 2px;
			/*padding: 30px 15px;*/
			height: 40px;
			line-height: 40px;
			background-color: #e2a67b;
			color: saddlebrown;
			
			&:not(.shut) {
				cursor: pointer;
			}
			
			&.shut {
				background-color: saddlebrown;
				color: saddlebrown;
				cursor: not-allowed;
				pointer-events: none;
			}
		}
	}
	
	.reset {
		margin-top: 10vh;
	}
	
	.dice {
		display: flex;
		justify-content: center;
		
		.die {
			margin: 0 3px;
			border: 1px solid #000;
			border-radius: 10%;
			line-height: 40px;
			height: 40px;
			width: 40px;
		}
	}
</style>
