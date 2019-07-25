/* Recipes list */
angular.module('graphrecipes.recipes_list', [])
.constant('recipesList', [
	{
		'name': 'PREPARE',
		'desc': 'Explore attributes, and get the JSON of clusters and colors',
		'file': 'Prepare 1.0.0.js'
	},
	{
		'name': 'MAKE A MAP (settings: low resolution)',
		'desc': 'Simple rendering of nodes and edges',
		'file': 'Make a map 1.0.0.js'
	},
	{
		'name': 'MAKE A MAP (settings: clusters)',
		'desc': 'Rendering of clusters',
		'file': 'Make a map 1.0.0 - Clusters.js'
	},
	{
		'name': 'MAKE A MAP (settings: high resolution)',
		'desc': 'These settings produce a high quality, 64 megapixel rendering.',
		'file': 'Make a map 1.0.0 - HR.js'
	},
	{
		'name': 'Highlight a modality',
		'desc': 'TO DO',
		'file': 'Highlight a modality.js'
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
