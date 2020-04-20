<template>
	<section id="game-board">
		<div :class="{'is-shutbox': isShutbox}"
		     class="shutbox-won">
			🎉🎉 You Won! 🎉🎉
		</div>
		
		<h1>Shutbox</h1>
		
		<div v-if="addForMe"
		     class="your-score">
			Your score: <span v-if="!isBeforeGame">{{ score }}</span><span v-else>n/a</span>
		</div>
		
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
			
			<div v-if="addForMe && currentRoundTotal"
			     class="round-score">
				{{ currentRoundTotal }}
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
			
			<button @click="confirmAndRollDice"
			        :disabled="(!roundConfirmed && !(currentRoundNumbers.length && (currentRoundTotal == diceTotal)))"
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
				<label for="number-of-die">How many dice? </label>
				<input v-model="numberOfDie"
				       id="number-of-die"
				       type="number" />
				
				<br />
				<label for="add-for-me">Do the math for you? </label>
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
				diceValues: 'getDiceValues',
				isBeforeGame: 'isBeforeGame',
				score: 'getScore',
				isShutbox: 'isShutbox',
				currentRoundTotal: 'currentRoundTotal'
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
			confirmAndRollDice() {
				this.$store.dispatch('confirmShut')
					.then(res => {
						console.log(this.roundConfirmed);
						if (this.roundConfirmed) {
							this.rollDice();
						}
					});
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
		position: relative;
		margin: 0 auto;
		padding-bottom: 20px;
		border: 20px solid saddlebrown;
		background-color: darkgreen;
		background-image: url(../assets/felt.jpg);
		background-size: 100% 100%;
		border-image-source: url(../assets/wood-grain.jpeg);
		border-image-slice: 500;
		box-shadow: inset 0 0 50px black;
		max-width: 800px;
	}
	
	.round-score {
		position: absolute;
		top: 50%;
		left: 50%;
		font-weight: 600;
		color: #054928;
		font-size: 24px;
	}
	
	.shut {
		text-decoration: line-through;
		background-color: saddlebrown;
	}
	
	.selected {
		font-weight: bold;
		text-decoration: underline;
		background-color: green;
		
		.finger {
			opacity: .7;
		}
	}
	
	.error-message {
		color: red;
	}
	
	.shut-items {
		display: flex;
		justify-content: center;
		margin-top: 2px;
		margin-left: 0;
		margin-bottom: 150px;
		padding-left: 0;
		border-bottom: 2px solid silver;
		list-style: none;
		
		.shut-item {
			flex: 1 0 0;
			position: relative;
			margin: 0 2px;
			height: 80px;
			line-height: 80px;
			color: saddlebrown;
			background-color: #e2a67b;
			box-shadow: 1px 0 #733f19;
			border-right: 1px solid black;
			transition-property: height;
			transition-duration: 1s;
			perspective: 1000px;
			transform-style: preserve-3d;
			
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
					height: calc(80px + 2px);
					transform: scaleY(-1);
				}
			}
			
			.number {
				position: relative;
				z-index: -1;
			}
			
			.finger {
				position: absolute;
				top: calc(100% + 2px);
				left: 0;
				background: saddlebrown;
				box-shadow: 1px 0 #733f19;
				border-right: 1px solid black;
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
		
		&.btn-big {
			font-size: 20px;
			padding: 10px 18px;
			background-color: #fefefe;
			color: black;
			
			&:disabled {
				opacity: 0.2;
			}
			
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
	
	.shutbox-won {
		display: none;
		position: fixed;
		top: 0;
		left: 0;
		height: 100vh;
		width: 100vw;
		background-color: rgba(0, 0, 0, 0.79);
		color: white;
		align-items: center;
		justify-content: center;
		font-size: 10vmin;
		z-index: 9;
		
		&.is-shutbox {
			display: flex;
		}
	}
</style>
