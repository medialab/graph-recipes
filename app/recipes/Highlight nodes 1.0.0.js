// NODES HIGHLIGHT - v0.1
// Backscatter Network Export
//
//  This script generates a network map as a raster image (in pixels)


/// EDIT SETTINGS BELOW

var settings = {}

// Auto-download the image once it is done
settings.save_at_the_end = false

// Image size and resolution
settings.width =  1000 // in pixels
settings.height = 1000 // in pixels

// Zoom:
// You can zoon on a given point of the network
// to focus on a specific detail. It's not very easy to use
// because you must find the right point by trial and error.
// By default, a slight unzoom gives a welcome space on the borders
settings.zoom_enabled = true
settings.zoom_window_size = 1.1 // range from 0 to 1 (dezooms if >1)
settings.zoom_point = {x:0.5, y:0.5} // range from 0 to 1

// Layers:
// Decide which layers are drawn.
// The settings for each layer are below.
settings.draw_background = true
settings.draw_network_shape_fill = true
settings.draw_network_shape_contour = false
settings.draw_cluster_fills = false
settings.draw_cluster_contours = false
settings.draw_cluster_labels = false
settings.draw_edges = true
settings.draw_nodes = true
settings.draw_nodes_highlight = true
settings.draw_node_labels = true

// Layer order variations:
settings.cluster_fill_above_nodes = false

// Layer: Background
// Original Backscatter palette: "#D9D8DA"
// Lighter for more contrast, a little warm: "#e0dcd9"
settings.background_circle = true
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

// Layer: Clusters
//        (a potato per modality of tqrget attribute)
// ...generic structure
settings.cluster_all_modalities = false // By default, we only use modalities specified in "node_clusters"
settings.cluster_spreading = 0.5 // Range: 0.01 to 0.99 // Balanced: 0.5 // Acts on size
settings.cluster_smoothness = 5 // Range: 0 to 10 or more // Makes rounder clusters
// ...cluster fills
settings.cluster_fill_alpha = 1.0 // Opacity // Range from 0 to 1
settings.cluster_fill_color_by_modality = true // if false, use default color below
settings.cluster_fill_color_default = "#8B8B8B"
// ...cluster contours
settings.cluster_contour_thickness = 3 // Range: 0 to 10 or more
settings.cluster_contour_alpha = 1 // Opacity // Range from 0 to 1
settings.cluster_contour_color_by_modality = true // if false, use default color below
settings.cluster_contour_color_default = "#8B8B8B"
// ...cluster labels
settings.cluster_label_font_size = 20 // in pt based on 1MP 72dpi
settings.cluster_label_font_weight = 300
settings.cluster_label_outline_thickness = 4 // in px based on 1MP 72dpi

// Layer: Edges
settings.edge_thickness = 0.3 // in px based on 1MP
settings.edge_alpha = 0.5 // Opacity // Range from 0 to 1
settings.edge_high_quality = false // Halo around nodes // Time-consuming

// Layer: Nodes
settings.node_size = 1 // Factor to adjust the nodes drawing size

// Layer: Nodes highlight
settings.node_highlight_color = "#263238"
settings.node_highlight_stroke = 3 // in px based on 1MP 72dpi
settings.node_highlight_edges = true // Also highlight mutual edges

// Layer: Node labels
settings.label_font_size = 20 // in pt based on 1MP 72dpi
settings.label_font_weight = 500
settings.label_border_thickness = 6

// Main clusters and color code:
// Clusters are defined by the modalities of a given attribute.
// This specifies which is this attribute, and which
// modalities have which colors. You can generate this
// JSON object with the PREPARE script.
settings.node_clusters = {
  "attribute_id": "attr_8",
  "modalities": {
    "Digital industries": {
      "label": "Digital industries",
      "count": 595,
      "color": "#6fc5a4"
    },
    "Arts and Crafts": {
      "label": "Arts and Crafts",
      "count": 298,
      "color": "#f26b6e"
    },
    "Film & TV": {
      "label": "Film & TV",
      "count": 221,
      "color": "#b9a2ce"
    },
    "Advertising, marketing and public relations": {
      "label": "Advertising, marketing and public relations",
      "count": 192,
      "color": "#e8a74b"
    },
    "Architecture;Andet": {
      "label": "Architecture;Andet",
      "count": 182,
      "color": "#658ec9"
    },
    "Fashion and textiles": {
      "label": "Fashion and textiles",
      "count": 160,
      "color": "#ce6028"
    },
    "Design": {
      "label": "Design",
      "count": 159,
      "color": "#f2a5a6"
    },
    "Music": {
      "label": "Music",
      "count": 145,
      "color": "#4aa05b"
    },
    "Advertising, marketing and public relations | Architecture;Andet | Arts and Crafts | Design | Digital industries | Fashion and textiles | Film & TV | Music": {
      "label": "Advertising, marketing and public relations | Architecture;Andet | Arts and Crafts | Design | Digital industries | Fashion and textiles | Film & TV | Music",
      "count": 58,
      "color": "#b65887"
    },
    "Arts and Crafts | Music": {
      "label": "Arts and Crafts | Music",
      "count": 36,
      "color": "#7169af"
    }
  },
  "default_color": "#9d9b99"
}

// List of node identifiers to highlight.
// You can generate it with a script.
settings.highlighted_nodes = [
  "skillsclen_b76fc4fc73f8aef0dd73508884996698",
  "skillsclen_948d1f30a0fada44d35950f6c3882c1a",
  "skillsclen_56b7bb6871857f290078cf83132bec40",
  "skillsclen_af770060e56bfab1432aa5c4c2f7a5db",
  "skillsclen_02cc8dc4d04d5ef6707cf76dbd9c43d3",
  "skillsclen_d10af457daa1deed54e2c36b5f295e7e",
  "skillsclen_c0089e6579593f104f5cce8f8ca3ed0a",
  "skillsclen_c769c2bd15500dd906102d9be97fdceb",
  "skillsclen_9ed083b1436e5f40ef984b28255eef18",
  "skillsclen_fc7020775a7cdf161ab5267985c54601"
]

// Advanced settings
settings.adjust_voronoi_range = 25 // Factor // Larger node halo + slightly bigger clusters
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
  var nodesBySize, modalities, voronoiData, networkShapeImprint, clusterImprints, centroidsByModality
  if (settings.draw_nodes || settings.draw_node_labels) {
    nodesBySize = precomputeNodesBySize()
  }
  if ( settings.draw_network_shape_fill
    || settings.draw_network_shape_contour
    || settings.draw_cluster_fills
    || settings.draw_cluster_contours
    || settings.draw_cluster_labels
    || (settings.draw_edges && settings.edge_high_quality)
  ) {
      voronoiData = precomputeVoronoi()
  }
  if ( settings.draw_network_shape_fill
    || settings.draw_network_shape_contour
  ) {
    networkShapeImprint = precomputeNetworkShapeImprint(voronoiData)
  }
  if ( settings.draw_cluster_fills
    || settings.draw_cluster_contours
    || settings.draw_cluster_labels
  ) {
    if (settings.cluster_all_modalities) {
      modalities = precomputeModalities()
    } else {
      modalities = d3.keys(settings.node_clusters.modalities)
    }
    clusterImprints = precomputeClusterImprints(modalities, voronoiData, settings.node_clusters.attribute_id)
  }
  if (settings.draw_cluster_labels) {
    centroidsByModality = precomputeCentroids(ctx, modalities, clusterImprints)
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

  // Draw cluster fills (under nodes)
  if (settings.draw_cluster_fills && !settings.cluster_fill_above_nodes) {
    layeredImage = drawLayerOnTop(layeredImage,
      drawClustersFillLayer(ctx, clusterImprints, modalities)
    )
  }

  // Draw edges
  if (settings.draw_edges) {
    layeredImage = drawLayerOnTop(layeredImage,
      drawEdgesLayer(ctx, voronoiData)
    )
  }

  // Draw nodes
  if (settings.draw_nodes) {
    layeredImage = drawLayerOnTop(layeredImage,
      drawNodesLayer(ctx, nodesBySize)
    )
  }

  // Draw cluster contours
  if (settings.draw_cluster_contours) {
    layeredImage = drawLayerOnTop(layeredImage,
      drawClustersContourLayer(ctx, clusterImprints, modalities)
    )
  }

  // Draw node highlights
  if (settings.draw_nodes_highlight) {
    layeredImage = drawLayerOnTop(layeredImage,
      drawNodesHighlightLayer(ctx)
    )
  }

  // Draw node labels
  if (settings.draw_node_labels) {
    layeredImage = drawLayerOnTop(layeredImage,
      drawNodeLabelsLayer(ctx, nodesBySize)
    )
  }  

  // Draw cluster fills (above nodes)
  if (settings.draw_cluster_fills && settings.cluster_fill_above_nodes) {
    layeredImage = drawLayerOnTop(layeredImage,
      drawClustersFillLayer(ctx, clusterImprints, modalities)
    )
  }

  // Draw cluster labels
  if (settings.draw_cluster_labels) {
    layeredImage = drawLayerOnTop(layeredImage,
      drawClusterLabelsLayer(ctx, modalities, centroidsByModality)
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
  options.voronoi_range = settings.adjust_voronoi_range * options.width * options.height / Math.min(options.width,options.height) / g.order / settings.zoom_window_size
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

function precomputeClusterImprints(modalities, voronoiData, attId) {
  var options = {
    // Steps
    step_blur: true,
    step_contrast: true,
    step_contrast_adjust_spread: true,
    
    voronoi_paint_distance: true,
    blur_radius: 0.01 * settings.cluster_smoothness * Math.min(voronoiData.width, voronoiData.height) / settings.zoom_window_size,
    contrast_steepness: Infinity, // More = more abrupt contour. ex: 0.03 for a slight gradient
    contrast_threshold: 0.15, // At which alpha level it "finds" the cluster (must remain low)
    contrast_postprocessing_threshold: 1-settings.cluster_spreading, // Idem on a secondary pass
    contrast_postprocessing_blur_radius: 0.03 * Math.min(voronoiData.width, voronoiData.height) / settings.zoom_window_size,
  }

  var imprintsByModality = {}
  modalities.forEach(function(modality, i){
    log("Precompute cluster shape for "+modality+"...")

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
      if (vid > 0 && g.getNodeAttribute(voronoiData.nodesIndex[vid], attId) == modality) {
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
    imprintsByModality[modality] = imgd
  })
  return imprintsByModality
}

function precomputeCentroids(ctx, modalities, clusterImprints) {
  var centroidsByModality = {}
  modalities.forEach(function(modality, i){
    log("Precompute cluster centroid for "+modality+"...")

    var imgd_src = clusterImprints[modality]
    var backup_centroid = findCentroid(imgd_src, modality)

    // Clone image data
    var imgd = ctx.createImageData(imgd_src.width, imgd_src.height);
    imgd.data.set(imgd_src.data)

    var pix = imgd.data
    var i, pixlen, pix2

    // Remove each other cluster imprint from this imprint
    var m2, imgd2
    for (m2 in clusterImprints) {
      if (m2 != modality) {
        imgd2 = clusterImprints[m2]
        pix2 = imgd2.data
        for ( i = 0, pixlen = pix.length; i < pixlen; i += 4 ) {
          pix[i+3] = Math.max(0, pix[i+3] - pix2[i+3])
        }
      }
    }

    var centroid = findCentroid(imgd, modality)
    if (centroid[0]) {
      centroidsByModality[modality] = centroid
    } else {
      centroidsByModality[modality] = backup_centroid
    }
    report("...done.")
  })
  return centroidsByModality
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

function drawClustersFillLayer(ctx, clusterImprints, modalities) {
  return mergeLayers(modalities.map(function(modality, i){
    log("Draw cluster fill for "+modality+"...")

    // Clear canvas
    ctx.clearRect(0, 0, settings.width, settings.height)

    // Draw and rescale the imprint if necessary
    var imgd
    var ratio = settings.width/settings.max_voronoi_size
    if (ratio>1) {
      var canvas2=document.createElement("canvas")
      canvas2.width=settings.width
      canvas2.height=settings.height
      var ctx2=canvas2.getContext("2d")
      ctx2.putImageData(clusterImprints[modality], 0, 0)
      ctx.scale(ratio, ratio)
      ctx.drawImage(ctx2.canvas,0,0)
      imgd = ctx.getImageData(0, 0, settings.width, settings.height)
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      imgd = processRescaledImprint(imgd)
    } else {
      imgd = clusterImprints[modality]
    }

    var color
    if (settings.cluster_fill_color_by_modality) {
      color = settings.node_clusters.default_color || settings.cluster_fill_color_default || "#444"
      if (settings.node_clusters.modalities[modality]) {
        color = settings.node_clusters.modalities[modality].color
      }
    } else {
      color = settings.cluster_fill_color_default
    }
    var pix = imgd.data
    var rgb = d3.color(color)
    var i, pixlen
    for ( i = 0, pixlen = pix.length; i < pixlen; i += 4 ) {
      pix[i  ] = rgb.r // red
      pix[i+1] = rgb.g // green
      pix[i+2] = rgb.b // blue
      pix[i+3] = Math.floor(settings.cluster_fill_alpha * pix[i+3]) // alpha
    }

    // Convolute: slight blur (for antialiasing)
    imgd = convolute(imgd,
    [  0, .1,  0,
      .1, .6, .1,
       0, .1,  0 ]
    )

    report("...done.")
    return imgd
  }))
}

function drawClustersContourLayer(ctx, clusterImprints, modalities) {
  return mergeLayers(modalities.map(function(modality, i){
    log("Draw cluster contour for "+modality+"...")

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
      ctx2.putImageData(clusterImprints[modality], 0, 0)
      ctx.scale(ratio, ratio)
      ctx.drawImage(ctx2.canvas,0,0)
      imgd = ctx.getImageData(0, 0, settings.width, settings.height)
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      imgd = processRescaledImprint(imgd)
    } else {
      imgd = clusterImprints[modality]
    }

    var color
    if (settings.cluster_contour_color_by_modality) {
      color = settings.node_clusters.default_color || settings.cluster_contour_color_default || "#444"
      if (settings.node_clusters.modalities[modality]) {
        color = settings.node_clusters.modalities[modality].color
      }
    } else {
      color = settings.cluster_contour_color_default
    }

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
    for ( var i=1; i<settings.cluster_contour_thickness*Math.min(settings.width, settings.height) / 1000 / settings.zoom_window_size; i++) {
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
      pix[i+3] = Math.floor(settings.cluster_contour_alpha * pix[i+3]) // alpha
    }

    report("...done.")
    return imgd
  }))
}

function drawEdgesLayer(ctx, voronoiData) {
  log("Draw edges...")
  var options = {}
  options.display_voronoi = false // for monitoring purpose
  options.display_edges = true // disable for monitoring purpose
  options.max_edge_count = Infinity // for monitoring only
  options.edge_thickness = settings.edge_thickness*Math.min(settings.width, settings.height) / 1000
  options.edge_alpha = settings.edge_alpha
  options.edge_color = "#FFF"
  options.node_halo = settings.edge_high_quality

  var gradient = function(d){
    return 0.5 + 0.5 * Math.cos(Math.PI - Math.pow(d, 2) * Math.PI)
  }

  var dPixelMap_u, vidPixelMap_u
  if (options.display_voronoi || options.node_halo) {
    // Unpack voronoi
    var ratio = Math.max(1, settings.width/settings.max_voronoi_size)

    if (g.order < 255) {
      vidPixelMap_u = new Uint8Array(settings.width * settings.height)
    } else if (g.order < 65535) {
      vidPixelMap_u = new Uint16Array(settings.width * settings.height)
    } else {
      vidPixelMap_u = new Uint32Array(settings.width * settings.height)
    }
    dPixelMap_u = new Uint8Array(settings.width * settings.height)

    var xu, yu, xp, xp1, xp2, dx, yp, yp1, yp2, dy, ip_top_left, ip_top_right, ip_bottom_left, ip_bottom_right
    for (var i=0; i<vidPixelMap_u.length; i++) {
      // unpacked coordinates
      xu = i%settings.width
      yu = (i-xu)/settings.width
      // packed coordinates
      xp = xu/ratio
      xp1 = Math.max(0, Math.min(voronoiData.width-1, Math.floor(xp)))
      xp2 = Math.max(0, Math.min(voronoiData.width-1, Math.ceil(xp)))
      dx = (xp-xp1)/(xp2-xp1) || 0
      yp = yu/ratio
      yp1 = Math.max(0, Math.min(voronoiData.height-1, Math.floor(yp)))
      yp2 = Math.max(0, Math.min(voronoiData.height-1, Math.ceil(yp)))
      dy = (yp-yp1)/(yp2-yp1) || 0
      // coordinates of the 4 pixels necessary to rescale
      ip_top_left = xp1 + voronoiData.width * yp1
      ip_top_right = xp2 + voronoiData.width * yp1
      ip_bottom_left = xp1 + voronoiData.width * yp2
      ip_bottom_right = xp2 + voronoiData.width * yp2
      // Rescaling (gradual blending between the 4 pixels)
      dPixelMap_u[i] =
          (1-dx) * (
            (1-dy) * voronoiData.dPixelMap[ip_top_left]
            +  dy  * voronoiData.dPixelMap[ip_bottom_left]
          )
        + dx * (
            (1-dy) * voronoiData.dPixelMap[ip_top_right]
            +  dy  * voronoiData.dPixelMap[ip_bottom_right]
          )
      // For vid we use only one (it's not a number but an id)
      if (dx<0.5) {
        if (dy<0.5) {
          vidPixelMap_u[i] = voronoiData.vidPixelMap[ip_top_left]
        } else {
          vidPixelMap_u[i] = voronoiData.vidPixelMap[ip_bottom_left]
        }
      } else {
        if (dy<0.5) {
          vidPixelMap_u[i] = voronoiData.vidPixelMap[ip_top_right]
        } else {
          vidPixelMap_u[i] = voronoiData.vidPixelMap[ip_bottom_right]
        }
      }
    }

  }

  // Clear canvas
  ctx.clearRect(0, 0, settings.width, settings.height)

  if (options.display_voronoi) {
    console.log("...Draw voronoi (for monitoring)...")
    var size = 1 // <- edit me (tradeoff memory / quality)
    var x, y
    for (x=0; x<settings.width; x+=size) {
      for (y=0; y<settings.height; y+=size) {
        var pixi = Math.floor(x) + settings.width * Math.floor(y)
        var d = dPixelMap_u[pixi]/255
        var c = d3.color("#000")
        if (d < Infinity) {
          c.opacity = gradient(dPixelMap_u[pixi]/255)
        }
        ctx.fillStyle = c.toString()
        ctx.fillRect(x, y, size, size)
      }
    }
  }

  // Draw each edge
  if (options.display_edges) {
    ctx.lineCap="round"
    ctx.lineJoin="round"
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.lineWidth = options.edge_thickness
    g.edges()
      .filter(function(eid, i_){ return i_ < options.max_edge_count })
      .forEach(function(eid, i_){
      if ((i_+1)%10000 == 0) {
        console.log("..."+(i_+1)/1000+"K edges drawn...")
      }
      var ns = g.getNodeAttributes(g.source(eid))
      var nt = g.getNodeAttributes(g.target(eid))
      var color = d3.color(options.edge_color)
      var path, i, x, y, o, pixi, pi=0

      if (options.node_halo) {
        var d = Math.sqrt(Math.pow(ns.x - nt.x, 2) + Math.pow(ns.y - nt.y, 2))

        // Build path
        var iPixStep = Math.max(1.5, 0.7*options.edge_thickness)
        var l = Math.ceil(d/iPixStep)
        path = new Uint16Array(3*l)
        for (i=0; i<1; i+=iPixStep/d) {
          x = (1-i)*ns.x + i*nt.x
          y = (1-i)*ns.y + i*nt.y

          // Opacity
          pixi = Math.floor(x) + settings.width * Math.floor(y)
          if (vidPixelMap_u[pixi] == ns.vid || vidPixelMap_u[pixi] == nt.vid) {
            o = 1
          } else {
            o = gradient(dPixelMap_u[pixi]/255)
          }
          path[pi  ] = x
          path[pi+1] = y
          path[pi+2] = Math.round(o*255)
          pi +=3
        }
        path[3*(l-1)  ] = nt.x
        path[3*(l-1)+1] = nt.y
        path[3*(l-1)+2] = 255

        // Smoothe path
        if (path.length > 5) {
          for (i=2; i<path.length-2; i++) {
            path[i*3+2] = 0.15 * path[(i-2)*3+2] + 0.25 * path[(i-1)*3+2] + 0.2 * path[i*3+2] + 0.25 * path[(i+1)*3+2] + 0.15 * path[(i+2)*3+2]
          }
        }
      } else {
        path = new Uint16Array(6)
        path[0] = ns.x
        path[1] = ns.y
        path[2] = 255
        path[3] = nt.x
        path[4] = nt.y
        path[5] = 255
      }
      
      // Draw path
      var x, y, o, lastx, lasty, lasto
      for (i=0; i<path.length; i+=3) {
        x = path[i]
        y = path[i+1]
        o = path[i+2]/255

        if (lastx) {
          color.opacity = (lasto+o)/2
          ctx.beginPath()
          ctx.strokeStyle = color.toString()
          ctx.moveTo(lastx, lasty)
          ctx.lineTo(x, y)
          ctx.stroke()
          ctx.closePath()
        }

        lastx = x
        lasty = y
        lasto = o
      }
    })
  }

  report("...done.")
  return multiplyAlpha(
    ctx.getImageData(0, 0, settings.width, settings.height),
    options.edge_alpha
  )
}

function drawNodesLayer(ctx, nodesBySize) {
  log("Draw nodes...")

  var options = {}
  options.node_stroke = true
  options.node_stroke_width = 0.5 * Math.min(settings.width, settings.height)/1000

  // Clear canvas
  ctx.clearRect(0, 0, settings.width, settings.height)

  nodesBySize.forEach(function(nid){
    var n = g.getNodeAttributes(nid)

    var modality = settings.node_clusters.modalities[n[settings.node_clusters.attribute_id]]
    var color
    if (modality) {
      color = modality.color
    } else {
      color = settings.node_clusters.default_color || "#8B8B8B"
    }

    var radius = Math.max(settings.node_size * n.size, 0.7)

    ctx.lineCap="round"
    ctx.lineJoin="round"

    if (options.node_stroke) {
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

  report("...done.")
  return ctx.getImageData(0, 0, settings.width, settings.height)
}

function drawNodesHighlightLayer(ctx) {
  log("Draw nodes highlight...")

  var options = {}
  options.stroke_width = settings.node_highlight_stroke * Math.min(settings.width, settings.height)/1000
  options.offset = settings.node_highlight_stroke * Math.min(settings.width, settings.height)/1000
  options.stroke_color = settings.node_highlight_color
  options.highlight_edges = settings.node_highlight_edges

  // Clear canvas
  ctx.clearRect(0, 0, settings.width, settings.height)

  // Build nodes highlight index
  var nodeFilterIndex = {}
  settings.highlighted_nodes.forEach(function(nid){
    nodeFilterIndex[nid] = true
  })

  // Edges
  if (options.highlight_edges) {
    g.edges().forEach(function(eid){
      var nsid = g.source(eid)
      var ntid = g.target(eid)
      if (nodeFilterIndex[nsid] && nodeFilterIndex[ntid]) {
        var ns = g.getNodeAttributes(nsid)
        var nt = g.getNodeAttributes(ntid)
        ctx.beginPath()
        ctx.lineCap="round"
        ctx.lineJoin="round"
        ctx.strokeStyle = options.stroke_color
        ctx.fillStyle = 'rgba(0, 0, 0, 0)';
        ctx.lineWidth = options.stroke_width
        ctx.moveTo(ns.x, ns.y)
        ctx.lineTo(nt.x, nt.y)
        ctx.stroke()
        ctx.closePath()
      }
    })
  }

  // Draw outer
  settings.highlighted_nodes.forEach(function(nid){
    var n = g.getNodeAttributes(nid)

    var radius = Math.max(settings.node_size * n.size, 2) + options.offset + options.stroke_width

    ctx.lineCap="round"
    ctx.lineJoin="round"

    ctx.beginPath()
    ctx.arc(n.x, n.y, radius, 0, 2 * Math.PI, false)
    ctx.lineWidth = 0
    ctx.fillStyle = options.stroke_color
    ctx.shadowColor = 'transparent'
    ctx.fill()
  })

  // Draw inner
  ctx.globalCompositeOperation = "destination-out";
  settings.highlighted_nodes.forEach(function(nid){
    var n = g.getNodeAttributes(nid)

    var radius = Math.max(settings.node_size * n.size, 2) + options.offset

    ctx.lineCap="round"
    ctx.lineJoin="round"

    ctx.beginPath()
    ctx.arc(n.x, n.y, radius, 0, 2 * Math.PI, false)
    ctx.lineWidth = 0
    ctx.fillStyle = "#FFF"
    ctx.shadowColor = 'transparent'
    ctx.fill()
  })
  ctx.globalCompositeOperation = "source-over";

  report("...done.")
  return ctx.getImageData(0, 0, settings.width, settings.height)
}

function drawNodeLabelsLayer(ctx, nodesBySize_) {
  log("Draw node labels...")
  var options = {}
  options.draw_labels = true
  options.label_count = Infinity
  options.label_color = settings.node_highlight_color
  options.label_spacing_factor = 1.5 // 1=normal; 2=box twice as wide/high etc.
  options.font_family = 'IBM Plex Sans Condensed, sans-serif'
  options.font_size = settings.label_font_size * Math.min(settings.width, settings.height)/1000
  options.font_weight = settings.label_font_weight
  options.border_thickness = settings.label_border_thickness * Math.min(settings.width, settings.height)/1000
  options.border_color = settings.background_color
  options.pixmap_size = 1 + Math.floor(0.3 * options.font_size)
  options.offset = 2 * settings.node_highlight_stroke * Math.min(settings.width, settings.height)/1000
  var i, x, y

  // Clear canvas
  ctx.clearRect(0, 0, settings.width, settings.height)

  // Reverse nodes by size order
  var nodesBySize = nodesBySize_.splice(0)
  nodesBySize.reverse()

  // Build nodes highlight index
  var nodeFilterIndex = {}
  settings.highlighted_nodes.forEach(function(nid){
    nodeFilterIndex[nid] = true
  })

  // Filter nodes by size
  nodesBySize = nodesBySize.filter(function(nid){
    return !!nodeFilterIndex[nid]
  })

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

        var radius = Math.max(settings.node_size * n.size, 2)

        var labelCoordinates = {
          x: nx + 0.6 * options.border_thickness + 1.05 * radius + options.offset,
          y: ny + 0.25 * options.font_size
        }

        var label = n.label.replace(/^https*:\/\/(www\.)*/gi, '')

        ctx.font = options.font_weight + " " + options.font_size + "px " + options.font_family
        ctx.lineWidth = options.border_thickness

        // Bounding box
        var bbox = getBBox(ctx, options.font_size, labelCoordinates, label, options.label_spacing_factor)

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
          ctx.fillStyle = options.label_color
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

function drawClusterLabelsLayer(ctx, modalities, centroidsByModality) {
  log("Draw cluster labels...")

  var options = {}
  options.draw_text_anchor = false // for monitoring purpose
  options.draw_label = true // idem
  options.font_size = settings.cluster_label_font_size * Math.min(settings.width, settings.height) / 1000
  options.font_weight = 300
  options.font_family = "'IBM Plex Sans Condensed', sans-serif"
  options.border_thickness = 2*settings.cluster_label_outline_thickness * Math.min(settings.width, settings.height) / 1000
  options.border_color = function(c){return c.toString()}
  options.label_color = function(c){return "#FFF"}

  // Clear canvas
  ctx.clearRect(0, 0, settings.width, settings.height)

  var ratio = settings.width/settings.max_voronoi_size

  modalities.forEach(function(modality, i){
    var color = settings.node_clusters.default_color || "#444"
    if (settings.node_clusters.modalities[modality]) {
      color = settings.node_clusters.modalities[modality].color
    }

    var centroid = centroidsByModality[modality]
    if (ratio>1) {
      centroid = centroid.map(function(d){
        return d*ratio
      })
    }
    if ( !isNaN(centroid[0]) && !isNaN(centroid[1]) ) {

      var label = modality
      if (settings.node_clusters[modality] && settings.node_clusters[modality].label) {
        label = settings.node_clusters[modality].label
      }
      var x = centroid[0]
      var y = centroid[1]
      
      if (options.draw_label) {
        ctx.font = options.font_weight + " italic " + options.font_size+"px "+options.font_family
        ctx.lineCap="round"
        ctx.lineJoin="round"
        ctx.lineWidth = options.border_thickness
        ctx.fillStyle = options.border_color(color)
        ctx.strokeStyle = options.border_color(color)
        ctx.textAlign = "center"
        ctx.fillText(
          label
        , x
        , y + 0.4*options.font_size
        )
        ctx.strokeText(
          label
        , x
        , y + 0.4*options.font_size
        )
        ctx.lineWidth = 0
        ctx.fillStyle = options.label_color(color)
        ctx.fillText(
          label
        , x
        , y + 0.4*options.font_size
        )
      }

      if (options.draw_text_anchor) {
        ctx.beginPath()
        ctx.arc(x, y, 10, 0, 2 * Math.PI, false)
        ctx.lineWidth = 0
        ctx.fillStyle = "#000"
        ctx.shadowColor = 'transparent'
        ctx.fill()
        ctx.beginPath()
        ctx.arc(x, y, 4, 0, 2 * Math.PI, false)
        ctx.lineWidth = 0
        ctx.fillStyle = options.border_color(color)
        ctx.shadowColor = 'transparent'
        ctx.fill()
      }
    }
  })
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
  if (window.performance && window.performance.memory) {
    var mem = window.performance.memory.usedJSHeapSize
    mem = Math.floor(mem/1024/1024)
    txt += " MEM: "+mem+" Mb"
  }
  if (logTime) {
    var time = Date.now() - logTime
    time /= 1000
    txt += " TIME: "+time+" s"
  }
  console.log(txt)
  logTime = Date.now()
}