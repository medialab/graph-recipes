/* Recipes list */
angular.module('graphrecipes.recipes_list', [])
.constant('recipesList', [
	{
		'name': 'Nothing, I\'m fine',
		'desc': 'An empty project, in case you are not hungry - or want to cook by yourself',
		'file': 'empty.js'
	},
	{
		'name': 'Pixel Image Starter',
		'desc': 'Simple pixel image, on site or to download (PNG).',
		'file': 'simplecanvas.js'
	},
	{
		'name': 'Vector Image Starter',
		'desc': 'Simple vector image, on site or to download (SVG).',
		'file': 'simplesvg.js'
	},
	{
		'name': 'Attributes Tapas',
		'desc': 'Discover our selection of attributes',
		'file': 'attributes.js'
	},
	{
		'name': 'Fuzzy Cluster Potatoes',
		'desc': 'Your favorite network with cluster contours "à la heatmap", with legend (PNG)',
		'file': 'fuzzyclusters.js'
	},
  {
		'name': 'Layout Speciality Gravy',
		'desc': 'Apply the chief\'s speciality ForceAtlas2 layout to your graph',
		'file': 'forceatlas2.js'
  },
  {
    'name': 'Pixel Image Spaghetti *Deluxe!*',
		'desc': 'Paint a highly configurable pixel image that you can download (PNG).',
		'file': 'deluxecanvas.js'
	},
	{
		'name': 'Vector Image Spaghetti *Deluxe!*',
		'desc': 'Paint a highly configurable vector image that you can download (SVG).',
		'file': 'deluxesvg.js'
	},
	{
		'name': 'Attributes Grand Degustation',
		'desc': 'Everything you ever wanted to know about attributes',
		'file': 'fulldiagnostic.js'
	},
	{
		'name': 'Voronoï Mushrooms',
		'desc': 'Colors according to which node is the closest (PNG)',
		'file': 'voronoi.js'
	},
	{
		'name': 'Betweenness Centrality Cake',
		'desc': 'Add that metric to your node attributes',
		'file': 'betweenness.js'
	},
	{	
		'name': 'Cloud Soufflé',
		'desc': 'Your network as light a cloud (PNG).',
		'file': 'cloud.js'
	},
	{
		'name': 'Heatmap Dessert',
		'desc': 'Paint and download a heat map of nodes (PNG)',
		'file': 'heatmap.js'
	}
])
