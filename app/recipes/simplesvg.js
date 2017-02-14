var settings = {}

// Feel free to edit following settings

// General
settings.width = 1000
settings.height = 1000
settings.offset = 20 // Margin

// Nodes
settings.node_size = 0.4

// Nodes labels
settings.label_white_border_thickness = 3.0
settings.label_font_size = 12
settings.label_font_family = 'Open Sans Condensed, sans-serif'

// Edges
settings.edge_thickness = 1.0

// --- (end of settings)

// Create the svg space
var svgContainer = d3.select("#playground").append('div')
	.attr('style', 'width: '+settings.width+'px; height:'+settings.height+'px')
var svg = svgContainer.append("svg")
	.attr('width', settings.width)
	.attr('height', settings.height)

// Change the coordinates of the network to fit the SVG space
rescaleGraphToGraphicSpace()

// Set a default color to each node (in case they have no "color" attribute)
g.nodes().forEach(function(nid){
	var n = g.getNodeAttributes(nid)
	if (n.color === undefined){
		n.color = 'rgb(200,200,200)'
	}
})

// Draw edges
g.edges().forEach(function(eid){
	var e = g.getEdgeAttributes(eid)
	var ns = g.getNodeAttributes(g.source(eid))
	var nt = g.getNodeAttributes(g.target(eid))

	// Set edge width
	var edgeWidth = (e.weight || 1) * settings.edge_thickness
	
	// White background
	drawEdge({
		source: ns
	, target: nt
	, width: edgeWidth
	, style: {
			fill: '#FFF'
		, stroke: '#FFF'
		, 'stroke-width': settings.edge_stroke_width
		}
	})

	// Actual edge
	drawEdge({
		source: ns
	, target: nt
	, width: edgeWidth
	, style: {
			fill: '#DDD'
		, stroke: '#DDD'
		, 'stroke-width': settings.edge_stroke_width
		}
	})
	
})

// Draw the nodes
g.nodes().forEach(function(nid){
	var n = g.getNodeAttributes(nid)

	var color = d3.rgb(n.color)
	
	var circle = d3.path()
	circle.arc(
		n.x
	,	n.y
	,	settings.node_size * n.size
	, 0
	, Math.PI * 2
	)

	svg.append("path")
		.attr('d', circle.toString())
		.attr('fill', color.toString())

})

// Draw labels
g.nodes().forEach(function(nid){
	var n = g.getNodeAttributes(nid)

	var color = d3.rgb(n.color)

	var labelCoordinates = {
		x: n.x + settings.node_size * n.size * 1.2,
		y: n.y + 0.32 * settings.label_font_size
	}

	// Label's White border
	svg.append('text')
		.attr('x', labelCoordinates.x)
		.attr('y', labelCoordinates.y)
		.text(n.label)
		.attr('font-family', settings.label_font_family)
		.attr('text-anchor', 'start')
		.attr('font-size', settings.label_font_size)
		.attr('stroke-width', settings.label_white_border_thickness)
		.attr('stroke', '#FFFFFF')
		.attr('fill', 'none')

	// Label itself
	svg.append('text')
		.attr('x', labelCoordinates.x)
		.attr('y', labelCoordinates.y)
		.text(n.label)
		.attr('font-family', settings.label_font_family)
		.attr('text-anchor', 'start')
		.attr('font-size', settings.label_font_size)
		.attr('fill', color)
	
});

function drawEdge(s /*settings*/){

	if (
			s.source === undefined
	||	s.target === undefined
	) {
		console.error('Cannot draw edge without a source and target', s)
	}

	s.width = s.width || 1

	s.style = s.style || {fill:'#EEE', stroke:'#EEE', 'stroke-width': settings.edge_thickness}

	// Draw edge

	var edgePath = d3.path()
	edgePath.moveTo(s.source.x,	s.source.y)
	edgePath.lineTo(s.target.x,	s.target.y)

	var edgePathElement = svg.append("path")
		.attr('d', edgePath.toString())
	
	var k
	for (k in s.style) {
		edgePathElement.attr(k, s.style[k])
	}
}

// ---
// Functions

function rescaleGraphToGraphicSpace() {

  // General barycenter resize
  var xbarycenter = 0
  var ybarycenter = 0
  var wtotal = 0
  var dx
  var dy
  var ratio

  g.nodes().forEach(function(nid){
  	var n = g.getNodeAttributes(nid)
    // We use node size as weight (default to 1)
    n.size = n.size || 1
    xbarycenter += n.size * n.x
    ybarycenter += n.size * n.y
    wtotal += n.size
  })
  xbarycenter /= wtotal
  ybarycenter /= wtotal

  var dmax = 0 // Maximal distance from barycenter
  g.nodes().forEach(function(nid){
  	var n = g.getNodeAttributes(nid)
    var d = Math.sqrt( Math.pow(n.x - xbarycenter, 2) + Math.pow(n.y - xbarycenter, 2) )
    dmax = Math.max(dmax, d)
  })

  ratio = ( Math.min(settings.width, settings.height) - 2 * settings.offset ) / (2 * dmax)

  g.nodes().forEach(function(nid){
  	var n = g.getNodeAttributes(nid)
    n.x = settings.width / 2 + (n.x - xbarycenter) * ratio
    n.y = settings.height / 2 + (n.y - ybarycenter) * ratio
    n.size *= ratio
  })

}