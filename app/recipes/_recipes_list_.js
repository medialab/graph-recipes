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
		'desc': 'Paint a simple pixel image that you can download (PNG).',
		'file': 'simplecanvas.js'
	},
	{
		'name': 'Vector Image (simple)',
		'desc': 'Paint a simple vector image that you can download (SVG).',
		'file': 'simplesvg.js'
	},
	{
		'name': 'Pixel Image *Deluxe!*',
		'desc': 'Paint a highly configurable pixel image that you can download (PNG).',
		'file': 'deluxecanvas.js'
	},
	{
		'name': 'Vector Image *Deluxe!*',
		'desc': 'Paint a highly configurable vector image that you can download (SVG).',
		'file': 'deluxesvg.js'
	},
	{
		'name': 'Heatmap',
		'desc': 'Paint and download a heat map of nodes (PNG)',
		'file': 'heatmap.js'
	},
	{
		'name': 'Voronoi',
		'desc': 'Draw areas according to which node is the closest (PNG)',
		'file': 'voronoi.js'
	},
	{
		'name': 'Fuzzy cluster contours',
		'desc': 'Paint and download a network with cluster contours "à la heatmap" (PNG)',
		'file': 'fuzzyclusters.js'
	}
])