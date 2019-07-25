/* Recipes list */
angular.module('graphrecipes.recipes_list', [])
.constant('recipesList', [
	{
		'name': 'Prepare',
		'desc': 'Explore attributes, and get the JSON of clusters and colors',
		'file': 'Prepare 1.0.0.js'
	},
	{
		'name': 'Make a Map',
		'desc': 'Simple rendering of nodes and edges (1 megapixel).',
		'file': 'Make a map 1.0.0.js'
	},
	{
		'name': 'Make a Map (settings: clusters)',
		'desc': 'Rendering of nodes and clusters (1 megapixels)',
		'file': 'Make a map 1.0.0 - Clusters.js'
	},
	{
		'name': 'Make a Map (settings: high resolution)',
		'desc': 'Produces a high quality, 64 megapixel rendering of nodes and edges.',
		'file': 'Make a map 1.0.0 - HR.js'
	},
	{
		'name': 'Highlight Modality',
		'desc': 'Highlights one or more modalities, and mutes or hides the rest.',
		'file': 'Highlight a modality 1.0.0.js'
	},
	{
		'name': 'Orientation Mini-map',
		'desc': 'A mini-map with highlighted modalities. For integration within maps.',
		'file': 'Orientation mini map 1.0.0.js'
	},
	{
		'name': 'Get Top Nodes',
		'desc': 'Generate a list of nodes to highlight. Edit this code to fit your needs.',
		'file': 'Get top nodes 1.0.0.js'
	},
	{
		'name': 'Highlight Nodes',
		'desc': 'Highlights a list of nodes with thick black lines.',
		'file': 'Highlight nodes 1.0.0.js'
	},
  {
		'name': '(empty script)',
		'desc': 'Copy-paste your own script here.',
		'file': 'empty.js'
  }
])
