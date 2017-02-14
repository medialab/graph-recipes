var settings = {}

// Feel free to edit following settings

// Canvas size
settings.save_at_the_end = false
settings.width =  1000
settings.height = 1000
settings.offset = 20 // Margin

// WHICH ATTRIBUTES DESCRIBES CLUSTERS?
settings.clusters_attribute = 'Language' // This only works for the demo network

// Heatmap
settings.spreading = 100.0 // Pixel diameter of each nodes' "heat" area

// Drawing nodes, labels and edges
settings.display_label = false
settings.node_size = 2.0
settings.font_size = 9
settings.font_family = 'Open Sans Condensed, sans-serif'
settings.font_weight = 300
settings.edge_color = 'rgba(200, 200, 200, 0.3)'

// --- (end of settings)

// Create the canvas
document.querySelector('#playground').innerHTML = '<div style="width:'+settings.width+'; height:'+settings.height+';"><canvas id="cnvs" width="'+settings.width+'" height="'+settings.height+'"></canvas></div>'
var canvas = document.querySelector('#cnvs')
var ctx = canvas.getContext("2d")

// Change the coordinates of the network to fit the canvas space
rescaleGraphToGraphicSpace()

// Extract the different cluster classes
var classesIndex = {}
var cl
g.nodes().forEach(function(nid){
	classesIndex[g.getNodeAttribute(nid, settings.clusters_attribute)] = true
})

// Colors
var colors = ["#5f93bc","#d27533","#b05edc","#67a43a","#da50a5","#599a75","#de4e55","#867bd3","#a3884c","#bc7590"]
var count = 0
for (cl in classesIndex) {
	if (count < colors.length) {
		classesIndex[cl] = colors[count]
	} else {
		classesIndex[cl] = '#AAA'
	}
	count++
}

// Compute layers
var layers = []
for (cl in classesIndex) {
	var imgd = (function(){
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
		g.nodes()
		.filter(function(nid){
			return g.getNodeAttribute(nid, settings.clusters_attribute) == cl
		})
		.forEach(function(nid){
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
			if (value > 0.3) {
				var color = d3.rgb(classesIndex[cl])
			  pix[i  ] = color.r // red
			  pix[i+1] = color.g // green
			  pix[i+2] = color.b // blue
			  pix[i+3] = 200 // i+3 is alpha (the fourth element)
			}
		}

		// Convolute: blur
		imgd = convolute(imgd,
		[  0, .1,  0,
	    .1, .6, .1,
	     0, .1,  0 ]
    )

		// Convolute: contour
		imgd = convolute(imgd,
		[  0, -1,  0,
	    -1,  4, -1,
	     0, -1,  0 ]
    )

		// Convolute: blur
		imgd = convolute(imgd,
		[ .1, .3, .1,
	    .3, .8, .3,
	    .1, .3, .1 ]
    )

    return imgd
	})()
	layers.push(imgd)
}

// Merge layers
var imgd = ctx.createImageData(settings.width, settings.height)
var pix = imgd.data
var i
var pixlen
for ( i = 0, pixlen = pix.length; i < pixlen; i += 4 ) {
	var channel
	for (channel = 0; channel <= 2; channel++) {
		pix[i+channel] = 255
		layers.forEach(function(l){
			pix[i+channel] -= Math.floor((255-l.data[i+channel]) * l.data[i+3]/255)
		})
	}
	pix[i+3] = 255
}

// Draw cluster contours
ctx.putImageData( imgd, 0, 0 )

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
  ctx.fillStyle = d3.rgb(classesIndex[n[settings.clusters_attribute]]).toString()
  ctx.shadowColor = 'transparent'
  ctx.fill()
})



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
    xbarycenter = settings.zoom_point.x * settings.width // - settings.width / 2
    ybarycenter = settings.zoom_point.y * settings.height // - settings.height / 2
    ratio = 1/settings.zoom_window_size

    g.nodes().forEach(function(nid){
  		var n = g.getNodeAttributes(nid)
      n.x = settings.width / 2 + (n.x - xbarycenter) * ratio
      n.y = settings.height / 2 + (n.y - ybarycenter) * ratio
      n.size *= ratio
    })
  }
}

// Code from https://www.html5rocks.com/en/tutorials/canvas/imagefilters/
function convolute(pixels, weights, opaque) {
  var side = Math.round(Math.sqrt(weights.length));
  var halfSide = Math.floor(side/2);
  var src = pixels.data;
  var sw = pixels.width;
  var sh = pixels.height;
  // pad output by the convolution matrix
  var w = sw;
  var h = sh;
  var output = ctx.createImageData(w,h)
  var dst = output.data;
  // go through the destination image pixels
  var alphaFac = opaque ? 1 : 0;
  for (var y=0; y<h; y++) {
    for (var x=0; x<w; x++) {
      var sy = y;
      var sx = x;
      var dstOff = (y*w+x)*4;
      // calculate the weighed sum of the source image pixels that
      // fall under the convolution matrix
      var r=0, g=0, b=0, a=0;
      for (var cy=0; cy<side; cy++) {
        for (var cx=0; cx<side; cx++) {
          var scy = sy + cy - halfSide;
          var scx = sx + cx - halfSide;
          if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
            var srcOff = (scy*sw+scx)*4;
            var wt = weights[cy*side+cx];
            r += src[srcOff] * wt;
            g += src[srcOff+1] * wt;
            b += src[srcOff+2] * wt;
            a += src[srcOff+3] * wt;
          }
        }
      }
      dst[dstOff] = r;
      dst[dstOff+1] = g;
      dst[dstOff+2] = b;
      dst[dstOff+3] = a + alphaFac*(255-a);
    }
  }
  return output;
};