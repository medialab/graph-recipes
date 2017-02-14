var settings = {}

// Feel free to edit following settings

// Canvas size
settings.width =  1000
settings.height = 1000
settings.offset = 20 // Margin

// Zoom
settings.zoom_enabled = false // Disabled by default
settings.zoom_window_size = .4 // Unzooms if >1
settings.zoom_point = {x:0.5, y:0.5}

// Drawing nodes, labels and edges
settings.display_label = true
settings.node_size = 3
settings.font_size = 14
settings.font_family = 'Open Sans Condensed, sans-serif'
settings.font_weight = 300
settings.edge_color = 'rgba(200, 200, 200, 0.3)'

// Download image at the end?
settings.save_at_the_end = true

// --- (end of settings)

// Create the canvas
document.querySelector('#playground').innerHTML = '<div style="width:'+settings.width+'; height:'+settings.height+';"><canvas id="cnvs" width="'+settings.width+'" height="'+settings.height+'"></canvas></div>'
var canvas = document.querySelector('#cnvs')
var ctx = canvas.getContext("2d")

// Change the coordinates of the network to fit the canvas space
rescaleGraphToGraphicSpace()

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
g.nodes().forEach(function(nid){
	var n = g.getNodeAttributes(nid)

  ctx.lineCap="round"
  ctx.lineJoin="round"

  if (settings.display_label) {
    ctx.font = settings.font_weight + " " + settings.font_size+"px "+settings.font_family;
    ctx.lineWidth = 4
    ctx.fillStyle = '#FFFFFF'
    ctx.strokeStyle = '#FFFFFF'
    ctx.fillText(
      n.label
    , n.x + settings.node_size * 1.4
    , n.y + 0.3 * settings.font_size
    )
    ctx.strokeText(
      n.label
    , n.x + settings.node_size * 1.4
    , n.y + 0.3 * settings.font_size
    )
    ctx.lineWidth = 0
    ctx.fillStyle = n.color
    ctx.fillText(
      n.label
    , n.x + settings.node_size * 1.4
    , n.y + 0.3 * settings.font_size
    )
  }

  ctx.beginPath()
  ctx.arc(n.x, n.y, settings.node_size, 0, 2 * Math.PI, false)
  ctx.lineWidth = 0
  ctx.fillStyle = n.color
  ctx.shadowColor = 'transparent'
  ctx.fill()
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