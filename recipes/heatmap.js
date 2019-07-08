var settings = {}

// Feel free to edit following settings

// Canvas size
settings.save_at_the_end = false
settings.width =  1000
settings.height = 1000
settings.offset = 20 // Margin

// Heatmap
settings.spreading = 100.0 // Pixel diameter of each nodes' "heat" area
settings.quantize = true // Disable for a continuous scale
settings.quantization_colors = 5
settings.color_scale = 'interpolateViridis'
// We user d3 color scales. The different options are:
//   interpolateViridis, interpolateInferno, interpolateMagma, interpolatePlasma
//   interpolateWarm, interpolateCool, interpolateRainbow, interpolateCubehelixDefault


// --- (end of settings)

// Create the canvas
document.querySelector('#playground').innerHTML = '<div style="width:'+settings.width+'; height:'+settings.height+';"><canvas id="cnvs" width="'+settings.width+'" height="'+settings.height+'"></canvas></div>'
var canvas = document.querySelector('#cnvs')
var ctx = canvas.getContext("2d")

// Fix missing coordinates and/or colors
addMissingVisualizationData()

// Change the coordinates of the network to fit the canvas space
rescaleGraphToGraphicSpace()

// Compute heatmap values
var pixelValues = new Float32Array(settings.width * settings.height)
var i
var x
var y
var n
var d
var value

// Init pixel
for (i in pixelValues) {
	pixelValues[i] = 0	
}

// Values from nodes
g.nodes().forEach(function(nid){
	n = g.getNodeAttributes(nid)
	for (x = Math.max(0, Math.floor(n.x - settings.spreading/2) ); x <= Math.min(settings.width, Math.floor(n.x + settings.spreading/2) ); x++ ){
		for (y = Math.max(0, Math.floor(n.y - settings.spreading/2) ); y <= Math.min(settings.height, Math.floor(n.y + settings.spreading/2) ); y++ ){
			d = Math.sqrt(Math.pow(n.x - x, 2) + Math.pow(n.y - y, 2))
			if (d < settings.spreading / 2) {
				// Compute value: d=0 -> 1, d=spreading/2 -> 
				value = n.size * (1 - 2 * d / settings.spreading)
				// Add value to the pixel
				i = x + settings.width * y
				pixelValues[i] = pixelValues[i] + value
			}
		}
	}
})

var maxValue = d3.max(pixelValues)

// Paint heatmap
var imgd = ctx.getImageData(0, 0, settings.width, settings.height)
var pix = imgd.data
var pixlen
for ( i = 0, pixlen = pix.length; i < pixlen; i += 4 ) {
	value = pixelValues[i/4] / maxValue
	if (settings.quantize) {
		value = Math.round((settings.quantization_colors-1) * value) / (settings.quantization_colors-1)
	}
	var color = d3.rgb(d3[settings.color_scale](value))
  pix[i  ] = color.r // red
  pix[i+1] = color.g // green
  pix[i+2] = color.b // blue
  pix[i+3] = 255 // i+3 is alpha (the fourth element)
}
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