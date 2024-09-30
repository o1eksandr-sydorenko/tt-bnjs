<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
	<header>
		<div class="logo-title flex items-center">
			<img src="/piano.png" class="piano mx-5" />
			<h1 class="app-title pr-5">Classical Composers</h1>
		</div>
	</header>

	<RouterView/>
</template>

<style scoped lang="scss">

header {
	width: 100%;
	height: 50px;
	//background: whitesmoke;
	background-image: linear-gradient(90deg, #f5f5f5 25%, #e3e3e3 25%, #e3e3e3 50%, #f5f5f5 50%, #f5f5f5 75%, #e3e3e3 75%, #e3e3e3 100%);
	background-size: 60px 60px;

	.logo-title {
		max-width: 450px;
		height: 100%;
		.piano {
			width: 32px;
			height: 32px;
		}
	}

	.app-title {
		font-size: 2em;
		font-weight: 600;
	}
	
	.logo-title, .app-title {
		background: darken(whitesmoke, 7%);
	}
}

</style>
