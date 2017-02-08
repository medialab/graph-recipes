/* Recipes list */
angular.module('graphrecipes.recipes_list', [])
.constant('recipesList', [
	/*{
		'name': 'Test',
		'desc': 'Hold the door, Hold door, Holdoor, Hodor',
		'file': 'test.js'
	},*/{
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
		'name': 'Pixel Image',
		'desc': 'Paint a simple pixel image that you can download.',
		'file': 'simplecanvas.js'
	}
])