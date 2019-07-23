// HIGHLIGHT MODALITY - v0.2
// Backscatter Network Export
//
//  This script generates a network map as a raster image (in pixels)


/// EDIT SETTINGS BELOW

var settings = {}

// Auto-download the image once it is done
settings.save_at_the_end = false

// Image size and resolution
settings.width =  2000 // in pixels
settings.height = 2000 // in pixels

// Highlight-specific feature:
// reframe on highlighted nodes (zoom-in)
settings.reframe_on_highlight = true

// Zoom:
// You can zoon on a given point of the network
// to focus on a specific detail. It's not very easy to use
// because you must find the right point by trial and error.
// By default, a slight unzoom gives a welcome space on the borders
settings.zoom_enabled = true
settings.zoom_window_size = 1.2 // range from 0 to 1 (dezooms if >1)
settings.zoom_point = {x:0.5, y:0.5} // range from 0 to 1

// Layers:
// Decide which layers are drawn.
// The settings for each layer are below.
settings.draw_background = true
settings.draw_network_shape_fill = true
settings.draw_network_shape_contour = false
settings.draw_muted_edges = true
settings.draw_highlighted_edges = true
settings.draw_muted_nodes = true
settings.draw_highlighted_nodes = true
settings.draw_node_labels = true

// Layers order options
settings.draw_highlighted_edges_over_muted_nodes = true

// Layer: Background
// Original Backscatter palette: "#D9D8DA"
// Lighter for more contrast, a little warm: "#e0dcd9"
settings.background_circle = false
settings.background_color = "#e0dcd9"

// Layer: Network shape
//        (a potato for the whole network)
// ...generic structure
settings.network_shape_spreading = 0.9 // Range: 0.01 to 0.99 // Balanced: 0.5 // Acts on size
settings.network_shape_smoothness = 0 // Range: 0 to 10 or more // Makes rounder clusters
// ...shape fill
settings.network_shape_fill_alpha = 0.4 // Opacity // Range from 0 to 1
settings.network_shape_fill_color = "#cdc7c3"
// ...shape contour
settings.network_shape_contour_thickness = 3 // Min: 1
settings.network_shape_contour_alpha = 1 // Opacity // Range from 0 to 1
settings.network_shape_contour_color = "#cdc7c3"

// Layer: Edges
settings.edge_thickness = 0.3 // in px based on 1MP
settings.edge_highlighted_alpha = 0.5 // Opacity for main edges // Range from 0 to 1
settings.edge_muted_alpha = 0.15 // Opacity for other edges // Range from 0 to 1
settings.edge_high_quality = false // Halo around nodes // Time-consuming

// Layer: Nodes
settings.node_size = 0.8 // Factor to adjust the nodes drawing size

// Layer: Node labels
settings.label_font_min_size = 10 // in pt based on 1MP 72dpi
settings.label_font_max_size = 18  // in pt based on 1MP 72dpi
settings.label_border_thickness = 3

// Main clusters and color code:
// Clusters are defined by the modalities of a given attribute.
// This specifies which is this attribute, and which
// modalities have which colors. You can generate this
// JSON object with the PREPARE script.
settings.node_clusters = {
  "attribute_id": "attr_8",
  "modalities": {
    "Architecture;Andet": {
      "label": "Architecture",
      "count": 182,
      "color": "#658ec9"
    },
    "Design": {
      "label": "Design",
      "count": 159,
      "color": "#f2a5a6"
    }
  },
  "default_color": "#9d9b99"
}

// Advanced settings
settings.adjust_voronoi_range = 1.0 // Factor // Larger node halo + slightly bigger clusters
settings.max_voronoi_size = 250 // Above that size, we approximate the voronoi

/// (END OF SETTINGS)


/// INIT
report("Initialization")

// Create the canvas where the image will be rendered
document.querySelector('#playground').innerHTML = '<div style="width:'+settings.width+'; height:'+settings.height+';"><canvas id="cnvs" width="'+settings.width+'" height="'+settings.height+'"></canvas></div>'
var canvas = document.querySelector('#cnvs')
var ctx = canvas.getContext("2d")

// Fix missing coordinates and/or colors:
//  some parts of the script require default values
//  that are sometimes missing. We add them for consistency.)
addMissingVisualizationData()

// Normalize coordinates:
//  Most networks have arbitrary coordinates. Here we
//  normalize them to limit side effects. In particular, we
//  center the graph on its barycenter (center of gravity).
rescaleGraphToGraphicSpace()

// Build image
build()


/// PROCESS

function build(){
  // Precompute stuff:
  //  Depending on the settings, some things must be precomputed
  var nodesBySize, modalities, voronoiData, networkShapeImprint, centroidsByModality
  if (settings.draw_nodes || settings.draw_node_labels) {
    nodesBySize = precomputeNodesBySize()
  }
  if ( settings.draw_network_shape_fill
    || settings.draw_network_shape_contour
    || (settings.draw_edges && settings.edge_high_quality)
  ) {
      voronoiData = precomputeVoronoi()
  }
  if ( settings.draw_network_shape_fill
    || settings.draw_network_shape_contour
  ) {
    networkShapeImprint = precomputeNetworkShapeImprint(voronoiData)
  }

  // We draw the image layer by layer.
  // Each layer is drawn separately and merged one after another.
  // The reason for that is to allow drawing temporary
  // things on the canvas.
  var layeredImage = getEmptyLayer(ctx)

  // Draw background
  if (settings.draw_background) {
    layeredImage = drawLayerOnTop(layeredImage,
      drawBackgroundLayer(ctx)
    )
  }

  // Draw network shape fill
  if (settings.draw_network_shape_fill) {
    layeredImage = drawLayerOnTop(layeredImage,
      drawNetworkShapeFillLayer(ctx, networkShapeImprint)
    )
  }

  // Draw network shape contour
  if (settings.draw_network_shape_contour) {
    layeredImage = drawLayerOnTop(layeredImage,
      drawNetworkShapeContourLayer(ctx, networkShapeImprint)
    )
  }

  // Draw muted edges
  if (settings.draw_muted_edges) {
    layeredImage = drawLayerOnTop(layeredImage,
      drawMEdgesLayer(ctx, voronoiData)
    )
  }

  // Draw highlighted edges (under muted nodes)
  if (settings.draw_highlighted_edges && !settings.draw_highlighted_edges_over_muted_nodes) {
    layeredImage = drawLayerOnTop(layeredImage,
      drawHEdgesLayer(ctx, voronoiData)
    )
  }

  // Draw muted nodes
  if (settings.draw_muted_nodes) {
    layeredImage = drawLayerOnTop(layeredImage,
      drawMNodesLayer(ctx, nodesBySize)
    )
  }

  // Draw highlighted edges (over muted nodes)
  if (settings.draw_highlighted_edges && settings.draw_highlighted_edges_over_muted_nodes) {
    layeredImage = drawLayerOnTop(layeredImage,
      drawHEdgesLayer(ctx, voronoiData)
    )
  }


  // Draw highlighted nodes
  if (settings.draw_highlighted_nodes) {
    layeredImage = drawLayerOnTop(layeredImage,
      drawHNodesLayer(ctx, nodesBySize)
    )
  }

  // Draw node labels
  if (settings.draw_node_labels) {
    layeredImage = drawLayerOnTop(layeredImage,
      drawNodeLabelsLayer(ctx, nodesBySize)
    )
  }

  // Finally we compile all the layers
  drawLayers(ctx, [layeredImage])

  // Save if needed
  saveIfNeeded()
}





/// FUNCTIONS

function addMissingVisualizationData() {
  log("Add missing visualization data...")
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
  report("...done.")
}

function rescaleGraphToGraphicSpace() {
  log("Rescale graph to graphic space...")

  var nodesSelection
  if (settings.reframe_on_highlight) {
    nodesSelection = g.nodes()
      .filter(function(nid){
        var mod = g.getNodeAttribute(nid, settings.node_clusters.attribute_id)
        return !!settings.node_clusters.modalities[mod]
      })    
  } else {
    nodesSelection = g.nodes()
  }

  // General barycenter resize
  var xbarycenter = 0
  var ybarycenter = 0
  var wtotal = 0
  var dx
  var dy
  var ratio

  // Default size
  g.nodes().forEach(function(nid){
    var n = g.getNodeAttributes(nid)
    n.size = n.size || 1
  })

  nodesSelection.forEach(function(nid){
    var n = g.getNodeAttributes(nid)
    // We use node size as weight
    xbarycenter += n.size * n.x
    ybarycenter += n.size * n.y
    wtotal += n.size
  })
  xbarycenter /= wtotal
  ybarycenter /= wtotal

  var dmax = 0 // Maximal distance from barycenter
  nodesSelection.forEach(function(nid){
    var n = g.getNodeAttributes(nid)
    var d = Math.sqrt( Math.pow(n.x - xbarycenter, 2) + Math.pow(n.y - xbarycenter, 2) )
    dmax = Math.max(dmax, d)
  })

  ratio = ( Math.min(settings.width, settings.height) ) / (2 * dmax)

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
  report("...done.")
}

function precomputeNodesBySize() {
  log("Precompute nodes by size...")

  // Order nodes by size to draw with the right priority
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
  nodesBySize.reverse() // Because we draw from background to foreground

  report("...done.")
  return nodesBySize
}

function precomputeModalities() {
  log("Precompute modalities...")
  var modalitiesIndex = {}
  g.nodes().forEach(function(nid){
    var modality = g.getNodeAttribute(nid, settings.node_clusters.attribute_id)
    modalitiesIndex[modality] = true
  })
  report("...done.")
  return d3.keys(modalitiesIndex)
}

function precomputeVoronoi() {
  log("Precompute Voronoi")

  var i
  var x
  var y
  var d

  var options = {}
  if (settings.width>settings.max_voronoi_size) {
    options.ratio = settings.max_voronoi_size/settings.width
    options.width = Math.floor(options.ratio*settings.width)
    options.height = Math.floor(options.ratio*settings.height)
  } else {
    options.ratio = 1
    options.width = settings.width
    options.height = settings.height
  }
  options.voronoi_range = settings.adjust_voronoi_range * 5 * options.width * options.height / Math.min(options.width,options.height) / g.order / settings.zoom_window_size
  options.voronoi_use_node_size = false

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
  var vidPixelMap
  if (g.order < 255) {
    vidPixelMap = new Uint8Array(options.width * options.height)
  } else if (g.order < 65535) {
    vidPixelMap = new Uint16Array(options.width * options.height)
  } else {
    vidPixelMap = new Uint32Array(options.width * options.height)
  }
  for (i in vidPixelMap) {
    vidPixelMap[i] = 0
  }

  // Init a pixel map of floats for distances
  var dPixelMap = new Uint8Array(options.width * options.height)
  for (i in dPixelMap) {
    dPixelMap[i] = 255
  }

  // Compute the voronoi using the pixel map
  g.nodes().forEach(function(nid){
    var n = g.getNodeAttributes(nid)
    var nsize = options.ratio * n.size * settings.node_size
    var nx = options.ratio * n.x
    var ny = options.ratio * n.y
    var range = nsize + options.voronoi_range
    if (options.voronoi_use_node_size) {
      range *= n.size
    }
    for (x = Math.max(0, Math.floor(nx - range) ); x <= Math.min(options.width, Math.floor(nx + range) ); x++ ){
      for (y = Math.max(0, Math.floor(ny - range) ); y <= Math.min(options.height, Math.floor(ny + range) ); y++ ){
        d = Math.sqrt(Math.pow(nx - x, 2) + Math.pow(ny - y, 2))
 
        if (d < range) {
          var dmod // A tweak of the voronoi: a modified distance in [0,1]
          if (d <= nsize) {
            // "Inside" the node
            dmod = 0
          } else {
            // In the halo range
            dmod = (d - nsize) / options.voronoi_range
          }
          i = x + options.width * y
          var existingVid = vidPixelMap[i]
          if (existingVid == 0) {
            // 0 means there is no closest node
            vidPixelMap[i] = n.vid
            dPixelMap[i] = Math.floor(dmod*255)
          } else {
            // There is already a closest node. Edit only if we are closer.
            if (dmod*255 < dPixelMap[i]) {
              vidPixelMap[i] = n.vid
              dPixelMap[i] = Math.floor(dmod*255)
            }
          }
        }
      }
    }
  })

  report("...done.")
  return {
    nodesIndex: nodesIndex,
    vidPixelMap: vidPixelMap,
    dPixelMap:dPixelMap,
    width:options.width,
    height:options.height,
    ratio:options.ratio
  }
}

function precomputeNetworkShapeImprint(voronoiData) {
  log("Precompute network shape...")

  var options = {}
  // Steps
  options.step_blur = true
  options.step_contrast = true
  options.step_contrast_adjust_spread = true

  options.voronoi_paint_distance = true
  options.blur_radius = 0.01 * settings.network_shape_smoothness * Math.min(voronoiData.width, voronoiData.height) / settings.zoom_window_size
  options.contrast_steepness = Infinity // More = more abrupt contour. ex: 0.03 for a slight gradient
  options.contrast_threshold = 0.15 // At which alpha level it "finds" the cluster (must remain low)
  options.contrast_postprocessing_threshold = 1-settings.network_shape_spreading // Idem on a secondary pass
  options.contrast_postprocessing_blur_radius = 0.03 * Math.min(voronoiData.width, voronoiData.height) / settings.zoom_window_size

  // New Canvas
  var newCanvas = document.createElement('canvas')
  newCanvas.width = voronoiData.width
  newCanvas.height = voronoiData.height
  var ctx = newCanvas.getContext("2d")

  // Paint the voronoi "imprint" of the cluster
  var imgd = ctx.getImageData(0, 0, voronoiData.width, voronoiData.height)
  var pix = imgd.data
  var i, pixlen
  for ( i = 0, pixlen = pix.length; i < pixlen; i += 4 ) {
    var vid = voronoiData.vidPixelMap[i/4]
    if (vid > 0) {
      pix[i  ] = 0 // red
      pix[i+1] = 0 // green
      pix[i+2] = 0 // blue
      if (options.voronoi_paint_distance) {
        pix[i+3] = Math.floor(255 - voronoiData.dPixelMap[i/4])
      } else {
        pix[i+3] = 255 // alpha
      }
    }
  }

  // Pre-treatment: Make the imprint of the voronoï more natural
  // Add a slight blur (but keep the original)
  imgd = mergeLayers([
    imgd,
    blur(imgd, 0.005 * Math.min(voronoiData.width, voronoiData.height) / settings.zoom_window_size)
  ])
  // Convolute: slight blur for antialiasing
  imgd = convolute(imgd,
  [  0, .1,  0,
    .1, .6, .1,
     0, .1,  0 ]
  )

  // Blur
  if (options.step_blur) {
    // Blur
    imgd = blur(imgd, options.blur_radius)

    // Normalize alpha at 10% (helps with edge cases where alpha becomes very low)
    imgd = normalizeAlpha(imgd, 0, 255, 0.1)
  }

  // Threshold the "cloud"
  if (options.step_contrast) {
    imgd = alphacontrast(imgd, 0, options.contrast_threshold, options.contrast_steepness)
  }

  // Postprocessing: blur then re-threshold
  if (options.step_contrast_adjust_spread) {
    // Blur
    imgd = blur(imgd, options.contrast_postprocessing_blur_radius)

    // Normalize alpha at 50% (helps with edge cases where alpha becomes very low)
    imgd = normalizeAlpha(imgd, 0, 255, 0.5)

    // Threshold
    imgd = alphacontrast(imgd, 0, options.contrast_postprocessing_threshold, options.contrast_steepness)
  }

  report("...done.")
  return imgd
}

function getEmptyLayer(ctx) {
  // Clear canvas
  ctx.clearRect(0, 0, settings.width, settings.height)
  return ctx.getImageData(0, 0, settings.width, settings.height)
}

function drawBackgroundLayer(ctx) {
  log("Draw background layer...")
  // Clear canvas
  ctx.clearRect(0, 0, settings.width, settings.height);
  if (settings.background_circle) {
    var r = Math.min(settings.width, settings.height)/2
    ctx.beginPath()
    ctx.arc(settings.width/2, settings.height/2, r, 0, 2 * Math.PI, false)
    ctx.lineWidth = 0
    ctx.fillStyle = settings.background_color
    ctx.shadowColor = 'transparent'
    ctx.fill()
  } else {
    paintAll(ctx, settings.width, settings.height, settings.background_color)
  }
  report("...done.")
  return ctx.getImageData(0, 0, settings.width, settings.height)
}

function processRescaledImprint(imgd) {
  var options = {}
  options.threshold = 0.5
  options.blur_radius = 0.01 * Math.min(settings.width, settings.height) / settings.zoom_window_size
  // Blur
  imgd = blur(imgd, options.blur_radius)
  // Threshold
  imgd = alphacontrast(imgd, 0, options.threshold, Infinity)
  return imgd
}

function drawNetworkShapeFillLayer(ctx, networkShapeImprint) {
  log("Draw network shape (fill)...")
  // Clear canvas
  ctx.clearRect(0, 0, settings.width, settings.height);
  
  // Draw and rescale the imprint if necessary
  var imgd
  var ratio = settings.width/settings.max_voronoi_size
  if (ratio>1) {
    var canvas2=document.createElement("canvas")
    canvas2.width=settings.width
    canvas2.height=settings.height
    var ctx2=canvas2.getContext("2d")
    ctx2.putImageData(networkShapeImprint, 0, 0)
    ctx.scale(ratio, ratio)
    ctx.drawImage(ctx2.canvas,0,0)
    imgd = ctx.getImageData(0, 0, settings.width, settings.height)
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    imgd = processRescaledImprint(imgd)
  } else {
    imgd = networkShapeImprint
  }

  var color = settings.network_shape_fill_color
  var pix = imgd.data
  var rgb = d3.color(color)
  var i, pixlen
  for ( i = 0, pixlen = pix.length; i < pixlen; i += 4 ) {
    pix[i  ] = rgb.r // red
    pix[i+1] = rgb.g // green
    pix[i+2] = rgb.b // blue
    pix[i+3] = Math.floor(settings.network_shape_fill_alpha * pix[i+3]) // alpha
  }

  // Convolute: slight blur (for antialiasing)
  imgd = convolute(imgd,
  [  0, .1,  0,
    .1, .6, .1,
     0, .1,  0 ]
  )

  report("...done.")
  return imgd
}

function drawNetworkShapeContourLayer(ctx, networkShapeImprint) {
  log("Draw network shape (contour)...")
  // Clear canvas
  ctx.clearRect(0, 0, settings.width, settings.height);

  // Draw and rescale the imprint if necessary
  var imgd
  var ratio = settings.width/settings.max_voronoi_size
  if (ratio>1) {
    var canvas2=document.createElement("canvas")
    canvas2.width=settings.width
    canvas2.height=settings.height
    var ctx2=canvas2.getContext("2d")
    ctx2.putImageData(networkShapeImprint, 0, 0)
    ctx.scale(ratio, ratio)
    ctx.drawImage(ctx2.canvas,0,0)
    imgd = ctx.getImageData(0, 0, settings.width, settings.height)
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    imgd = processRescaledImprint(imgd)
  } else {
    imgd = networkShapeImprint
  }

  var color = settings.network_shape_contour_color

  // Draw the contour from the filling by convolution
  // Convolute: slight blur (for antialiasing)
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

  // Trick for thickness
  for ( var i=1; i<settings.network_shape_contour_thickness*Math.min(settings.width, settings.height) / 1000 / settings.zoom_window_size; i++) {
    // Convolute: blur+thicken
    imgd = convolute(imgd,
    [ .1, .3, .1,
      .3, .8, .3, 
      .1, .3, .1 ]
    )
  }

  var pix = imgd.data
  var rgb = d3.color(color)
  var i, pixlen
  for ( i = 0, pixlen = pix.length; i < pixlen; i += 4 ) {
    pix[i  ] = rgb.r // red
    pix[i+1] = rgb.g // green
    pix[i+2] = rgb.b // blue
    pix[i+3] = Math.floor(settings.network_shape_contour_alpha * pix[i+3]) // alpha
  }

  report("...done.")
  return imgd
}

function drawHEdgesLayer(ctx, voronoiData) {
  log("Draw highlighted edges...")
  var edges = g.edges()
    .filter(function(eid){
      var ns = g.getNodeAttributes(g.source(eid))
      var nt = g.getNodeAttributes(g.target(eid))
      var smod = settings.node_clusters.modalities[ns[settings.node_clusters.attribute_id]]
      var tmod = settings.node_clusters.modalities[nt[settings.node_clusters.attribute_id]]
      return smod && tmod
    })
  var result = drawEdgesLayer(ctx, voronoiData, edges, true)
  report("...done.")
  return result
}

function drawMEdgesLayer(ctx, voronoiData) {
  log("Draw muted edges...")
  var edges = g.edges()
    .filter(function(eid){
      var ns = g.getNodeAttributes(g.source(eid))
      var nt = g.getNodeAttributes(g.target(eid))
      var smod = settings.node_clusters.modalities[ns[settings.node_clusters.attribute_id]]
      var tmod = settings.node_clusters.modalities[nt[settings.node_clusters.attribute_id]]
      return !(smod && tmod)
    })
  var result = drawEdgesLayer(ctx, voronoiData, edges, false)
  report("...done.")
  return result
}

function drawEdgesLayer(ctx, voronoiData, edges, highlighted) {
  var options = {}
  options.display_voronoi = false // for monitoring purpose
  options.display_edges = true // disable for monitoring purpose
  options.edge_thickness = settings.edge_thickness*Math.min(settings.width, settings.height) / 1000
  options.edge_alpha = highlighted ? settings.edge_highlighted_alpha : settings.edge_muted_alpha
  options.edge_color = "#FFF"
  options.node_halo = settings.edge_high_quality
  options.halo_intensity = 0.8 // 0: no halo; 1=other edges invisible at the center

  var i, x, y

  var gradient = function(d){
    return 0.5 + 0.5 * Math.cos(Math.PI - Math.pow(d, 2) * Math.PI)
  }

  // Clear canvas
  ctx.clearRect(0, 0, settings.width, settings.height)

  if (options.display_voronoi) {
    var size = 1
    for (x=0; x<settings.width; x+=size) {
      for (y=0; y<settings.height; y+=size) {
        var pixi = Math.floor(x) + settings.width * Math.floor(y)
        var d = voronoiData.dPixelMap[pixi]/255
        var c = d3.color("#000")
        if (d < Infinity) {
          c.opacity = gradient(voronoiData.dPixelMap[pixi]/255)
        }
        ctx.fillStyle = c.toString()
        ctx.fillRect(x, y, size, size)
      }
    }
  }

  // Draw each edge
  if (options.display_edges) {
    edges.forEach(function(eid){
      var ns = g.getNodeAttributes(g.source(eid))
      var nt = g.getNodeAttributes(g.target(eid))
      var color = d3.color(options.edge_color)
      var path = []

      if (options.node_halo) {
        var d = Math.sqrt(Math.pow(ns.x - nt.x, 2) + Math.pow(ns.y - nt.y, 2))

        // Build path
        for (i=0; i<1; i+=1/d) {
          x = (1-i)*ns.x + i*nt.x
          y = (1-i)*ns.y + i*nt.y

          // Opacity
          var o
          var pixi = Math.floor(x) + settings.width * Math.floor(y)
          if (voronoiData.vidPixelMap[pixi] == ns.vid || voronoiData.vidPixelMap[pixi] == nt.vid || voronoiData.vidPixelMap[pixi] == 0) {
            o = 1
          } else {
            o = (1-options.halo_intensity) + options.halo_intensity * gradient(voronoiData.dPixelMap[pixi]/255)
          }
          path.push([x,y,o])
        }
        
        // Smoothe path
        if (path.length > 5) {
          for (i=2; i<path.length-2; i++) {
            path[i][2] = 0.15 * path[i-2][2] + 0.25 * path[i-1][2] + 0.2 * path[i][2] + 0.25 * path[i+1][2] + 0.15 * path[i+2][2]
          }
        }
      } else {
        path.push([ns.x, ns.y, 1])
        path.push([nt.x, nt.y, 1])
      }
    

      // Draw path
      var lastp
      var lastop
      path.forEach(function(p, pi){
        if (lastp) {
          color.opacity = p[2]
          ctx.beginPath()
          ctx.lineCap="round"
          ctx.lineJoin="round"
          ctx.strokeStyle = color.toString()
          ctx.fillStyle = 'rgba(0, 0, 0, 0)';
          ctx.lineWidth = options.edge_thickness
          ctx.moveTo(lastp[0], lastp[1])
          ctx.lineTo(p[0], p[1])
          ctx.stroke()
          ctx.closePath()
        }
        lastp = p
        lastop = color.opacity
      })
    })
  }

  return multiplyAlpha(
    ctx.getImageData(0, 0, settings.width, settings.height),
    options.edge_alpha
  )
}

function drawHNodesLayer(ctx, nodesBySize) {
  log("Draw highlighted nodes...")
  var nodes = g.nodes()
    .filter(function(nid){
      var n = g.getNodeAttributes(nid)
      var mod = settings.node_clusters.modalities[n[settings.node_clusters.attribute_id]]
      return !!mod
    })
  var result = drawNodesLayer(ctx, nodes, true)
  report("...done.")
  return result
}

function drawMNodesLayer(ctx, nodesBySize) {
  log("Draw muted nodes...")
  var nodes = g.nodes()
    .filter(function(nid){
      var n = g.getNodeAttributes(nid)
      var mod = settings.node_clusters.modalities[n[settings.node_clusters.attribute_id]]
      return !mod
    })
  var result = drawNodesLayer(ctx, nodes, false)
  report("...done.")
  return result
}

function drawNodesLayer(ctx, nodesBySize, highlighted) {
  var options = {}
  options.node_stroke = true
  options.node_stroke_width = 0.5 * Math.min(settings.width, settings.height)/1000

  // Clear canvas
  ctx.clearRect(0, 0, settings.width, settings.height)

  nodesBySize.forEach(function(nid){
    var n = g.getNodeAttributes(nid)

    var modality = settings.node_clusters.modalities[n[settings.node_clusters.attribute_id]]
    var color
    if (highlighted) {
      color = modality.color
    } else {
      color = "#ccc5c0"
    }

    var radius = Math.max(settings.node_size * n.size, 2)

    ctx.lineCap="round"
    ctx.lineJoin="round"

    if (options.node_stroke && highlighted) {
      ctx.beginPath()
      ctx.arc(n.x, n.y, radius + options.node_stroke_width, 0, 2 * Math.PI, false)
      ctx.lineWidth = 0
      ctx.fillStyle = "rgba(255, 255, 255, 0.66)"
      ctx.shadowColor = 'transparent'
      ctx.fill()
    }

    ctx.beginPath()
    ctx.arc(n.x, n.y, radius, 0, 2 * Math.PI, false)
    ctx.lineWidth = 0
    ctx.fillStyle = color.toString()
    ctx.shadowColor = 'transparent'
    ctx.fill()
  })

  return ctx.getImageData(0, 0, settings.width, settings.height)
}

function drawNodeLabelsLayer(ctx, nodesBySize_) {
  log("Draw node labels...")
  var options = {}
  options.draw_labels = true
  options.label_count = Infinity
  options.colored_labels = true
  options.sized_labels = true
  options.label_spacing_factor = 1.5 // 1=normal; 2=box twice as wide/high etc.
  options.font_family = 'IBM Plex Sans Condensed, sans-serif'
  options.font_min_size = settings.label_font_min_size * Math.min(settings.width, settings.height)/1000
  options.font_max_size = settings.label_font_max_size * Math.min(settings.width, settings.height)/1000
  options.border_thickness = settings.label_border_thickness * Math.min(settings.width, settings.height)/1000
  options.border_optical_adjustment = 2
  options.border_color = settings.background_color
  options.pixmap_size = 1 + Math.floor(0.3 * options.font_min_size)
  var i, x, y

  // Deal with font weights
  //  Relative thicknesses for: IBM Plex Sans Condensed
  //  Thin/100: 3.5
  //  Extra-Light/200: 6
  //  Light/300: 9
  //  Regular/400: 12.5
  //  Medium/500: 17.5
  //  Semi-bold/600: 20
  //  Bold/700: 23.5
  var weights =     [ /*100, */200, 300,  400,  500, 600,  700 ]
  var thicknesses = [ /*3.5,   */6,   9, 12.5, 17.5,  20, 23.5 ]
    .map(function(d){
      return Math.pow(d, options.border_optical_adjustment)
    })
  var thicknessToWeight = d3.scaleLinear()
    .domain(thicknesses)
    .range(weights)
  // Intuitively: font_size*thickness = constant
  var font_const = options.font_max_size*thicknesses[0]
  // We restrain the size to the proper steps of the scale
  var normalizeFontSize = function(size) {
    var continuousWeight = thicknessToWeight(font_const/size)
    var properWeight = 100*Math.round(continuousWeight/100)
    var properThickness = thicknessToWeight.invert(properWeight)
    var properSize = font_const/properThickness
    return [properSize, properWeight]
  } 

  // Clear canvas
  ctx.clearRect(0, 0, settings.width, settings.height)

  // Reverse nodes by size order
  var nodesBySize = nodesBySize_.splice(0)
    .filter(function(nid){
      var n = g.getNodeAttributes(nid)
      var mod = settings.node_clusters.modalities[n[settings.node_clusters.attribute_id]]
      return !!mod
    })
  nodesBySize.reverse()

  // Draw each label
  if (options.draw_labels) {

    // Init a pixel map of int for bounding boxes
    var pixmapWidth = Math.ceil(settings.width/options.pixmap_size)
    var pixmapHeight = Math.ceil(settings.height/options.pixmap_size)
    var bbPixmap = new Uint8Array(pixmapWidth * pixmapHeight)
    for (i in bbPixmap) {
      bbPixmap[i] = 0 // 1 means "occupied"
    }

    // Compute scale for labels
    var label_nodeSizeExtent = d3.extent(
      nodesBySize.map(function(nid){
        return g.getNodeAttribute(nid, "size")
      })
    )
    if (label_nodeSizeExtent[0] == label_nodeSizeExtent[1]) {label_nodeSizeExtent[0] *= 0.9}

    // Draw labels
    var labelDrawCount = options.label_count
    nodesBySize.forEach(function(nid){
      if(labelDrawCount > 0){

        var n = g.getNodeAttributes(nid)
        var nx = n.x
        var ny = n.y

        var modality = settings.node_clusters.modalities[n[settings.node_clusters.attribute_id]]
        var ncol
        if (modality) {
          ncol = d3.color(modality.color)
        } else {
          ncol = d3.color(settings.node_clusters.default_color || "#8B8B8B")
        }

        var radius = Math.max(settings.node_size * n.size, 2)

        // Precompute the label
        var color = options.colored_labels ? tuneColorForLabel(ncol) : d3.color('#666')
        var fontSize = options.sized_labels
          ? Math.floor(options.font_min_size + (n.size - label_nodeSizeExtent[0]) * (options.font_max_size - options.font_min_size) / (label_nodeSizeExtent[1] - label_nodeSizeExtent[0]))
          : Math.floor(0.6 * options.font_min_size + 0.4 * options.font_max_size)

        var sw = normalizeFontSize(fontSize)
        fontSize = sw[0]
        var fontWeight = sw[1]

        // Then, draw the label only if wanted
        var labelCoordinates = {
          x: nx + 0.6 * options.border_thickness + 1.05 * radius,
          y: ny + 0.25 * fontSize
        }

        var label = n.label.replace(/^https*:\/\/(www\.)*/gi, '')

        ctx.font = fontWeight + " " + fontSize + "px " + options.font_family
        ctx.lineWidth = options.border_thickness

        // Bounding box
        var bbox = getBBox(ctx, fontSize, labelCoordinates, label, options.label_spacing_factor)

        // Test bounding box collision
        var collision = false
        var bboxResizedX = Math.floor(bbox.x/options.pixmap_size)
        var bboxResizedY = Math.floor(bbox.y/options.pixmap_size)
        var bboxResizedX2 = Math.ceil((bbox.x + bbox.width)/options.pixmap_size)
        var bboxResizedY2 = Math.ceil((bbox.y + bbox.height)/options.pixmap_size)
        for (x = bboxResizedX; x<bboxResizedX2; x++) {
          for (y = bboxResizedY; y<bboxResizedY2; y++) {
            if (bbPixmap[x + (y*pixmapWidth)] == 1) {
              collision = true
              break
              break
            }
          }
        }
        if (!collision) {

          // Update bounding box data
          for (x = bboxResizedX; x<bboxResizedX2; x++) {
            for (y = bboxResizedY; y<bboxResizedY2; y++) {
              bbPixmap[x + (y*pixmapWidth)] = 1
            }
          }

          // Update count
          labelDrawCount--

          // Draw
          ctx.fillStyle = options.border_color
          ctx.strokeStyle = options.border_color

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

      }

    })
  }
  report("...done.")
  return ctx.getImageData(0, 0, settings.width, settings.height)
}

function saveIfNeeded() {
  if (settings.save_at_the_end) {
    canvas.toBlob(function(blob) {
        saveAs(blob, store.get('graphname') + ".png");
    })
  }
}

function drawLayers(ctx, layers) {
  var imgd = mergeLayers(layers)
  ctx.putImageData( imgd, 0, 0 )
}

function drawLayerOnTop(bottomLayer, topLayer) {

  // New Canvas
  var newCanvas = document.createElement('canvas')
  newCanvas.width = bottomLayer.width
  newCanvas.height = bottomLayer.height
  var ctx = newCanvas.getContext("2d")

  // Paint bottom layer
  ctx.putImageData(bottomLayer, 0, 0)

  // Create temporary canvas for top layer
  var canvas2=document.createElement("canvas")
  canvas2.width=topLayer.width
  canvas2.height=topLayer.height
  var ctx2=canvas2.getContext("2d")
  ctx2.putImageData(topLayer, 0, 0)

  ctx.drawImage(canvas2,0,0);

  return ctx.getImageData(0, 0, bottomLayer.width, bottomLayer.height)
}

function mergeLayers(layers) {
  var imgd_bottom = layers.shift()
  var imgd_top
  while (imgd_top = layers.shift()) {
    imgd_bottom = drawLayerOnTop(imgd_bottom, imgd_top)
  }

  return imgd_bottom
}

function paintAll(ctx, w, h, color) {
  ctx.beginPath()
  ctx.rect(0, 0, w, h)
  ctx.fillStyle = color
  ctx.fill()
  ctx.closePath()
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
}

function findCentroid(imgd, modality) {
  var options = {}
  options.monitoring = false // Download intermediate steps

  var total = 0
  var safeguard = 100
  var w = Math.min(settings.width, settings.max_voronoi_size)
  var lasti, i, pixlen

  // Clone image data
  var newCanvas = document.createElement('canvas')
  newCanvas.width = imgd.width
  newCanvas.height = imgd.height
  var ctx = newCanvas.getContext("2d")
  var imgd2 = ctx.createImageData(imgd.width, imgd.height);
  imgd2.data.set(imgd.data)

  var pix = imgd2.data
  for ( i = 0, pixlen = pix.length; i < pixlen; i += 4 ) {
    if (pix[i+3] > 250) {
      lasti = i
      total++
    }
  }

  if (options.monitoring) {
    downloadImageData(imgd2, modality+" - "+safeguard)
  }

  while (total>0 && safeguard-->0) {
    total = 0

    // Reduce the cluster(s)
    // 1. blur
    for ( i=0; i<2; i++) {
      imgd2 = convolute(imgd2,
      [  0, .2,  0,
        .2, .2, .2,
         0, .2,  0 ]
      )
    }

    // 2. threshold
    pix = imgd2.data
    for ( i = 0, pixlen = pix.length; i < pixlen; i += 4 ) {
      if (pix[i+3] > 250) {
        pix[i+3] = 255
        lasti = i
        total++
      } else {
        pix[i+3] = 0
      }
    }

    if (options.monitoring) {
      downloadImageData(imgd2, modality+" - "+safeguard)
    }
  }
  
  var x = (lasti/4)%w
  var y = (lasti/4 - x)/w
  
  return [x, y]
}

function normalizeAlpha(imgd, minalpha, maxalpha, dryWet) {
  var w = imgd.width
  var h = imgd.height
  var pix = imgd.data
  // output
  var imgdo = ctx.createImageData(w,h)
  var pixo = imgdo.data

  var min = Infinity
  var max = 0
  for ( var i = 0, pixlen = pixo.length; i < pixlen; i += 4 ) {
    var a = pix[i+3]
    min = Math.min(a, min)
    max = Math.max(a, max)
  }
  for ( var i = 0, pixlen = pixo.length; i < pixlen; i += 4 ) {
    pixo[i+3] = Math.floor(dryWet * (minalpha + (maxalpha-minalpha)*(pix[i+3]-min)/(max-min)) + (1-dryWet)*pix[i+3])
  }

  return imgdo
}

function multiplyAlpha(imgd, alpha) {
  var w = imgd.width
  var h = imgd.height
  var pix = imgd.data
  // output
  var imgdo = ctx.createImageData(w,h)
  var pixo = imgdo.data

  for ( var i = 0, pixlen = pixo.length; i < pixlen; i += 4 ) {
    pixo[i+0] = pix[i+0]
    pixo[i+1] = pix[i+1]
    pixo[i+2] = pix[i+2]
    pixo[i+3] = Math.floor(alpha * pix[i+3])
  }

  return imgdo
}

function alphacontrast(imgd, minalpha, threshold, factor) {
  var w = imgd.width
  var h = imgd.height
  var threshold255 = threshold * 255
  var contrast = buildConstrastFunction(factor, threshold255, minalpha)
  var pix = imgd.data
  // output
  var imgdo = ctx.createImageData(w,h)
  var pixo = imgdo.data

  // Split channels
  var channels = [[], [], [], []] // rgba
  for ( var i = 0, pixlen = pixo.length; i < pixlen; i += 4 ) {
    // Just process the alpha channel
    pixo[i+3] = contrast(pix[i+3])
  }

  return imgdo
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

function blur(imgd, r) {
  var i
  var w = imgd.width
  var h = imgd.height
  var pix = imgd.data
  var pixlen = pix.length
  // output
  var imgdo = ctx.createImageData(w,h)
  var pixo = imgdo.data

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
  for ( var i = 0, pixlen = pixo.length; i < pixlen; i += 4 ) {
    pixo[i  ] = channels[0][i/4]
    pixo[i+1] = channels[1][i/4]
    pixo[i+2] = channels[2][i/4]
    pixo[i+3] = channels[3][i/4]
  }

  return imgdo
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

function tuneColorForLabel(c) {
  var options = {}
  options.label_color_min_C = 0
  options.label_color_max_C = 50
  options.label_color_min_L = 2
  options.label_color_max_L = 35
  var hcl = d3.hcl(c)
  hcl.c = Math.max(hcl.c, options.label_color_min_C)
  hcl.c = Math.min(hcl.c, options.label_color_max_C)
  hcl.l = Math.max(hcl.l, options.label_color_min_L)
  hcl.l = Math.min(hcl.l, options.label_color_max_L)
  return d3.color(hcl)
}

function getBBox(ctx, fontSize, labelCoordinates, label, factor) {
  var x = labelCoordinates.x
  var y = labelCoordinates.y - 0.8 * fontSize
  var w = ctx.measureText(label).width
  var h = fontSize
  var ymargin = (h * factor - h)/2
  // Note: we use y margin as x margin too
  // because labels are wider and we want to have
  // a homogeneous margin
  return {
    x: x - ymargin,
    y: y - ymargin,
    width: w + 2*ymargin,
    height: h + 2*ymargin
  }
}

function downloadImageData(imgd, name) {
  // New Canvas
  var newCanvas = document.createElement('canvas')
  newCanvas.width = imgd.width
  newCanvas.height = imgd.height
  var ctx = newCanvas.getContext("2d")

  // Paint imgd
  ctx.putImageData(imgd, 0, 0)

  // Save
  newCanvas.toBlob(function(blob) {
    saveAs(blob, name + ".png");
  })
}


//// LOG
var logTime
function log(txt) {
  console.log(txt)
  logTime = Date.now()
}
function report(txt) {
  var mem = window.performance.memory.usedJSHeapSize
  mem = Math.floor(mem/1024/1024)
  var time = Date.now() - logTime
  time /= 1000
  console.log(txt+"  MEM: "+mem+" Mb  TIME: "+time+" s")
  logTime = Date.now()
}