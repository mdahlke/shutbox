<template>
	<section id="game-board">
		<div @click="clearShutboxWin"
		     :class="{'is-shutbox': isShutbox}"
		     class="shutbox-won">
			🎉🎉 You Won! 🎉🎉
		</div>
		
		<h1>Shutbox</h1>
		
		<div v-if="showTotal"
		     class="your-score">
			Your score: <span v-if="!isBeforeGame">{{ score }}</span><span v-else>n/a</span>
		</div>
		
		<section class="board-wrap">
			<div class="available">
				<ul class="shut-items">
					<li v-for="number in numbers"
					    @click="toggleShut(number)"
					    :class="[
					    	('number-'+ number),
					    	{
					    	'shut': isShut(number),
					    	'selected': isSelected(number),
					    	'highlight': shouldHighlight(number),
					    	}]"
					    class="shut-item"
					    :id="'finger-'+ number">
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
			      class="die dice"
			      :class="['dice-'+ die]"
			></span>
				
				<div v-if="addForMe && diceTotal"
				     class="dice-total">
					= {{ diceTotal }}
				</div>
			</div>
		</section>
		
		<div class="action-buttons">
			
			<button v-if="isActiveGame && shuttable"
			        @click="confirmAndRollDice"
			        :disabled="(!roundConfirmed && !(currentRoundNumbers.length && (currentRoundTotal == diceTotal)))"
			        id="roll-dice"
			        class="btn btn-big"
			        type="button">Roll
			</button>
			
			<button v-else
			        @click="startGameAndRoll"
			        class="btn btn-big"
			        type="button">Start & Roll
			</button>
			
			<div v-if="errorMessage"
			     class="error-message">{{ errorMessage }}
			</div>
			
			<div class="reset">
				<button @click="resetGame"
				        class="btn btn-small">
					Reset Game
				</button>
				<button v-if="!doAutoplay && false"
				        @click="autoplay"
				        class="btn">
					Autoplay
				</button>
				<button v-else-if="false"
				        @click="stopAutoplay"
				        class="btn">
					Stop autoplay
				</button>
			</div>
			
			<div v-if="isBeforeGame">
				
				<label for="game-variety">Game variety? </label>
				<select v-model="gameVariety"
				        id="game-variety">
					<option v-for="variety in gameVarieties"
					        :value="variety"
					>
						{{ variety }} numbers
					</option>
				</select>
				
				<br />
				
				<label for="number-of-die">How many dice? </label>
				<input v-model="numberOfDie"
				       id="number-of-die"
				       type="number" />
				
				<br />
				<label for="add-for-me">Do the math for you? </label>
				<input v-model="addForMe"
				       id="add-for-me"
				       type="checkbox" />
				
				<br />
				<label for="show-total">Show score? </label>
				<input v-model="showTotal"
				       id="show-total"
				       type="checkbox" />
			</div>
		</div>
		<div v-if="false && addForMe"
		     class="win-probability">
			<p>Win probability <small>(not accurate)</small></p>
			{{ winProbability }}%
		</div>
		<div v-if="addForMe"
		     class="shuttable">
			<p>Shut-able combinations</p>
			<ul class="possible-shutable">
				<li v-for="n in possibleShutable">
					<span v-for="x in n">{{ x }}</span>
				</li>
			</ul>
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
				roundShut: [],
				currentAutoplay: 0,
				doAutoplay: false
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
				getGameStatus: 'getGameStatus',
				score: 'getScore',
				isShutbox: 'isShutbox',
				currentRoundTotal: 'currentRoundTotal',
				winProbability: 'winProbability',
				possibleShutable: 'possibleShutable',
				gameVarieties: 'getGameVarieties'
			}),
			isActiveGame() {
				return this.getGameStatus === 1;
			},
			shuttable() {
				return !!this.possibleShutable.length;
			},
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
			},
			showTotal: {
				get() {
					return this.$store.state.showTotal;
				},
				set(val) {
					this.setShowTotal(val);
				}
			},
			gameVariety: {
				get() {
					return this.$store.state.gameVariety;
				},
				set(val) {
					this.setGameVariety(val);
				}
			}
		},
		created() {
			// this.resetDice();
			this.currentAutoplay = 0;
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
				'setAddForMe',
				'setShowTotal',
				'setGameStatus',
				'setGameVariety'
			]),
			...mapActions([
				'resetGame',
				'resetRound',
				'resetDice',
				'resetErrorMessage',
				'confirmShut',
				'toggleShut',
				'startGame',
				'clearShutboxWin',
				'endGame'
			]),
			startGame() {
				const status = this.setGameStatus(1);
				const confirm = this.setRoundConfirmed(true);
				return new Promise.all([status, confirm]);
			},
			startGameAndRoll() {
				this.resetGame().then(() => {
					this.clearShutboxWin();
					this.rollDice();
				});
			},
			rollDice() {
				this.resetErrorMessage();
				this.setGameStatus(1);
				
				if (this.roundConfirmed) {
					// new round
					this.setDiceValues([]);
					
					for (let i = 0; i < this.numberOfDie; i++) {
						this.addDieValue(this.getRandom());
					}
					
					this.setRoundConfirmed(false);
					
					this.availableToDrop();
					
					console.log('shuttable length', this.possibleShutable.length);
					
					if (!this.possibleShutable.length) {
						console.log('cannot do anything');
						this.endGame();
					}
					
				}
			},
			confirmAndRollDice() {
				this.$store.dispatch('confirmShut')
					.then(res => {
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
			},
			isPossible(number) {
				const i = this.possibleShutable.forEach(e => {
					console.log({e}, e.indexOf(number));
					return e.indexOf(number);
				});
				console.log(i);
			},
			shouldHighlight(number) {
				return this.addForMe && this.possibleShutable.some(e => e.length === 1 && e[0] === number);
			},
			canMakeAMove() {
				return this.possibleShutable;
			},
			stopAutoplay() {
				this.doAutoplay = false;
			},
			autoplay() {
				this.doAutoplay = true;
				this.currentAutoplay++;
				
				const $roll = document.getElementById('roll-dice');
				this.startGame();
				
				let br = false;
				let inter = setInterval(() => {
					
					if (!this.doAutoplay) {
						clearInterval(inter);
					}
					
					this.rollDice();
					
					if (this.getGameStatus === 2) {
						clearInterval(inter);
						this.autoplay();
						
						if (this.currentAutoplay > 100) {
							return;
						}
					} else if (this.possibleShutable.length) {
						this.$store.commit('setCurrentRoundNumbers', JSON.parse(JSON.stringify(this.possibleShutable[0])));
						this.confirmAndRollDice();
					}
					
				}, 30);
			}
		}
	};
</script>

<style scoped lang="scss">
	@import "../scss/dice";
	
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
		max-width: 800px;
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
			height: 60px;
			line-height: 60px;
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
			
			&.highlight {
				outline: 2px dashed #baf7a6;
				box-shadow: inset 0 0 13px 2px #baf7a6;
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
			font-size: 3rem;
			/*border: 1px solid #000;*/
			/*border-radius: 10%;*/
			/*line-height: 40px;*/
			/*height: 40px;*/
			/*width: 40px;*/
			/*background-color: #fff;*/
			/*color: #000;*/
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
	
	.possible-shutable {
		list-style: none;
		padding-left: 0;
		
		li span {
			&:not(:last-of-type) {
				&::after {
					content: ', '
				}
			}
		}
	}
</style>
