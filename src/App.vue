<template>
	<div id="app">
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
	
	#nav {
		padding: 30px;
		
		a {
			font-weight: bold;
			color: #2c3e50;
			
			&.router-link-exact-active {
				color: #42b983;
			}
		}
	}
</style>
