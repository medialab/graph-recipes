var settings = {}

// Feel free to edit following settings

// General
settings.save_at_the_end = false
settings.width = 1000
settings.height = 1000
settings.offset = 20 // Margin

// Zoom
settings.zoom_enabled = false // Disabled by default
settings.zoom_window_size = .4 // Unzooms if >1
settings.zoom_point = {x:0.5, y:0.5}

// Nodes
settings.node_margin = 5.0 // Nodes have a free space around them. This sets the size of this free space.
settings.node_size = 0.4
settings.node_stroke_width = 0.5 // Nodes white contour

// Nodes labels
settings.label_count = 20 // How much node labels you want to show (the biggest)
settings.label_white_border_thickness = 3.0
settings.label_font_min_size = 9
settings.label_font_max_size = 24
settings.label_font_family = 'Open Sans Condensed, sans-serif'

// Edges
settings.hide_edges_under_weight = 0.0
settings.edge_weight_to_width = 1.5 // Useful to weighted edges
settings.edge_stroke_width = 0.5 // Edges white background

// Other
settings.color_lightening = 4 // Color lightening

// --- (end of settings)

// Create the svg space
var svgContainer = d3.select("#playground").append('div')
	.attr('style', 'width: '+settings.width+'px; height:'+settings.height+'px')
var svg = svgContainer.append("svg")
	.attr('width', settings.width)
	.attr('height', settings.height)

// Fix missing coordinates and/or colors
addMissingVisualizationData()

// Change the coordinates of the network to fit the SVG space
rescaleGraphToGraphicSpace()

// Set a default color to each node (in case they have no "color" attribute)
g.nodes().forEach(function(nid){
	var n = g.getNodeAttributes(nid)
	if (n.color === undefined){
		n.color = 'rgb(100,100,100)'
	}
})

// Draw edges
g.edges().forEach(function(eid){
	var e = g.getEdgeAttributes(eid)
	var ns = g.getNodeAttributes(g.source(eid))
	var nt = g.getNodeAttributes(g.target(eid))

	// Set the color depending on the source node.
	var color = d3.rgb(ns.color)

	// Set edge width
	var edgeWidth = (e.weight || 1) * settings.edge_weight_to_width
	
	// Modify this color to a lighter version
	var lighterColor = d3.rgb(lightenChannel(color.r), lightenChannel(color.g), lightenChannel(color.b))
	
	// White background
	drawEdge({
		source: ns
	, target: nt
	, color: color.toString()
	, lighterColor: lighterColor.toString()
	, width: edgeWidth
	, backgroundStyle: {
			fill: '#FFF'
		, stroke: '#FFF'
		, 'stroke-width': settings.edge_stroke_width
		}
	, backgroundOnly: true
	})

	// Actual edge
	drawEdge({
		source: ns
	, target: nt
	, color: color.toString()
	, lighterColor: lighterColor.toString()
	, width: edgeWidth
	, backgroundStyle: {
			fill: lighterColor.toString()
		, stroke: 'none'
		}
	, centralLineStyle: {
			fill: 'none'
		, stroke: color.toString()
		, 'stroke-width': settings.edge_stroke_width
		}
	})
	
})

// Draw free space around each node (we just draw white circles, assuming the background is white).
g.nodes().forEach(function(nid){
	var n = g.getNodeAttributes(nid)

	var circleSettings = [
		{opacity:0.5, r:1.00},
		{opacity:0.5, r:0.80},
		{opacity:0.5, r:0.65},
		{opacity:1.0, r:0.55}
	]
	circleSettings.forEach(function(cs){
		var circle = d3.path()
		circle.arc(
			n.x
		,	n.y
		,	settings.node_size * n.size + settings.node_margin * cs.r // size
		, 0
		, Math.PI * 2
		)

		svg.append("path")
			.attr('d', circle.toString())
			.attr('fill', '#FFFFFF')
			.attr('fill-opacity', cs.opacity)
	})

})

// Let's draw every edge START + END
g.edges().forEach(function(eid){
	var e = g.getEdgeAttributes(eid)
	var ns = g.getNodeAttributes(g.source(eid))
	var nt = g.getNodeAttributes(g.target(eid))
	
	// Set the color depending on the source node.
	var color = d3.rgb(ns.color)

	// Set edge width
	var edgeWidth = (e.weight || 1) * settings.edge_weight_to_width
	
	// Modify this color to a lighter version
	var lighterColor = d3.rgb(lightenChannel(color.r), lightenChannel(color.g), lightenChannel(color.b))
	
	drawEdge({
		source: ns
	, target: nt
	, color: color.toString()
	, lighterColor: lighterColor.toString()
	, width: edgeWidth
	, startOnly: true
	, backgroundStyle: {
			fill: lighterColor.toString()
		, stroke: 'none'
		}
	, centralLineStyle: {
			fill: 'none'
		, stroke: color
		, 'stroke-width': settings.edge_stroke_width
		}
	})

	drawEdge({
		source: ns
	, target: nt
	, color: color.toString()
	, lighterColor: lighterColor.toString()
	, width: edgeWidth
	, endOnly: true
	, backgroundStyle: {
			fill: lighterColor.toString()
		, stroke: 'none'
		}
	, centralLineStyle: {
			fill: 'none'
		, stroke: color.toString()
		, 'stroke-width': settings.edge_stroke_width
		}
	})
	
})


// Tell which nodes' label to show
var nodesBySize = g.nodes().slice(0)
// We sort nodes by 1) size and 2) left to right
nodesBySize.sort(function(naid, nbid){
	var na = g.getNodeAttributes(naid)
	var nb = g.getNodeAttributes(nbid)
	if ( na.size < nb.size ) {
		return 1
	} else if ( na.size > nb.size ) {
		return -1
	} else if ( na.x < nb.x ) {
		return 1
	} else if ( na.x > nb.x ) {
		return -1
	}
	return 0
})
nodesBySize.forEach(function(nid, i){
	var n = g.getNodeAttributes(nid)
	n.showLabel = i < settings.label_count;
})

// Draw the nodes
nodesBySize.reverse() // Because we draw from background to foreground
nodesBySize.forEach(function(nid){
	var n = g.getNodeAttributes(nid)

	var color = d3.rgb(n.color)
	var lighterColor = d3.rgb(lightenChannel(color.r), lightenChannel(color.g), lightenChannel(color.b))
	
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
		.attr('stroke', '#FFF')
		.attr('stroke-width', settings.node_stroke_width)

})

// Compute formula for labels
var label_nodeSizeExtent = d3.extent(
	nodesBySize.map(function(nid){
		return g.getNodeAttributes(nid)
	}).filter(function(n){
		return n.showLabel
	}).map(function(n){
		return n.size
	})
)
if (label_nodeSizeExtent[0] == label_nodeSizeExtent[1]) {label_nodeSizeExtent[0] *= 0.9}

// Draw labels
nodesBySize.forEach(function(nid){
	var n = g.getNodeAttributes(nid)

	if(n.showLabel){
		var color = d3.rgb(n.color)
		var fontSize = settings.label_font_min_size + (n.size - label_nodeSizeExtent[0]) * (settings.label_font_max_size - settings.label_font_min_size) / (label_nodeSizeExtent[1] - label_nodeSizeExtent[0])

		// Then, draw the label only if wanted
		var labelCoordinates = {
			x: n.x + 0.5 * settings.label_white_border_thickness + settings.node_size * n.size,
			y: n.y + 0.32 * fontSize
		}

		var label = n.label.replace(/^https*:\/\/(www\.)*/gi, '')

		// Label's White border
		svg.append('text')
			.attr('x', labelCoordinates.x)
			.attr('y', labelCoordinates.y)
			.text(label)
			.attr('font-family', settings.label_font_family)
			.attr('text-anchor', 'start')
			.attr('font-size', fontSize)
			.attr('stroke-width', settings.label_white_border_thickness)
			.attr('stroke', '#FFFFFF')
			.attr('fill', 'none')

		// Label itself
		svg.append('text')
			.attr('x', labelCoordinates.x)
			.attr('y', labelCoordinates.y)
			.text(label)
			.attr('font-family', settings.label_font_family)
			.attr('text-anchor', 'start')
			.attr('font-size', fontSize)
			.attr('fill', color)
	}
	
})

// Save if needed
if (settings.save_at_the_end) {
	saveSVG()
}

// ---
// Functions

function saveSVG() {
	// Download SVG
	var svgFileContent = []
	svgFileContent.push('<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="'+settings.width+'" height="'+settings.height+'" viewBox="0 0 '+settings.width+' '+settings.height+'">')
	svgFileContent.push(svg.html())
	svgFileContent.push('</svg>')

	var blob = new Blob(svgFileContent, {type: "image/svg+xml;charset=utf-8"})
	saveAs(blob, store.get('graphname') + ".svg")
}

function drawEdge(s /*settings*/){

	if (
			s.source === undefined
	||	s.target === undefined
	) {
		console.error('Cannot draw edge without a source and target', s)
	}

	s.width = s.width || 1

	s.startOnly = s.startOnly || false
	s.endOnly = s.endOnly || false
	s.backgroundOnly = s.backgroundOnly || false

	s.backgroundStyle = s.backgroundStyle || {fill:'#EEE'}
	s.centralLineStyle = s.centralLineStyle || {fill:'none', stroke:'#666', 'stroke-width': settings.edge_stroke_width}

	// Edge draw engine

	var angle = Math.atan2( s.target.y - s.source.y, s.target.x - s.source.x )
	var distance = Math.sqrt( ( s.source.x - s.target.x ) * ( s.source.x - s.target.x ) + ( s.source.y - s.target.y ) * ( s.source.y - s.target.y ) )
	var offset = 1 + 0.8 * Math.sqrt(distance)
	var ticks = computeTicks()
	var reverseTicks = ticks.slice(0).reverse()
	var k

	if (distance > 0) {

		// 1: draw edge background
		var backgroundPath = d3.path()
		backgroundPath.moveTo(
			s.source.x + ( Math.cos(angle) * ticks[0] ) + ( Math.cos( angle + Math.PI/2 ) * centralLineCurve(ticks[0]) )
		,	s.source.y + ( Math.sin(angle) * ticks[0] ) + ( Math.sin( angle + Math.PI/2 ) * centralLineCurve(ticks[0]) )
		)
		ticks.forEach(function(t){
			backgroundPath.lineTo(
				s.source.x + ( Math.cos(angle) * t ) + ( Math.cos( angle + Math.PI/2 ) * ( centralLineCurve(t) - upperThicknessCurve(t) ) )
			,	s.source.y + ( Math.sin(angle) * t ) + ( Math.sin( angle + Math.PI/2 ) * ( centralLineCurve(t) - upperThicknessCurve(t) ) )
			)
		})
		reverseTicks.forEach(function(t){
			backgroundPath.lineTo(
				s.source.x + ( Math.cos(angle) * t ) + ( Math.cos( angle + Math.PI/2 ) * ( centralLineCurve(t) - lowerThicknessCurve(t) ) )
			,	s.source.y + ( Math.sin(angle) * t ) + ( Math.sin( angle + Math.PI/2 ) * ( centralLineCurve(t) - lowerThicknessCurve(t) ) )
			)
		})
	
		var backgroundPathElement = svg.append("path")
			.attr('d', backgroundPath.toString())
		for (k in s.backgroundStyle) {
			backgroundPathElement.attr(k, s.backgroundStyle[k])
		}

		// 2: draw edge central line
		if(!s.backgroundOnly){
			var centralPath = d3.path()
			centralPath.moveTo(
				s.source.x + ( Math.cos(angle) * ticks[0] ) + ( Math.cos( angle + Math.PI/2 ) * centralLineCurve(ticks[0]) )
			,	s.source.y + ( Math.sin(angle) * ticks[0] ) + ( Math.sin( angle + Math.PI/2 ) * centralLineCurve(ticks[0]) )
			)
			ticks.forEach(function(t){
				centralPath.lineTo(
					s.source.x + ( Math.cos(angle) * t ) + ( Math.cos( angle + Math.PI/2 ) * centralLineCurve(t) )
				,	s.source.y + ( Math.sin(angle) * t ) + ( Math.sin( angle + Math.PI/2 ) * centralLineCurve(t) )
				)
			})
			
			var centralPathElement = svg.append("path")
				.attr('d', centralPath.toString())
			for (k in s.centralLineStyle) {
				centralPathElement.attr(k, s.centralLineStyle[k])
			}
		}
	}

	function centralLineCurve(X){
		// Parabolic curve with given offset at center
		var a = 0
			, c = 4 * offset / ( distance * distance )
			, b = - c * distance

		return a + b * X + c * X * X
	}

	function upperThicknessCurve(X){

		// IdeaY is the desired edge with
		var idealY
		if ( s.width > 1.6 * offset ) {
			idealY = s.width - 0.8 * offset
		} else {
			idealY = s.width * 0.5
		}

		// Returning idealY would make a simple thick line.
		// However we want to smooth it at both ends.
		return featherShape(idealY, X)

	}

	function lowerThicknessCurve(X){

		// IdeaY is the desired edge with
		var idealY
		if ( s.width > 1.6 * offset ) {
			idealY = - 0.8 * offset
		} else {
			idealY = -s.width * 0.5
		}

		// Returning idealY would make a simple thick line.
		// However we want to smooth it at both ends.
		return featherShape(idealY, X)
	}

	// Transition stages are the basic structure of the feather shape
	function getTransitionStages(){
		var ns = {}

		ns.startFirstTransition = 0
		ns.endFirstTransition = ns.startFirstTransition + 15 + 0.1 * s.width
		ns.startLastTransition = 0.3 * ( distance - settings.node_size * s.source.size - settings.node_size * s.target.size )
		ns.endLastTransition = distance - settings.node_size * s.target.size

		// Edge case
		if ( ns.endFirstTransition >= ns.startLastTransition ) {
			ns.endFirstTransition = 0.3 * ( distance - settings.node_size * s.source.size - settings.node_size * s.target.size )
			ns.startLastTransition = 0.3 * ( distance - settings.node_size * s.source.size - settings.node_size * s.target.size )
		}

		return ns
	}

	function featherShape(targetY, X){
		var ts = getTransitionStages()

		if ( X <= ts.startFirstTransition ) {
			return 0
		
		} else if ( X <= ts.endFirstTransition ) {
			var x = ( X - ts.startFirstTransition ) / ( ts.endFirstTransition - ts.startFirstTransition )
			return targetY * Math.sqrt( 1 - ( 1 - x ) * ( 1 - x ) * ( 1 - x ) )
		
		} else if ( X <= ts.startLastTransition ) {
			return targetY
		
		} else if ( X <= ts.endLastTransition ) {
			// cubic interpolation
			var x = ( X - ts.startLastTransition ) / ( ts.endLastTransition - ts.startLastTransition )
				, y0 = targetY
				, y1 = 0
				, tan0 = 0
				, tan1 = - Math.sign(targetY) * 2
				, a = 2 * y0 - 2 * y1 + tan0 + tan1
				, b = -3 * y0 + 3 * y1 - 2 * tan0 - tan1
				, c = tan0
				, d = y0
			return a * x*x*x + b * x*x + c*x + d
		
		} else {
			return 0
		
		}
	}

	function computeTicks(){
		var ts = getTransitionStages()

		if ( s.endOnly ) {

			return interpolateValues( distance - Math.min(settings.node_size * s.source.size + 1.1 * settings.node_margin, distance), distance, 12)
		
		} else if ( s.startOnly ) {

			return interpolateValues( 0, Math.min(settings.node_size * s.source.size + 1.1 * settings.node_margin, distance), 12)
		
		} else {

			return interpolateValues(0, ts.startFirstTransition, 3)
				.concat( interpolateValues(ts.startFirstTransition, ts.endFirstTransition, 18, true) )
				.concat( interpolateValues(ts.endFirstTransition, ts.startLastTransition, Math.ceil( ( ts.startLastTransition - ts.endFirstTransition ) / 20 ), true) )
				.concat( interpolateValues(ts.startLastTransition, ts.endLastTransition, 12, true) )
	
		}

		return result

		function interpolateValues(min, max, intervalsCount, omitFirst, omitLast){
			var range = []
			for(var i = 0; i <= intervalsCount; i++){
				range.push( min + (max - min) * i / intervalsCount )
			}
			
			if ( omitFirst ) {
				range.shift()
			}

			if ( omitLast ) {
				range.pop()
			}

			return range
		}

	}
}

function lightenChannel(r){
	return Math.floor(255 - ((255-r) / settings.color_lightening))
}

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

  // Initial resize
  g.nodes().forEach(function(nid){
  	var n = g.getNodeAttributes(nid)
    n.x = settings.width / 2 + (n.x - xbarycenter) * ratio
    n.y = settings.height / 2 + (n.y - ybarycenter) * ratio
    n.size *= ratio
  })

  // Additionnal zoom resize
  if (settings.zoom_enabled) {
    xbarycenter = settings.zoom_point.x * settings.width// - settings.width / 2
    ybarycenter = settings.zoom_point.y * settings.height// - settings.height / 2
    ratio = 1/settings.zoom_window_size

    g.nodes().forEach(function(nid){
  		var n = g.getNodeAttributes(nid)
      n.x = settings.width / 2 + (n.x - xbarycenter) * ratio
      n.y = settings.height / 2 + (n.y - ybarycenter) * ratio
      n.size *= ratio
    })
  }
}

function addMissingVisualizationData() {
  var colorIssues = 0
  var coordinateIssues = 0
  g.nodes().forEach(function(nid){
    var n = g.getNodeAttributes(nid)
    if (!isNumeric(n.x) || !isNumeric(n.y)) {
      var c = getRandomCoordinates()
      n.x = c[0]
      n.y = c[1]
      coordinateIssues++
    }
    if (!isNumeric(n.size)) {
      n.size = 1
    }
    if (n.color == undefined) {
      n.color = '#665'
      colorIssues++
    }
  })

  if (coordinateIssues > 0) {
    alert('Note: '+coordinateIssues+' nodes had coordinate issues. We carelessly fixed them.')
  }

  function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n)
  }
  
  function getRandomCoordinates() {
    var candidates
    var d2 = Infinity
    while (d2 > 1) {
      candidates = [2 * Math.random() - 1, 2 * Math.random() - 1]
      d2 = candidates[0] * candidates[0] + candidates[1] * candidates[1]
    }
    var heuristicRatio = 5 * Math.sqrt(g.order)
    return candidates.map(function(d){return d * heuristicRatio})
  }
}