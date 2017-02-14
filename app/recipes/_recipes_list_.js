/* Recipes list */
angular.module('graphrecipes.recipes_list', [])
.constant('recipesList', [
	{
		'name': 'Nothing, I\'m fine',
		'desc': 'An empty project, in case you are not hungry - or want to cook by yourself',
		'file': 'empty.js'
	},{
		'name': 'Betweenness Centrality',
		'desc': 'Compute that centrality measure',
		'file': 'betweenness.js'
	},
	{
		'name': 'All of the attributes',
		'desc': 'Look at them, all of them.',
		'file': 'attributes.js'
	},
	{
		'name': 'Pixel Image (simple)',
		'desc': 'Paint a simple pixel image that you can download.',
		'file': 'simplecanvas.js'
	},
	{
		'name': 'Vector Image (simple)',
		'desc': 'Paint a simple vector image that you can download (SVG).',
		'file': 'simplesvg.js'
	},
	{
		'name': 'Vector Image *Deluxe!*',
		'desc': 'Paint a highly configurable vector image that you can download (SVG).',
		'file': 'deluxesvg.js'
	}
])