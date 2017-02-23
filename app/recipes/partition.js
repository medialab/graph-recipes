// Note: works on directed networks only for now
var settings = {}

// Feel free to edit following settings

// WHICH NODE ATTRIBUTE TO ANALYZE?
settings.attribute = 'Language' // This only works for the demo network

// --- (end of settings)

// Look at the types of values
var attData = {}
attData.types = {}
g.nodes().forEach(function(nid){
	var t = getType(g.getNodeAttribute(nid, settings.attribute))
	attData.types[t] = (attData.types[t] || 0) + 1
})

// Guess type of the attribute
var types = attData.types
if (types.string !== undefined) {
	attData.type = 'string'
} else if (types.float !== undefined) {
	attData.type = 'float'
} else if (types.integer !== undefined) {
	attData.type = 'integer'
} else {
	attData.type = 'error'
}

// Aggregate distribution of values
attData.valuesIndex = {}
g.nodes().forEach(function(nid){
	var n = g.getNodeAttributes(nid)
	if (attData.valuesIndex[n[settings.attribute]]) {
		attData.valuesIndex[n[settings.attribute]].nodes++
	} else {
		attData.valuesIndex[n[settings.attribute]] = {nodes: 1}
	}
})
attData.values = d3.keys(attData.valuesIndex)
var valuesCounts = d3.values(attData.valuesIndex).map(function(d){return d.nodes})
attData.distributionStats = {}
attData.distributionStats.differentValues = valuesCounts.length
attData.distributionStats.sizeOfSmallestValue = d3.min(valuesCounts)
attData.distributionStats.sizeOfBiggestValue = d3.max(valuesCounts)
attData.distributionStats.medianSize = d3.median(valuesCounts)
attData.distributionStats.deviation = d3.deviation(valuesCounts)
attData.distributionStats.valuesUnitary = valuesCounts.filter(function(d){return d==1}).length
attData.distributionStats.valuesAbove1Percent = valuesCounts.filter(function(d){return d>=g.order*0.01}).length
attData.distributionStats.valuesAbove10Percent = valuesCounts.filter(function(d){return d>=g.order*0.1}).length

// Count edge flow
attData.valueFlow = {}
attData.values.forEach(function(v1){
	attData.valueFlow[v1] = {}
	attData.values.forEach(function(v2){
		attData.valueFlow[v1][v2] = {count: 0, expected: 0, nd:0}
	})
})
g.edges().forEach(function(eid){ // Edges count
	var nsid = g.source(eid)
	var ntid = g.target(eid)
	attData.valueFlow[g.getNodeAttribute(nsid, settings.attribute)][g.getNodeAttribute(ntid, settings.attribute)].count++
})
// For normalized density, we use the same version as the one used in Newmans' Modularity
// Newman, M. E. J. (2006). Modularity and community structure in networks. Proceedings of the National Academy of …, 103(23), 8577–8582. http://doi.org/10.1073/pnas.0601602103
// Here, for a directed network
g.nodes().forEach(function(nsid){
	g.nodes().forEach(function(ntid){
		var expected = g.outDegree(nsid) * g.inDegree(ntid) / (2 * g.size)
		attData.valueFlow[g.getNodeAttribute(nsid, settings.attribute)][g.getNodeAttribute(ntid, settings.attribute)].expected += expected
	})
})
attData.values.forEach(function(v1){
	attData.values.forEach(function(v2){
		attData.valueFlow[v1][v2].nd = ( attData.valueFlow[v1][v2].count - attData.valueFlow[v1][v2].expected ) / (4 * g.size) 
	})
})

// Value stats related to connectivity
attData.values.forEach(function(v){
	attData.valuesIndex[v].internalLinks = attData.valueFlow[v][v].count
	attData.valuesIndex[v].internalNDensity = attData.valueFlow[v][v].nd

	attData.valuesIndex[v].inboundLinks = d3.sum(attData.values
			.filter(function(v2){ return v2 != v})
			.map(function(v2){ return attData.valueFlow[v2][v].count })
		)

	attData.valuesIndex[v].inboundNDensity = d3.sum(attData.values
			.filter(function(v2){ return v2 != v})
			.map(function(v2){ return attData.valueFlow[v2][v].nd })
		)

	attData.valuesIndex[v].outboundLinks = d3.sum(attData.values
			.filter(function(v2){ return v2 != v})
			.map(function(v2){ return attData.valueFlow[v][v2].count })
		)

	attData.valuesIndex[v].outboundNDensity = d3.sum(attData.values
			.filter(function(v2){ return v2 != v})
			.map(function(v2){ return attData.valueFlow[v][v2].nd })
		)

	attData.valuesIndex[v].externalLinks = attData.valuesIndex[v].inboundLinks + attData.valuesIndex[v].outboundLinks
	attData.valuesIndex[v].externalNDensity = attData.valuesIndex[v].inboundNDensity + attData.valuesIndex[v].outboundNDensity

})

// Global statistics
attData.stats = {}

// Modularity (based on previous computations)
attData.stats.modularity = 0
attData.values.forEach(function(v1){
	attData.values.forEach(function(v2){
		if (v1==v2) {
			attData.stats.modularity += attData.valueFlow[v1][v2].nd
		} else {
			attData.stats.modularity -= attData.valueFlow[v1][v2].nd
		}
	})
})

console.log('Attribute data', attData)

// Build HTML report
var div = d3.select('#playground').append('div')

// Section 1 : General properties
div.append('h1').text('General properties of '+settings.attribute)

// Values distribution
div.append('h3').text('Distribution of values')
div.append('p')
	.style('width', '600px')
	.text(
		'How many nodes for each ' + settings.attribute + '? '+
		'The size of these groups is an important contextual information for the other metrics of this page.'
	)
drawValuesDistribution(div, attData)

// Group to Group Edge Count
div.append('h3').text('Group to Group Edge Count')
div.append('p')
	.style('width', '600px')
	.text(
		'This matrix displays how many edges there are from a group to another (or possibly the same). '+
		'The groups are defined by nodes having the same '+settings.attribute+'. '+
		'The sum of all values is the size of the network, ie. its total number of edges. '+
		'Note that bigger groups naturally get more links. '+
		'Columns are ordered by group size.'
	)
drawFlowMatrix(div, attData)

// Group to Group Normalized Density
div.append('h3').text('Group to Group Normalized Density')
div.append('p')
	.style('width', '600px')
	.html(
		'This matrix displays how many edges there are from a group to another (or the same) <i>versus</i> the expected number of edges. '+
		'We call it normalized density by analogy with traditional edge density, which is the actual number of edges versus the potential number of edges. '+
		'The version presented here uses Mark Newman\'s formula of modularity. '+
		'Normalized density can therefore be interpreted as the contribution of each pair of groups to modularity. '+
		'Values on the diagonal (green) contribute positively while others (red) contribute negatively. More details below.'
	)
drawNormalizedDensityMatrix(div, attData)
div.append('p')
	.style('width', '600px')
	.html(
		'The formula for this normalized density is this one:'
	)
div.append('p')
	.style('width', '600px')
	.html(
		'<i>D = 1/(4*m) + Sum[Aij - ki*kj/(2*m)]</i>'
	)
div.append('p')
	.style('width', '600px')
	.html(
		'Where <i>i</i> is a node from group 1 and <i>j</i> from group 2, <i>m</i> is the size of the network (edges count), '+
		'<i>Aij = 1</i> if there is an edge from <i>i</i> to <i>j</i> and 0 else, <i>ki</i> is the outdegree of <i>i</i> and <i>kj</i> the indegree of <i>j</i>.'
	)
div.append('p')
	.style('width', '600px')
	.html(
		'This formula is adapted from this paper: <i>Newman, M. E. J. (2006). Modularity and community structure in networks. Proceedings of the National Academy of …, 103(23), 8577–8582. <a href="http://doi.org/10.1073/pnas.0601602103" target="_blank">http://doi.org/10.1073/pnas.0601602103</a></i>'	
	)
div.append('p')
	.style('width', '600px')
	.html(
		'The rationale for using this metric is that is less sensitive to group sizes (the very same idea behind modularity). Raw edge count emphasizes big groups. '+
		'On the contrary, traditional density emphasizes small clusters. Normalized density works on any cluster size.'
	)
div.append('p')
	.style('width', '600px')
	.html(
		'<strong>Modularity = ' + attData.stats.modularity.toFixed(3) + '</strong> for the ' + settings.attribute + ' partitioning. '+
		'Modularity is literally the sum of normalized densities inside a same group (green circles) '+
		'minus the sum of normalized densities from one group to another (red circles). '+
		'Big green circles indicate the most dense groups. Big red circles are remarkable amounts of links from one group to another (taking into account the size of groups).'
	)

// Section 2 : Properties of each group
div.append('h1').text('Properties of each group')

// Rank values by count
var sortedValues = attData.values.slice(0).sort(function(v1, v2){
	return attData.valuesIndex[v2].nodes - attData.valuesIndex[v1].nodes
})
sortedValues.forEach(function(v){
	div.append('h2').text(settings.attribute + ' = ' + v)

	// Internal versus External
	div.append('h3').text('Normalized Density Profile')
	div.append('p')
		.style('width', '600px')
		.text(
			'Compare internal to external connectivity. Normalized density is used to eliminate group size bias.'
		)
	drawValueInternalExternal(div, attData, v)

	// Inbound versus Outbound
	div.append('h3').text('Connectivity Skewness')
	div.append('p')
		.style('width', '600px')
		.text(
			'Compare inbound links to outbound links (internal not included). ' +
			'Being cited is usually considered more favorable than citing.'
		)
	drawValueInboundOutbound(div, attData, v)

})

// ---
// Functions

function getType(str){
	// Adapted from http://stackoverflow.com/questions/16775547/javascript-guess-data-type-from-string
  if (typeof str !== 'string') str = str.toString();
  var nan = isNaN(Number(str));
  var isfloat = /^\d*(\.|,)\d*$/;
  var commaFloat = /^(\d{0,3}(,)?)+\.\d*$/;
  var dotFloat = /^(\d{0,3}(\.)?)+,\d*$/;
  if (!nan){
      if (parseFloat(str) === parseInt(str)) return "integer";
      else return "float";
  }
  else if (isfloat.test(str) || commaFloat.test(str) || dotFloat.test(str)) return "float";
  else return "string";
}

function drawValuesDistribution(container, attData) {
	
	// Rank values by count
	var sortedValues = attData.values.slice(0).sort(function(v1, v2){
		return attData.valuesIndex[v1].nodes - attData.valuesIndex[v2].nodes
	})

	var barHeight = 32
	var margin = {top: 24, right: 120, bottom: 24, left: 120}
	var width = 600  - margin.left - margin.right
	var height = barHeight * attData.values.length

	var x = d3.scaleLinear().range([0, width])

	var y = d3.scaleBand().rangeRound([height, 0]).padding(.05)

	var xAxis = d3.axisBottom()
	    .scale(x)
	    .ticks(10)

	var yAxis = d3.axisLeft()
	    .scale(y)

	var svg = container.append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	  .append("g")
	    .attr("transform", 
          "translate(" + margin.left + "," + margin.top + ")")

  x.domain([0, d3.max(sortedValues, function(v) { return attData.valuesIndex[v].nodes })])
  y.domain(sortedValues)

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .selectAll("text")
	    .attr("font-family", "sans-serif")
	    .attr("font-size", "12px")
	    .attr("fill", 'rgba(0, 0, 0, 0.5)')

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .selectAll("text")
	    .attr("font-family", "sans-serif")
	    .attr("font-size", "12px")
	    .attr("fill", 'rgba(0, 0, 0, 0.5)')

  var bar = svg.selectAll("bar")
      .data(sortedValues)
    .enter().append('g')
    	.attr("class", "bar")

  bar.append("rect")
	    .style("fill", 'rgba(120, 120, 120, 0.5)')
	    .attr("x", 0)
	    .attr("y", function(v) { return y(v) })
	    .attr("width", function(v) { return x(attData.valuesIndex[v].nodes) })
	    .attr("height", y.bandwidth())

  bar.append('text')
  		.attr('x', function(v) { return 6 + x(attData.valuesIndex[v].nodes) })
  		.attr('y', function(v) { return y(v) + 12 })
  		.attr('font-family', 'sans-serif')
	    .attr('font-size', '10px')
	    .attr('fill', 'rgba(0, 0, 0, 0.8)')
	    .text(function(v){ return attData.valuesIndex[v].nodes + ' nodes'})

  bar.append('text')
  		.attr('x', function(v) { return 6 + x(attData.valuesIndex[v].nodes) })
  		.attr('y', function(v) { return y(v) + 24 })
  		.attr('font-family', 'sans-serif')
	    .attr('font-size', '10px')
	    .attr('fill', 'rgba(0, 0, 0, 0.8)')
	    .text(function(v){ return Math.round(100 * attData.valuesIndex[v].nodes / g.order) + '%'})
}

function drawFlowMatrix(container, attData) {
	// Compute crossings
	var crossings = []
	var v1
	var v2
	for (v1 in attData.valueFlow) {
		for (v2 in attData.valueFlow[v1]) {
			crossings.push({
				v1: v1,
				v2: v2,
				count: attData.valueFlow[v1][v2].count
			})
		}
	}

	// Rank values by count
	var sortedValues = attData.values.sort(function(v1, v2){
		return attData.valuesIndex[v2].nodes - attData.valuesIndex[v1].nodes
	})
	var valueRanking = {}
	sortedValues.forEach(function(v, i){
		valueRanking[v] = i
	})

	// Draw SVG
	var maxR = 32
	var margin = {top: 120 + maxR, right: 24 + maxR, bottom: 24 + maxR, left: 120 + maxR}
	var width = 2 * maxR * (attData.values.length - 1)
	var height = width // square space

	var x = d3.scaleLinear()
	  .range([0, width]);

	var y = d3.scaleLinear()
	  .range([0, height]);

	var size = d3.scaleLinear()
	  .range([0, 0.95 * maxR])
	var a = function(r){
	  return Math.PI * Math.pow(r, 2)
	}

	var r = function(a){
	  return Math.sqrt(a/Math.PI)
	}

	x.domain([0, attData.values.length - 1])
	y.domain([0, attData.values.length - 1])
	size.domain(d3.extent(crossings, function(d){return r(d.count)}))

	var svg = container.append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	  .append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	// Horizontal lines
	svg.selectAll('line.h')
	    .data(attData.values)
	  .enter().append('line')
	    .attr('class', 'h')
	    .attr('x1', 0)
	    .attr('y1', function(d){ return y(valueRanking[d]) })
	    .attr('x2', width)
	    .attr('y2', function(d){ return y(valueRanking[d]) })
	    .style("stroke", 'rgba(0, 0, 0, 0.06)')

	// Vertical lines
	svg.selectAll('line.v')
	    .data(attData.values)
	  .enter().append('line')
	    .attr('class', 'v')
	    .attr('x1', function(d){ return x(valueRanking[d]) })
	    .attr('y1', 0)
	    .attr('x2', function(d){ return x(valueRanking[d]) })
	    .attr('y2', height)
	    .style("stroke", 'rgba(0, 0, 0, 0.06)')

	// Arrow
	var arr = svg.append('g')
		.attr('class', 'arrow')
    .style("stroke", 'rgba(0, 0, 0, 0.4)')
	arr.append('line')
    .attr('x1', -24 - maxR)
    .attr('y1', -24)
    .attr('x2', -24 - maxR)
    .attr('y2', -24 - maxR)
	arr.append('line')
    .attr('x1', -24 - maxR)
    .attr('y1', -24 - maxR)
    .attr('x2', -24)
    .attr('y2', -24 - maxR)
	arr.append('line')
    .attr('x1', -24)
    .attr('y1', -24 - maxR)
    .attr('x2', -24 - 6)
    .attr('y2', -24 - maxR - 6)
	arr.append('line')
    .attr('x1', -24)
    .attr('y1', -24 - maxR)
    .attr('x2', -24 - 6)
    .attr('y2', -24 - maxR + 6)

	// Horizontal labels
	svg.selectAll('text.h')
	    .data(attData.values)
	  .enter().append('text')
	    .attr('class', 'h')
	    .attr('x', -6-maxR)
	    .attr('y', function(d){ return y(valueRanking[d]) + 3 })
	    .text( function (d) { return d })
	    .style('text-anchor', 'end')
	    .attr("font-family", "sans-serif")
	    .attr("font-size", "12px")
	    .attr("fill", 'rgba(0, 0, 0, 0.5)')

	// Vertical labels
	svg.selectAll('text.v')
	    .data(attData.values)
	  .enter().append('text')
	    .attr('class', 'v')
	    .attr('x', function(d){ return x(valueRanking[d]) + 3 })
	    .attr('y', -6-maxR)
	    .text( function (d) { return d })
	    .style('text-anchor', 'end')
	    .style('writing-mode', 'vertical-lr')
	    .attr("font-family", "sans-serif")
	    .attr("font-size", "12px")
	    .attr("fill", 'rgba(0, 0, 0, 0.5)')

	// Dots
	var dot = svg.selectAll(".dot")
	    .data(crossings)
	  .enter().append('g')
	  
	dot.append("circle")
	  .attr("class", "dot")
	  .attr("r", function(d) { return size( r(d.count) ) })
	  .attr("cx", function(d) { return x(valueRanking[d.v2]) })
	  .attr("cy", function(d) { return y(valueRanking[d.v1]) })
	  .style("fill", 'rgba(120, 120, 120, 0.3)')

 	dot.append('text')
    .attr('x', function(d){ return x(valueRanking[d.v2]) })
    .attr('y', function(d){ return y(valueRanking[d.v1]) + 4 })
    .text( function (d) { return d.count })
    .style('text-anchor', 'middle')
    .attr("font-family", "sans-serif")
    .attr("font-size", "10px")
    .attr("fill", 'rgba(0, 0, 0, 1.0)')
}

function drawNormalizedDensityMatrix(container, attData) {

	// Compute crossings
	var crossings = []
	var v1
	var v2
	for (v1 in attData.valueFlow) {
		for (v2 in attData.valueFlow[v1]) {
			crossings.push({
				v1: v1,
				v2: v2,
				nd: attData.valueFlow[v1][v2].nd
			})
		}
	}

	// Rank values by count
	var sortedValues = attData.values.sort(function(v1, v2){
		return attData.valuesIndex[v2].nodes - attData.valuesIndex[v1].nodes
	})
	var valueRanking = {}
	sortedValues.forEach(function(v, i){
		valueRanking[v] = i
	})

	// Draw SVG
	var maxR = 32
	var margin = {top: 120 + maxR, right: 24 + maxR, bottom: 24 + maxR, left: 120 + maxR}
	var width = 2 * maxR * (attData.values.length - 1)
	var height = width // square space

	var x = d3.scaleLinear()
	  .range([0, width]);

	var y = d3.scaleLinear()
	  .range([0, height]);

	var size = d3.scaleLinear()
	  .range([0, 0.95 * maxR])

	var a = function(r){
	  return Math.PI * Math.pow(r, 2)
	}

	var r = function(a){
	  return Math.sqrt(a/Math.PI)
	}

	x.domain([0, attData.values.length - 1])
	y.domain([0, attData.values.length - 1])
	size.domain([0, d3.max(crossings, function(d){return r(Math.max(0, d.nd))})])

	var svg = container.append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	  .append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	// Horizontal lines
	svg.selectAll('line.h')
	    .data(attData.values)
	  .enter().append('line')
	    .attr('class', 'h')
	    .attr('x1', 0)
	    .attr('y1', function(d){ return y(valueRanking[d]) })
	    .attr('x2', width)
	    .attr('y2', function(d){ return y(valueRanking[d]) })
	    .style("stroke", 'rgba(0, 0, 0, 0.06)')

	// Vertical lines
	svg.selectAll('line.v')
	    .data(attData.values)
	  .enter().append('line')
	    .attr('class', 'v')
	    .attr('x1', function(d){ return x(valueRanking[d]) })
	    .attr('y1', 0)
	    .attr('x2', function(d){ return x(valueRanking[d]) })
	    .attr('y2', height)
	    .style("stroke", 'rgba(0, 0, 0, 0.06)')

	// Arrow
	var arr = svg.append('g')
		.attr('class', 'arrow')
    .style("stroke", 'rgba(0, 0, 0, 0.4)')
	arr.append('line')
    .attr('x1', -24 - maxR)
    .attr('y1', -24)
    .attr('x2', -24 - maxR)
    .attr('y2', -24 - maxR)
	arr.append('line')
    .attr('x1', -24 - maxR)
    .attr('y1', -24 - maxR)
    .attr('x2', -24)
    .attr('y2', -24 - maxR)
	arr.append('line')
    .attr('x1', -24)
    .attr('y1', -24 - maxR)
    .attr('x2', -24 - 6)
    .attr('y2', -24 - maxR - 6)
	arr.append('line')
    .attr('x1', -24)
    .attr('y1', -24 - maxR)
    .attr('x2', -24 - 6)
    .attr('y2', -24 - maxR + 6)

	// Horizontal labels
	svg.selectAll('text.h')
	    .data(attData.values)
	  .enter().append('text')
	    .attr('class', 'h')
	    .attr('x', -6-maxR)
	    .attr('y', function(d){ return y(valueRanking[d]) + 3 })
	    .text( function (d) { return d })
	    .style('text-anchor', 'end')
	    .attr("font-family", "sans-serif")
	    .attr("font-size", "12px")
	    .attr("fill", 'rgba(0, 0, 0, 0.5)')

	// Vertical labels
	svg.selectAll('text.v')
	    .data(attData.values)
	  .enter().append('text')
	    .attr('class', 'v')
	    .attr('x', function(d){ return x(valueRanking[d]) + 3 })
	    .attr('y', -6-maxR)
	    .text( function (d) { return d })
	    .style('text-anchor', 'end')
	    .style('writing-mode', 'vertical-lr')
	    .attr("font-family", "sans-serif")
	    .attr("font-size", "12px")
	    .attr("fill", 'rgba(0, 0, 0, 0.5)')

	// Dots
	var dot = svg.selectAll(".dot")
	    .data(crossings)
	  .enter().append('g')
	  
	dot.append("circle")
	  .attr("class", "dot")
	  .attr("r", function(d) { return size( r(Math.max(0, d.nd)) ) })
	  .attr("cx", function(d) { return x(valueRanking[d.v2]) })
	  .attr("cy", function(d) { return y(valueRanking[d.v1]) })
	  .style("fill", function(d){
	  	if (d.v1 == d.v2) {
	  		return 'rgba(70, 220, 70, 0.3)'
	  	} else {
	  		return 'rgba(220, 70, 70, 0.3)'	  		
	  	}
	  })

 	dot.append('text')
    .attr('x', function(d){ return x(valueRanking[d.v2]) })
    .attr('y', function(d){ return y(valueRanking[d.v1]) + 4 })
    .text( function (d) { return formatDensityNumber(d.nd) })
    .style('text-anchor', 'middle')
    .attr("font-family", "sans-serif")
    .attr("font-size", "10px")
    .attr("fill", 'rgba(0, 0, 0, 1.0)')

	function formatDensityNumber(d) {
   	return d.toFixed(3)
  }
}

function drawValueInternalExternal(container, attData, v) {
	
	var data = [
		{
			label: 'Internal',
			nd: attData.valuesIndex[v].internalNDensity,
			color: 'rgba(70, 220, 70, 0.3)'
		},
		{
			label: 'External',
			nd: attData.valuesIndex[v].externalNDensity,
			color: 'rgba(220, 70, 70, 0.3)'
		}
	]
	
	var barHeight = 32
	var margin = {top: 24, right: 120, bottom: 24, left: 120}
	var width = 600  - margin.left - margin.right
	var height = barHeight * data.length

	var x = d3.scaleLinear().range([0, width])

	var y = d3.scaleBand().rangeRound([0, height]).padding(.05)

	var xAxis = d3.axisBottom()
	    .scale(x)

	var yAxis = d3.axisLeft()
	    .scale(y)

	var svg = container.append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	  .append("g")
	    .attr("transform", 
          "translate(" + margin.left + "," + margin.top + ")")

  x.domain([0, d3.max(data, function(d) { return d.nd })])
  y.domain(data.map(function(d){return d.label}))

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .selectAll("text")
	    .attr("font-family", "sans-serif")
	    .attr("font-size", "12px")
	    .attr("fill", 'rgba(0, 0, 0, 0.5)')

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .selectAll("text")
	    .attr("font-family", "sans-serif")
	    .attr("font-size", "12px")
	    .attr("fill", 'rgba(0, 0, 0, 0.5)')

  var bar = svg.selectAll("bar")
      .data(data)
    .enter().append('g')
    	.attr("class", "bar")

  bar.append("rect")
	    .style("fill", function(d){ return d.color })
	    .attr("x", 0)
	    .attr("y", function(d) { return y(d.label) })
	    .attr("width", function(d) { return x(Math.max(0, d.nd)) })
	    .attr("height", y.bandwidth())

  bar.append('text')
  		.attr('x', function(d) { return 6 + x(Math.max(0, d.nd)) })
  		.attr('y', function(d) { return y(d.label) + 18 })
  		.attr('font-family', 'sans-serif')
	    .attr('font-size', '10px')
	    .attr('fill', 'rgba(0, 0, 0, 0.8)')
	    .text(function(d){ return d.nd.toFixed(3) + ' norm. density'})
}

function drawValueInboundOutbound(container, attData, v) {
	
	var data = [
		{
			label: 'Inbound',
			nd: attData.valuesIndex[v].inboundNDensity,
			count: attData.valuesIndex[v].inboundLinks
		},
		{
			label: 'Outbound',
			nd: attData.valuesIndex[v].outboundNDensity,
			count: attData.valuesIndex[v].outboundLinks
		}
	]
	
	var barHeight = 32
	var margin = {top: 24, right: 120, bottom: 24, left: 120}
	var width = 600  - margin.left - margin.right
	var height = barHeight * data.length

	var x = d3.scaleLinear().range([0, width])

	var y = d3.scaleBand().rangeRound([0, height]).padding(.05)

	var xAxis = d3.axisBottom()
	    .scale(x)

	var yAxis = d3.axisLeft()
	    .scale(y)

	var svg = container.append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	  .append("g")
	    .attr("transform", 
          "translate(" + margin.left + "," + margin.top + ")")

  x.domain([0, Math.max(0.01, d3.max(data, function(d) { return d.nd }))])
  y.domain(data.map(function(d){return d.label}))

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .selectAll("text")
	    .attr("font-family", "sans-serif")
	    .attr("font-size", "12px")
	    .attr("fill", 'rgba(0, 0, 0, 0.5)')

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .selectAll("text")
	    .attr("font-family", "sans-serif")
	    .attr("font-size", "12px")
	    .attr("fill", 'rgba(0, 0, 0, 0.5)')

  var bar = svg.selectAll("bar")
      .data(data)
    .enter().append('g')
    	.attr("class", "bar")

  bar.append("rect")
	    .style("fill", 'rgba(120, 120, 120, 0.5)')
	    .attr("x", 0)
	    .attr("y", function(d) { return y(d.label) })
	    .attr("width", function(d) { return x(Math.max(0, d.nd)) })
	    .attr("height", y.bandwidth())

  bar.append('text')
  		.attr('x', function(d) { return 6 + x(Math.max(0, d.nd)) })
  		.attr('y', function(d) { return y(d.label) + 12 })
  		.attr('font-family', 'sans-serif')
	    .attr('font-size', '10px')
	    .attr('fill', 'rgba(0, 0, 0, 0.8)')
	    .text(function(d){ return d.count + ' links'})

  bar.append('text')
  		.attr('x', function(d) { return 6 + x(Math.max(0, d.nd)) })
  		.attr('y', function(d) { return y(d.label) + 24 })
  		.attr('font-family', 'sans-serif')
	    .attr('font-size', '10px')
	    .attr('fill', 'rgba(0, 0, 0, 0.8)')
	    .text(function(d){ return d.nd.toFixed(3) + ' norm. density'})
}
