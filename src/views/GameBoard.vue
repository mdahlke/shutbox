<template>
	<section id="game-board">
		<h1>Shutbox</h1>
		
		<section class="board-wrap">
			<div class="available">
				<ul class="shut-items">
					<li v-for="number in numbers"
					    @click="toggleShut(number)"
					    :class="{ 'shut': isShut(number), 'selected': isSelected(number) }"
					    class="shut-item">
						<span class="number">{{ number }}</span>
						<span class="finger"></span>
					</li>
				</ul>
			</div>
			
			<div class="dice">
			<span v-for="die in diceValues"
			      class="die"
			>{{ die }}</span>
				
				<div v-if="addForMe && diceTotal"
				     class="dice-total">
					= {{ diceTotal }}
				</div>
			</div>
		</section>
		
		<div class="action-buttons">
			
			<button v-if="!roundConfirmed"
			        @click="confirmShut"
			class="btn btn-big">
				Confirm
			</button>
			
			<button v-if="roundConfirmed"
			        @click="rollDice"
			        class="btn btn-big"
			        type="button">Roll
			</button>
			
			<div v-if="errorMessage"
			     class="error-message">{{ errorMessage }}
			</div>
			
			<div class="reset">
				<button @click="resetGame"
				        class="btn btn-small">
					Reset Game
				</button>
			</div>
			
			<div v-if="isBeforeGame">
				<label for="number-of-die">Change the number of dice to use: </label>
				<input v-model="numberOfDie"
				       id="number-of-die"
				       type="number" />
				
				<br />
				<label for="add-for-me">Add the dice for you?</label>
				<input v-model="addForMe"
				       id="add-for-me"
				       type="checkbox" />
			</div>
		</div>
	</section>
</template>

<script>
	import {mapState, mapGetters, mapMutations, mapActions} from 'vuex';
	
	export default {
		name: 'GameBoard',
		data() {
			return {
				shut: [],
				roundShut: []
			};
		},
		computed: {
			...mapGetters({
				diceTotal: 'diceTotal',
				numberOfDie: 'getNumberOfDie',
				numbers: 'getNumbers',
				errorMessage: 'getErrorMessage',
				roundConfirmed: 'getRoundConfirmed',
				currentRoundNumbers: 'getCurrentRoundNumbers',
				closedNumbers: 'getClosedNumbers',
				diceValues: 'diceValues',
				isBeforeGame: 'isBeforeGame'
			}),
			diceValues: {
				get() {
					return this.$store.state.diceValues;
				},
				set(val) {
					this.setDiceValues(val);
				}
			},
			numberOfDie: {
				get() {
					return this.$store.state.numberOfDie;
				},
				set(val) {
					this.setNumberOfDie(val);
				}
			},
			diceValues: {
				get() {
					return this.$store.state.diceValues;
				},
				set(val) {
					this.setDiceValues(val);
				}
			},
			errorMessage: {
				get() {
					return this.$store.state.errorMessage;
				},
				set(val) {
					this.setErrorMessage(val);
				}
			},
			currentRoundNumbers: {
				get() {
					return this.$store.state.currentRoundNumbers;
				},
				set(val) {
					this.setCurrentRoundNumbers(val);
				}
			},
			roundConfirmed: {
				get() {
					return this.$store.state.roundConfirmed;
				},
				set(val) {
					this.setRoundConfirmed(val);
				}
			},
			addForMe: {
				get() {
					return this.$store.state.addForMe;
				},
				set(val) {
					this.setAddForMe(val);
				}
			}
		},
		created() {
			// this.resetDice();
		},
		methods: {
			...mapMutations([
				'setNumberOfDie',
				'setDiceValues',
				'addDieValue',
				'setErrorMessage',
				'setCurrentRoundNumbers',
				'addCurrentRoundNumber',
				'setRoundConfirmed',
				'setAddForMe'
			]),
			...mapActions([
				'resetGame',
				'resetRound',
				'resetDice',
				'resetErrorMessage',
				'confirmShut',
				'toggleShut',
				'startGame'
			]),
			rollDice() {
				this.resetErrorMessage();
				this.startGame();
				
				if (this.roundConfirmed) {
					// new round
					this.setDiceValues([]);
					
					for (let i = 0; i < this.numberOfDie; i++) {
						this.addDieValue(this.getRandom());
					}
					
					this.setRoundConfirmed(false);
					
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
			isSelected(number) {
				return this.currentRoundNumbers.includes(number);
			},
			isShut(number) {
				return this.closedNumbers.includes(number);
			}
		}
	};
</script>

<style scoped lang="scss">
	
	.board-wrap {
		padding-bottom: 20px;
		border: 20px solid saddlebrown;
		background-color: darkgreen;
		background-image: url(../assets/felt.jpg);
		background-size: 100% 100%;
		border-image-source: url(../assets/wood-grain.jpeg);
		border-image-slice: 500;
		box-shadow: inset 0px 0 50px black;
	}
	
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
		margin-top: 2px;
		margin-left: 0;
		margin-bottom: 150px;
		padding-left: 0;
		
		.shut-item {
			flex: 1 0 auto;
			position: relative;
			margin: 0 2px;
			height: 80px;
			line-height: 80px;
			background-color: #e2a67b;
			color: saddlebrown;
			transition-property: height;
			transition-duration: 1s;
			perspective: 1000px;
			transform-style: preserve-3d;
			
			.finger {
			}
			
			&:not(.shut) {
				cursor: pointer;
			}
			
			&.shut {
				/*background-color: saddlebrown;*/
				/*color: saddlebrown;*/
				cursor: not-allowed;
				pointer-events: none;
			}
			
			&.selected,
			&.shut {
				
				.finger {
					height: 80px;
					transform: scaleY(-1);
				}
			}
			
			.number {
				position: relative;
				z-index: -1;
			}
			
			.finger {
				position: absolute;
				top: 100%;
				left: 0;
				background: saddlebrown;
				height: 60px;
				width: 100%;
				transition-duration: 1s;
				transition-property: all;
				transform-origin: top;
			}
		}
	}
	
	.reset {
		margin-top: 10vh;
	}
	
	.dice {
		display: flex;
		justify-content: center;
		align-items: center;
		color: #fff;
		
		.die {
			margin: 0 3px;
			border: 1px solid #000;
			border-radius: 10%;
			line-height: 40px;
			height: 40px;
			width: 40px;
			background-color: #fff;
			color: #000;
		}
	}
	
	.btn {
		margin-top: 10px;
		margin-bottom: 10px;
		border-radius: 0;
		
		&.btn-big  {
			font-size: 20px;
			padding: 10px 18px;
			background-color: #fefefe;
			color: black;
			
			&:focus {
				outline: none;
			}
		}
		
		&.btn-small {
			padding: 5px 10px;
			background: darkred;
			color: white;
			border: 0;
		}
	}
</style>
