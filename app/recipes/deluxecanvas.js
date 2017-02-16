var settings = {}

// Feel free to edit following settings

// Canvas size
settings.save_at_the_end = false
settings.width =  1000
settings.height = 1000
settings.offset = 20 // Margin

// Zoom
settings.zoom_enabled = false // Disabled by default
settings.zoom_window_size = .4 // Unzooms if >1
settings.zoom_point = {x:0.5, y:0.5}

// Nodes
settings.node_size = 3

// Nodes labels
settings.label_count = 20 // How much node labels you want to show (the biggest nodes)
settings.label_white_border_thickness = 3.0
settings.label_font_min_size = 9
settings.label_font_max_size = 24
settings.label_font_family = 'Open Sans Condensed, sans-serif'
settings.label_font_weight = 300

// Edges
settings.edge_color = 'rgba(100, 100, 100, 0.3)'

// --- (end of settings)

// Create the canvas
document.querySelector('#playground').innerHTML = '<div style="width:'+settings.width+'; height:'+settings.height+';"><canvas id="cnvs" width="'+settings.width+'" height="'+settings.height+'"></canvas></div>'
var canvas = document.querySelector('#cnvs')
var ctx = canvas.getContext("2d")

// Change the coordinates of the network to fit the canvas space
rescaleGraphToGraphicSpace()

// Set a default color to each node (in case they have no "color" attribute)
g.nodes().forEach(function(nid){
  var n = g.getNodeAttributes(nid)
  if (n.color === undefined){
    n.color = 'rgb(100,100,100)'
  }
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

// Paint a white background
ctx.beginPath()
ctx.rect(0, 0, settings.width, settings.height)
ctx.fillStyle="white"
ctx.fill()
ctx.closePath()

// Draw each edge
g.edges().forEach(function(eid){
	var ns = g.getNodeAttributes(g.source(eid))
	var nt = g.getNodeAttributes(g.target(eid))

  ctx.beginPath()
  ctx.lineCap="round"
  ctx.lineJoin="round"
  ctx.strokeStyle = settings.edge_color
  ctx.fillStyle = 'rgba(0, 0, 0, 0)';
  ctx.lineWidth = settings.edge_thickness
  ctx.moveTo(ns.x, ns.y)
  ctx.lineTo(nt.x, nt.y)
  ctx.stroke()
  ctx.closePath()
})

// Draw each node
nodesBySize.reverse() // Because we draw from background to foreground
nodesBySize.forEach(function(nid){
	var n = g.getNodeAttributes(nid)

  ctx.lineCap="round"
  ctx.lineJoin="round"

  ctx.beginPath()
  ctx.arc(n.x, n.y, settings.node_size, 0, 2 * Math.PI, false)
  ctx.lineWidth = 0
  ctx.fillStyle = n.color
  ctx.shadowColor = 'transparent'
  ctx.fill()
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

// Draw labels
nodesBySize.forEach(function(nid){
  var n = g.getNodeAttributes(nid)

  if(n.showLabel){
    var color = d3.rgb(n.color)
    var fontSize = Math.floor(settings.label_font_min_size + (n.size - label_nodeSizeExtent[0]) * (settings.label_font_max_size - settings.label_font_min_size) / (label_nodeSizeExtent[1] - label_nodeSizeExtent[0]))

    // Then, draw the label only if wanted
    var labelCoordinates = {
      x: n.x + 0.5 * settings.label_white_border_thickness + settings.node_size * n.size,
      y: n.y + 0.32 * fontSize
    }

    var label = n.label.replace(/^https*:\/\/(www\.)*/gi, '')

    ctx.font = settings.label_font_weight + " " + fontSize+"px "+settings.label_font_family
    ctx.lineWidth = settings.label_white_border_thickness
    ctx.fillStyle = '#FFFFFF'
    ctx.strokeStyle = '#FFFFFF'
    ctx.fillText(
      label
    , labelCoordinates.x
    , labelCoordinates.y
    )
    ctx.strokeText(
      label
    , labelCoordinates.x
    , labelCoordinates.y
    )
    ctx.lineWidth = 0
    ctx.fillStyle = color.toString()
    ctx.fillText(
      label
    , labelCoordinates.x
    , labelCoordinates.y
    )
  }
  
})

// Save if needed
if (settings.save_at_the_end) {
  canvas.toBlob(function(blob) {
      saveAs(blob, store.get('graphname') + ".png");
  });
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