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

// Cloud
settings.cloud_background_color = '#b7dcfc'
settings.cloud_border_color = '#949cb3'
settings.cloud_filling_color = '#FFFFFF'
settings.cloud_roundness = 0.015

// Nodes
settings.display_nodes = true
settings.node_color = '#6c80b5'
settings.node_size = 0.3

// Node labels
settings.display_labels = true
settings.label_count = 10 // How much node labels you want to show (the biggest nodes)
settings.label_font_min_size = 16
settings.label_font_max_size = 24
settings.label_font_family = 'Open Sans Condensed, sans-serif'
settings.label_font_weight = 300
settings.label_border_thickness = 5


// --- (end of settings)

// Create the canvas
document.querySelector('#playground').innerHTML = '<div style="width:'+settings.width+'; height:'+settings.height+';"><canvas id="cnvs" width="'+settings.width+'" height="'+settings.height+'"></canvas></div>'
var canvas = document.querySelector('#cnvs')
var ctx = canvas.getContext("2d")

// Fix missing coordinates and/or colors
addMissingVisualizationData()

// Change the coordinates of the network to fit the canvas space
rescaleGraphToGraphicSpace()

// Draw cloud
var imgd
var bigRadius = settings.cloud_roundness * Math.min(settings.width, settings.height)
var borderRGB = d3.rgb(settings.cloud_border_color)
var fillingRGB = d3.rgb(settings.cloud_filling_color)
var backgroundLayer = (function(){  // Uniform background layer
  paintAll(ctx, settings.width, settings.height, settings.cloud_background_color)
  return ctx.getImageData(0, 0, settings.width, settings.height)
})()
var borderLayer = drawLayer({ // Dark border layer
    size: bigRadius,
    rgb: [borderRGB.r, borderRGB.g, borderRGB.b],
    opacity: .3,
    blurRadius: bigRadius,
    contrastFilter: true,
    contrastThreshold: 0.9,
    contrastSteepness: 0.03
  })
var fillingLayer = drawLayer({ // White filling layer
    size: bigRadius,
    rgb: [fillingRGB.r, fillingRGB.g, fillingRGB.b],
    opacity: 0.15,
    blurRadius: bigRadius,
    contrastFilter: true,
    contrastThreshold: 0.95,
    contrastSteepness: 0.002
  })

imgd = mergeImgdLayers([backgroundLayer, borderLayer, fillingLayer], settings.width, settings.height)
ctx.putImageData( imgd, 0, 0 )

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

// Draw each node
if (settings.display_nodes) {
  nodesBySize.reverse() // Because we draw from background to foreground
  nodesBySize.forEach(function(nid){
    var n = g.getNodeAttributes(nid)

    var color = d3.rgb(settings.node_color)

    ctx.lineCap="round"
    ctx.lineJoin="round"

    ctx.beginPath()
    ctx.arc(n.x, n.y, settings.node_size * n.size, 0, 2 * Math.PI, false)
    ctx.lineWidth = 0
    ctx.fillStyle = color.toString()
    ctx.shadowColor = 'transparent'
    ctx.fill()
  })
}

// Draw labels
if (settings.display_labels) {
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

  nodesBySize.forEach(function(nid){
    var n = g.getNodeAttributes(nid)

    if(n.showLabel){
      var color = d3.rgb(settings.node_color)
      var fontSize = Math.floor(settings.label_font_min_size + (n.size - label_nodeSizeExtent[0]) * (settings.label_font_max_size - settings.label_font_min_size) / (label_nodeSizeExtent[1] - label_nodeSizeExtent[0]))

      // Then, draw the label only if wanted
      var labelCoordinates = {
        x: n.x + 0.5 * settings.label_border_thickness + settings.node_size * n.size,
        y: n.y + 0.32 * fontSize
      }

      var label = n.label.replace(/^https*:\/\/(www\.)*/gi, '')

      ctx.font = settings.label_font_weight + " " + fontSize+"px "+settings.label_font_family
      ctx.lineWidth = settings.label_border_thickness
      ctx.fillStyle = settings.cloud_filling_color
      ctx.strokeStyle = settings.cloud_filling_color
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
}

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

// Demanding functions used for rendering canvas layers

function drawLayer(options) {
  ctx.clearRect(0, 0, settings.width, settings.height);

  var color = 'rgba('+options.rgb[0]+', '+options.rgb[1]+', '+options.rgb[2]+', '+options.opacity+')'
  var minalpha = 0

  // This is to prevent transparent areas to be assimiled as "black"
  if (options.contrastFilter) {
    minalpha = 0.1
    paintAll(ctx, settings.width, settings.height, 'rgba('+options.rgb[0]+', '+options.rgb[1]+', '+options.rgb[2]+', '+minalpha+')')
  }

  g.nodes().forEach(function(nid){
    var n = g.getNodeAttributes(nid)
    ctx.beginPath()
    ctx.arc(n.x, n.y, options.size * n.size, 0, 2*Math.PI, true)
    ctx.fillStyle = color
    ctx.fill()
    ctx.closePath()
  })

  var imgd = ctx.getImageData(0, 0, settings.width, settings.height)

  if (options.blurRadius > 0) {
    blur(imgd, settings.width, settings.height, options.blurRadius)
  }

  if (options.contrastFilter) {
    alphacontrast(imgd, settings.width, settings.height, minalpha, options.contrastThreshold, options.contrastSteepness)
  }

  return imgd
}

function mergeImgdLayers(imgdArray, w, h) {
  var imgd = imgdArray.shift()
  var imgd2
  while (imgd2 = imgdArray.shift()) {
    var pix = imgd.data
    var pix2 = imgd2.data
    for ( var i = 0, pixlen = pix.length; i < pixlen; i += 4 ) {
      var src_rgb = [pix2[i  ]/255, pix2[i+1]/255, pix2[i+2]/255]
      var src_alpha = pix2[i+3]/255
      var dst_rgb = [pix[i  ]/255, pix[i+1]/255, pix[i+2]/255]
      var dst_alpha = pix[i+3]/255
      var out_alpha = src_alpha + dst_alpha * (1 - src_alpha)
      var out_rgb = [0, 0, 0]
      if (out_alpha > 0) {
        out_rgb[0] = (src_rgb[0] * src_alpha + dst_rgb[0] * dst_alpha * (1 - src_alpha)) / out_alpha
        out_rgb[1] = (src_rgb[1] * src_alpha + dst_rgb[1] * dst_alpha * (1 - src_alpha)) / out_alpha
        out_rgb[2] = (src_rgb[2] * src_alpha + dst_rgb[2] * dst_alpha * (1 - src_alpha)) / out_alpha
      }
      pix[i  ] = Math.floor(out_rgb[0] * 255)
      pix[i+1] = Math.floor(out_rgb[1] * 255)
      pix[i+2] = Math.floor(out_rgb[2] * 255)
      pix[i+3] = Math.floor(out_alpha * 255)
    }
  }
  return imgd
}

function paintAll(ctx, w, h, color) {
  ctx.beginPath()
  ctx.rect(0, 0, w, h)
  ctx.fillStyle = color
  ctx.fill()
  ctx.closePath()
}

function alphacontrast(imgd, w, h, minalpha, threshold, factor) {
  var threshold255 = threshold * 255
  var contrast = buildConstrastFunction(factor, threshold255, minalpha)
  var pix = imgd.data

  // Split channels
  var channels = [[], [], [], []] // rgba
  for ( var i = 0, pixlen = pix.length; i < pixlen; i += 4 ) {
    // Just process the alpha channel
    pix[i+3] = contrast(pix[i+3])
  }

}

function buildConstrastFunction(factor, threshold255, minalpha) {
  var samin = 255 / (1 + Math.exp( -factor * (0 - threshold255) ))
  var samax = 255 / (1 + Math.exp( -factor * (1 - threshold255) ))
  var contrast = function(alpha) {
    var alpha2 = alpha / ( 1 - minalpha ) - 255 * minalpha // Alpha corrected to remove the minalpha
    var s_alpha = 255 / (1 + Math.exp( -factor * (alpha2 - threshold255) )) // Sigmoid contrast
    return (s_alpha - samin) / (samax - samin) // Correct the extent of the sigmoid function
  }
  return contrast
}

function blur(imgd, w, h, r) {
  var i
  var pix = imgd.data
  var pixlen = pix.length

  // Split channels
  var channels = [] // rgba
  for ( i=0; i<4; i++) {
    var channel = new Uint8ClampedArray(pixlen/4);
    channels.push(channel)
  }
  for ( i = 0; i < pixlen; i += 4 ) {
    channels[0][i/4] = pix[i  ]
    channels[1][i/4] = pix[i+1]
    channels[2][i/4] = pix[i+2]
    channels[3][i/4] = pix[i+3]
  }

  channels.forEach(function(scl){
    var tcl = scl.slice(0)
    var bxs = boxesForGauss(r, 3);
    boxBlur (scl, tcl, w, h, (bxs[0]-1)/2);
    boxBlur (tcl, scl, w, h, (bxs[1]-1)/2);
    boxBlur (scl, tcl, w, h, (bxs[2]-1)/2);
    scl = tcl
  })

  // Merge channels
  for ( var i = 0, pixlen = pix.length; i < pixlen; i += 4 ) {
    pix[i  ] = channels[0][i/4]
    pix[i+1] = channels[1][i/4]
    pix[i+2] = channels[2][i/4]
    pix[i+3] = channels[3][i/4]
  }
}

// From http://blog.ivank.net/fastest-gaussian-blur.html
function boxesForGauss(sigma, n) { // standard deviation, number of boxes

  var wIdeal = Math.sqrt((12*sigma*sigma/n)+1);  // Ideal averaging filter width 
  var wl = Math.floor(wIdeal);  if(wl%2==0) wl--;
  var wu = wl+2;
  
  var mIdeal = (12*sigma*sigma - n*wl*wl - 4*n*wl - 3*n)/(-4*wl - 4);
  var m = Math.round(mIdeal);
  // var sigmaActual = Math.sqrt( (m*wl*wl + (n-m)*wu*wu - n)/12 );
      
  var sizes = [];  for(var i=0; i<n; i++) sizes.push(i<m?wl:wu);
  return sizes;
}

function boxBlur (scl, tcl, w, h, r) {
  for(var i=0; i<scl.length; i++) tcl[i] = scl[i];
  boxBlurH(tcl, scl, w, h, r);
  boxBlurT(scl, tcl, w, h, r);
}

function boxBlurH (scl, tcl, w, h, r) {
  var iarr = 1 / (r+r+1);
  for(var i=0; i<h; i++) {
    var ti = i*w, li = ti, ri = ti+r;
    var fv = scl[ti], lv = scl[ti+w-1], val = (r+1)*fv;
    for(var j=0; j<r; j++) val += scl[ti+j];
    for(var j=0  ; j<=r ; j++) { val += scl[ri++] - fv       ;   tcl[ti++] = Math.round(val*iarr); }
    for(var j=r+1; j<w-r; j++) { val += scl[ri++] - scl[li++];   tcl[ti++] = Math.round(val*iarr); }
    for(var j=w-r; j<w  ; j++) { val += lv        - scl[li++];   tcl[ti++] = Math.round(val*iarr); }
  }
}

function boxBlurT (scl, tcl, w, h, r) {
  var iarr = 1 / (r+r+1);
  for(var i=0; i<w; i++) {
    var ti = i, li = ti, ri = ti+r*w;
    var fv = scl[ti], lv = scl[ti+w*(h-1)], val = (r+1)*fv;
    for(var j=0; j<r; j++) val += scl[ti+j*w];
    for(var j=0  ; j<=r ; j++) { val += scl[ri] - fv     ;  tcl[ti] = Math.round(val*iarr);  ri+=w; ti+=w; }
    for(var j=r+1; j<h-r; j++) { val += scl[ri] - scl[li];  tcl[ti] = Math.round(val*iarr);  li+=w; ri+=w; ti+=w; }
    for(var j=h-r; j<h  ; j++) { val += lv      - scl[li];  tcl[ti] = Math.round(val*iarr);  li+=w; ti+=w; }
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
