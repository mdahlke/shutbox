<template>
	<div id="app">
		<nav class="app-nav">
			<router-link to="/" exact-active-class="active">Game</router-link>
			<router-link to="/stats" exact-active-class="active">Stats</router-link>
		</nav>
		<router-view />
	</div>
</template>

<style lang="scss">
	html {
		min-height: 100vh;
		background: rgba(172, 182, 193, 0.58);
	}

	#app {
		font-family: 'Avenir', Helvetica, Arial, sans-serif;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		text-align: center;
		color: #2c3e50;
	}

	.app-nav {
		display: flex;
		justify-content: center;
		gap: 4px;
		padding: 12px 16px;
		background: #2c3e50;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);

		a {
			color: rgba(255, 255, 255, 0.7);
			text-decoration: none;
			font-weight: 600;
			font-size: 15px;
			padding: 6px 20px;
			border-radius: 4px;
			transition: background 0.15s, color 0.15s;

			&:hover {
				background: rgba(255, 255, 255, 0.1);
				color: #fff;
			}

			&.active {
				background: rgba(255, 255, 255, 0.15);
				color: #fff;
			}
		}
	}
</style>
