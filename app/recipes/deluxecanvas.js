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
settings.node_margin = 5.0 // Nodes have a free space around them. This sets the size of this free space.
settings.node_size = 0.4
settings.node_stroke_width = 1.0 // Nodes white contour
settings.node_halo_range = 15

// Nodes labels
settings.label_count = 20 // How much node labels you want to show (the biggest nodes)
settings.label_white_border_thickness = 3.0
settings.label_font_min_size = 9
settings.label_font_max_size = 24
settings.label_font_family = 'Open Sans Condensed, sans-serif'
settings.label_font_weight = 300

// Edges
settings.edge_thickness = 0.5

// --- (end of settings)

var x
var y
var i

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

// Get an index of nodes where ids are integers
var nodesIndex = g.nodes().slice(0)
nodesIndex.unshift(null) // We reserve 0 for "no closest"

// Save this "voronoi id" as a node attribute (for node halos)
nodesIndex.forEach(function(nid, vid){
  if (vid > 0) {
    var n = g.getNodeAttributes(nid)
    n.vid = vid
  }
})

// Init a pixel map of integers for voronoi ids
var vidPixelMap = new Int32Array(settings.width * settings.height)
for (i in vidPixelMap) {
  vidPixelMap[i] = 0
}

// Init a pixel map of floats for distances
var dPixelMap = new Float32Array(settings.width * settings.height)
for (i in dPixelMap) {
  dPixelMap[i] = Infinity
}

// Compute the voronoi using the pixel map
g.nodes().forEach(function(nid){
  var n = g.getNodeAttributes(nid)
  var range = n.size * settings.node_size + settings.node_halo_range
  for (x = Math.max(0, Math.floor(n.x - range) ); x <= Math.min(settings.width, Math.floor(n.x + range) ); x++ ){
    for (y = Math.max(0, Math.floor(n.y - range) ); y <= Math.min(settings.height, Math.floor(n.y + range) ); y++ ){
      var d = Math.sqrt(Math.pow(n.x - x, 2) + Math.pow(n.y - y, 2))
      if (d < range) {
        var dmod // A tweak of the voronoi: a modified distance in [0,1]
        if (d <= n.size * settings.node_size) {
          // "Inside" the node
          dmod = 0
        } else {
          // In the halo range
          dmod = (d - n.size * settings.node_size) / settings.node_halo_range
        }
        i = x + settings.width * y
        var existingVid = vidPixelMap[i]
        if (existingVid == 0) {
          // 0 means there is no closest node
          vidPixelMap[i] = n.vid
          dPixelMap[i] = dmod
        } else {
          // There is already a closest node. Edit only if we are closer.
          if (dmod < dPixelMap[i]) {
            vidPixelMap[i] = n.vid
            dPixelMap[i] = dmod
          }
        }
      }
    }
  }
})

// Convert distance map to a visually pleasant gradient
var gradient = function(d){
  return 0.5 + 0.5 * Math.cos(Math.PI - Math.pow(d, 2) * Math.PI)
}
for (i in dPixelMap) {
  dPixelMap[i] = gradient(dPixelMap[i])
}

// Draw each edge
g.edges().forEach(function(eid){
  var ns = g.getNodeAttributes(g.source(eid))
  var nt = g.getNodeAttributes(g.target(eid))
  var d = Math.sqrt(Math.pow(ns.x - nt.x, 2) + Math.pow(ns.y - nt.y, 2))
  var color = d3.color(ns.color || '#DDD')
  // Build path
  var path = []
  for (i=0; i<1; i+=1/d) {
    x = (1-i)*ns.x + i*nt.x
    y = (1-i)*ns.y + i*nt.y
    path.push([x,y])
  }
  var lastp
  path.forEach(function(p, pi){
    if (lastp) {
      var pixi = Math.floor(p[0]) + settings.width * Math.floor(p[1])
      if (vidPixelMap[pixi] == ns.vid || vidPixelMap[pixi] == nt.vid || vidPixelMap[pixi] == 0) {
        color.opacity = 1
      } else {
        color.opacity = dPixelMap[pixi]
      }
      ctx.beginPath()
      ctx.lineCap="round"
      ctx.lineJoin="round"
      ctx.strokeStyle = color.toString()
      ctx.fillStyle = 'rgba(0, 0, 0, 0)';
      ctx.lineWidth = settings.edge_thickness
      ctx.moveTo(lastp[0], lastp[1])
      ctx.lineTo(p[0], p[1])
      ctx.stroke()
      ctx.closePath()
    }
    lastp = p
  })
  
})

// Draw each node
nodesBySize.reverse() // Because we draw from background to foreground
nodesBySize.forEach(function(nid){
	var n = g.getNodeAttributes(nid)

  var color = d3.rgb(n.color)

  ctx.lineCap="round"
  ctx.lineJoin="round"

  ctx.beginPath()
  ctx.arc(n.x, n.y, settings.node_size * n.size + settings.node_stroke_width, 0, 2 * Math.PI, false)
  ctx.lineWidth = 0
  ctx.fillStyle = '#FFFFFF'
  ctx.shadowColor = 'transparent'
  ctx.fill()

  ctx.beginPath()
  ctx.arc(n.x, n.y, settings.node_size * n.size, 0, 2 * Math.PI, false)
  ctx.lineWidth = 0
  ctx.fillStyle = color.toString()
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