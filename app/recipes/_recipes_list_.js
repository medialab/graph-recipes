/* Recipes list */
angular.module('graphrecipes.recipes_list', [])
.constant('recipesList', [
	{
		'name': 'PREPARE',
		'desc': 'Explore attributes, and get the JSON of clusters and colors',
		'file': 'Prepare 1.0.0.js'
	},
	{
		'name': 'MAKE A MAP',
		'desc': 'Simple rendering of nodes and edges (1 megapixel).',
		'file': 'Make a map 1.0.0.js'
	},
	{
		'name': 'MAKE A MAP (settings: clusters)',
		'desc': 'Rendering of nodes and clusters (1 megapixels)',
		'file': 'Make a map 1.0.0 - Clusters.js'
	},
	{
		'name': 'MAKE A MAP (settings: high resolution)',
		'desc': 'Produces a high quality, 64 megapixel rendering of nodes and edges.',
		'file': 'Make a map 1.0.0 - HR.js'
	},
	{
		'name': 'HIGHLIGHT MODALITY',
		'desc': 'Highlights one or more modalities, and mutes or hides the rest.',
		'file': 'Highlight a modality 1.0.0.js'
	},
	{
		'name': 'Orientation mini map',
		'desc': 'TO DO',
		'file': 'Orientation mini map.js'
	},
	{
		'name': 'Get top nodes',
		'desc': 'TO DO',
		'file': 'Get top nodes.js'
	},
	{
		'name': 'Highlight nodes',
		'desc': 'TO DO',
		'file': 'Highlight nodes.js'
	},
  {
		'name': 'Empty script',
		'desc': 'Copy-paste your script here',
		'file': 'empty.js'
  }
])
