// Settings:
var iterations = 100

var settings = {}

settings.linLogMode = false
settings.outboundAttractionDistribution = false
settings.adjustSizes = false
settings.edgeWeightInfluence = 0
settings.scalingRatio = 10
settings.strongGravityMode = true
settings.gravity = 0.05
settings.slowDown = 1
settings.barnesHutOptimize = false
settings.barnesHutTheta = 0.5

// Applying a random layout before starting
layout.random.assign(g);

// Applying FA2
layout.forceAtlas2.assign(g, {iterations: iterations, settings: settings});

// Announcing the end
d3.select('#playground').html('Correctly ran ' + iterations + ' ForceAtlas2 iterations.');
