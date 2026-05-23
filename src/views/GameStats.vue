<template>
	<section id="game-board">
        <h1>Game Stats</h1>
        {{ gameStats  }}
	</section>

</template>

<script>
	import {mapState, mapGetters, mapMutations, mapActions} from 'vuex';
	
	export default {
		name: 'GameStats',
		data() {
			return {
                
			};
		},
		computed: {
			...mapGetters({
				gameStats: 'getGameStats',
			}),
		},
		created() {
		},
		methods: {
		}
	};
</script>

<style scoped lang="scss">
	
</style>
