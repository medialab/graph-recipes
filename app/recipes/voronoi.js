var settings = {}

// Feel free to edit following settings

// Canvas size
settings.save_at_the_end = false
settings.width =  1000
settings.height = 1000
settings.offset = 20 // Margin

// Voronoi
settings.voronoi_use_node_size = true
settings.voronoi_range = 10 // Limits cells' size
settings.voronoi_paint_distance = true

// --- (end of settings)

var i
var x
var y
var d

// Limit voronoi range
settings.voronoi_range = Math.min(settings.voronoi_range, Math.sqrt(Math.pow(settings.width, 2) + Math.pow(settings.height, 2)))

// Create the canvas
document.querySelector('#playground').innerHTML = '<div style="width:'+settings.width+'; height:'+settings.height+';"><canvas id="cnvs" width="'+settings.width+'" height="'+settings.height+'"></canvas></div>'
var canvas = document.querySelector('#cnvs')
var ctx = canvas.getContext("2d")

// Change the coordinates of the network to fit the canvas space
rescaleGraphToGraphicSpace()

// Get an index of nodes where ids are integers
var nodesIndex = g.nodes().slice(0)
nodesIndex.unshift(null) // We reserve 0 for "no closest"

// Save this "voronoi id" as a node attribute
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
  var range = settings.voronoi_range
  if (settings.voronoi_use_node_size) {
    range *= n.size
  }
  for (x = Math.max(0, Math.floor(n.x - range) ); x <= Math.min(settings.width, Math.floor(n.x + range) ); x++ ){
    for (y = Math.max(0, Math.floor(n.y - range) ); y <= Math.min(settings.height, Math.floor(n.y + range) ); y++ ){
      d = Math.sqrt(Math.pow(n.x - x, 2) + Math.pow(n.y - y, 2))
      if (d < range && n.size>0) {
        if (settings.voronoi_use_node_size) {
          d /= n.size
        }
        i = x + settings.width * y
        var existingVid = vidPixelMap[i]
        if (existingVid == 0) {
          // 0 means there is no closest node
          vidPixelMap[i] = n.vid
          dPixelMap[i] = d
        } else {
          // There is already a closest node. Edit only if we are closer.
          if (d < dPixelMap[i]) {
            vidPixelMap[i] = n.vid
            dPixelMap[i] = d
          }
        }
      }
    }
  }
})

// Paint voronoi map
var imgd = ctx.getImageData(0, 0, settings.width, settings.height)
var pix = imgd.data
var pixlen
for ( i = 0, pixlen = pix.length; i < pixlen; i += 4 ) {
  var vid = vidPixelMap[i/4]
  if (vid > 0) {
  	var color = d3.rgb(g.getNodeAttributes(nodesIndex[vid]).color || '#999')
    pix[i  ] = color.r // red
    pix[i+1] = color.g // green
    pix[i+2] = color.b // blue
    if (settings.voronoi_paint_distance) {
      pix[i+3] = Math.floor(255 - 255 * dPixelMap[i/4]/settings.voronoi_range)
    } else {
      pix[i+3] = 255 // alpha
    }
  }
}

// Finalize paint
ctx.putImageData( imgd, 0, 0 )

// Save if needed
if (settings.save_at_the_end) {
  canvas.toBlob(function(blob) {
      saveAs(blob, store.get('graphname') + "Heatmap.png");
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
