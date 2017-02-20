// Get a list of nodes attributes
var nAttributes = {}
var attr
g.nodes().forEach(function(nid){
	var n = g.getNodeAttributes(nid)
	for (attr in n) {
		if (nAttributes[attr] === undefined) {
			nAttributes[attr] = {
				nodesCount: 1
			}
		} else {
			nAttributes[attr].nodesCount++
		}
	}
})

// Look at the types of values
for (attr in nAttributes) {
	var attData = nAttributes[attr]
	attData.types = {}
	g.nodes().forEach(function(nid){
		var t = getType(g.getNodeAttribute(nid, attr))
		attData.types[t] = (attData.types[t] || 0) + 1
	})
}

// Guess type of the attributes
for (attr in nAttributes) {
	var types = nAttributes[attr].types
	if (types.string !== undefined) {
		nAttributes[attr].type = 'string'
	} else if (types.float !== undefined) {
		nAttributes[attr].type = 'float'
	} else if (types.integer !== undefined) {
		nAttributes[attr].type = 'integer'
	} else {
		nAttributes[attr].type = 'error'
	}
}

// Aggregate distribution of values
for (attr in nAttributes) {
	nAttributes[attr].values = {}
}
g.nodes().forEach(function(nid){
	var n = g.getNodeAttributes(nid)
	for (attr in nAttributes) {
		nAttributes[attr].values[n[attr]] = (nAttributes[attr].values[n[attr]] || 0) + 1
	}
})
for (attr in nAttributes) {
	var stats = {}
	var valuesArray = d3.values(nAttributes[attr].values)
	stats.differentValues = valuesArray.length
	stats.sizeOfSmallestValue = d3.min(valuesArray)
	stats.sizeOfBiggestValue = d3.max(valuesArray)
	stats.medianSize = d3.median(valuesArray)
	stats.deviation = d3.deviation(valuesArray)
	stats.valuesUnitary = valuesArray.filter(function(d){return d==1}).length
	stats.valuesAbove1Percent = valuesArray.filter(function(d){return d>=g.order*0.01}).length
	stats.valuesAbove10Percent = valuesArray.filter(function(d){return d>=g.order*0.1}).length
	nAttributes[attr].valuesStats = stats
}

console.log('Node attributes', nAttributes)

// Get a list of edges attributes
var eAttributes = {}
g.edges().forEach(function(eid){
	var e = g.getEdgeAttributes(eid)
	for (attr in e) {
		if (eAttributes[attr] === undefined) {
			eAttributes[attr] = {
				edgesCount: 1
			}
		} else {
			eAttributes[attr].edgesCount++
		}
	}
})

// Look at the types of values
for (attr in eAttributes) {
	var attData = eAttributes[attr]
	attData.types = {}
	g.edges().forEach(function(eid){
		var t = getType(g.getEdgeAttribute(eid, attr))
		attData.types[t] = (attData.types[t] || 0) + 1
	})
}

// Guess type of the attributes
for (attr in eAttributes) {
	var types = eAttributes[attr].types
	if (types.string !== undefined) {
		eAttributes[attr].type = 'string'
	} else if (types.float !== undefined) {
		eAttributes[attr].type = 'float'
	} else if (types.integer !== undefined) {
		eAttributes[attr].type = 'integer'
	} else {
		eAttributes[attr].type = 'error'
	}
}

// Aggregate distribution of values
for (attr in eAttributes) {
	eAttributes[attr].values = {}
}
g.edges().forEach(function(eid){
	var e = g.getEdgeAttributes(eid)
	for (attr in eAttributes) {
		eAttributes[attr].values[e[attr]] = (eAttributes[attr].values[e[attr]] || 0) + 1
	}
})
for (attr in eAttributes) {
	var stats = {}
	var valuesArray = d3.values(eAttributes[attr].values)
	stats.differentValues = valuesArray.length
	stats.sizeOfSmallestValue = d3.min(valuesArray)
	stats.sizeOfBiggestValue = d3.max(valuesArray)
	stats.medianSize = d3.median(valuesArray)
	stats.deviation = d3.deviation(valuesArray)
	stats.valuesUnitary = valuesArray.filter(function(d){return d==1}).length
	stats.valuesAbove1Percent = valuesArray.filter(function(d){return d>=g.size*0.01}).length
	stats.valuesAbove10Percent = valuesArray.filter(function(d){return d>=g.size*0.1}).length
	eAttributes[attr].valuesStats = stats
}

console.log('Edge attributes', eAttributes)

// Write the compte-rendu
document.querySelector('#playground').innerHTML = '<pre></pre>'
var pre = document.querySelector('#playground pre')
pre.textContent = ''

pre.textContent += '' + d3.keys(nAttributes).length + ' NODE ATTRIBUTES'
pre.textContent += '\n================================'
for (attr in nAttributes) {
	// Node attribute
	pre.textContent += '\n\n\n' + attr
	pre.textContent += '\n--------------------------------'
	var attData = nAttributes[attr]

	// Missing values
	if (attData.nodesCount != g.order) {
		pre.textContent += '\nOnly ' + attData.nodesCount + '/' + g.order + ' nodes have this attribute.'
	}

	// Type
	pre.textContent += '\nType: ' + attData.type
	switch (attData.type) {
		case 'string':
			pre.textContent += ' (text)'
			break
		case 'integer':
			pre.textContent += ' (1, 2, 3...)'
			break
		case 'float':
			pre.textContent += ' (any number)'
			break
	}
	if (d3.keys(attData.types).length > 1) {
		var textarray = []
		var t
		for (t in attData.types) {
			textarray.push(attData.types[t] + ' nodes recognized as ' + t)
		}
		pre.textContent += '\nNote: ' + textarray.join(', ') + '.'
	}

	// Values summary
	pre.textContent += '\n\n### Values summary'
	if (attData.valuesStats.differentValues == 1) {
		pre.textContent += '\nAll nodes have the same ' + attr + '. '
	} else if (attData.valuesStats.differentValues == g.order) {
		pre.textContent += '\nEvery single node has a different ' + attr + '. '
	} else if (attData.valuesStats.differentValues > 0.9 * g.order) {
		pre.textContent += '\nNodes take ' + attData.valuesStats.differentValues + ' different values for this attribute. '
		pre.textContent += '\nIn other terms, almost every node (' + percent(attData.valuesStats.differentValues/g.order) + ') has a different ' + attr + '. '
		pre.textContent += '\nThe biggest group of nodes with the shame value has ' + attData.valuesStats.sizeOfBiggestValue + ' nodes. '
		pre.textContent += '\n' + attData.valuesStats.valuesUnitary + ' nodes have a specific (non shared) value. '
	} else {
		pre.textContent += '\nNodes take ' + attData.valuesStats.differentValues + ' different values for this attribute. '
		pre.textContent += '\nThe biggest group with the same value has ' + attData.valuesStats.sizeOfBiggestValue + ' nodes (' + percent(attData.valuesStats.sizeOfBiggestValue/g.order) + '). '
		pre.textContent += '\nThe smallest group has ' + attData.valuesStats.sizeOfSmallestValue + ' nodes. '
		pre.textContent += '\n' + attData.valuesStats.valuesUnitary + ' nodes have a specific (non shared) value. '
	}

	// Values
	if (attData.valuesStats.differentValues <= 10) {
		pre.textContent += '\n\n### Values'
		pre.textContent += '\n' +
			d3.keys(attData.values)
				.sort(function(a, b){ return attData.values[b] - attData.values[a] })
				.map(function(v){
					return '- ' + v + ': ' + attData.values[v] + ' nodes'
				})
				.join('\n')
	} else if (attData.valuesStats.differentValues - attData.valuesStats.valuesUnitary >= 1 && attData.valuesStats.differentValues - attData.valuesStats.valuesUnitary <= 10) {
		pre.textContent += '\n\n### Values taken by more than one node'
		pre.textContent += '\n' +
			d3.keys(attData.values)
				.sort(function(a, b){ return attData.values[b] - attData.values[a] })
				.filter(function(v, i){
					return attData.values[v] > 1
				})
				.map(function(v){
					return '- ' + v + ': ' + attData.values[v] + ' nodes'
				})
				.join('\n')
	} else if (attData.valuesStats.differentValues - attData.valuesStats.valuesUnitary > 10) {
		pre.textContent += '\n\n### Values taken by the most nodes (top 10)'
		pre.textContent += '\n' +
			d3.keys(attData.values)
				.sort(function(a, b){ return attData.values[b] - attData.values[a] })
				.filter(function(v, i){
					return attData.values[v] > 1 && i < 10
				})
				.map(function(v){
					return '- ' + v + ': ' + attData.values[v] + ' nodes'
				})
				.join('\n')
	}
}

pre.textContent += '\n\n\n\n' + d3.keys(eAttributes).length + ' EDGE ATTRIBUTES'
pre.textContent += '\n================================'
for (attr in eAttributes) {
	// Edge attribute
	pre.textContent += '\n\n\n' + attr
	pre.textContent += '\n--------------------------------'
	var attData = eAttributes[attr]

	// Missing values
	if (attData.edgesCount != g.size) {
		pre.textContent += '\nOnly ' + attData.edgesCount + '/' + g.size + ' edges have this attribute.'
	}

	// Type
	pre.textContent += '\nType: ' + attData.type
	switch (attData.type) {
		case 'string':
			pre.textContent += ' (text)'
			break
		case 'integer':
			pre.textContent += ' (1, 2, 3...)'
			break
		case 'float':
			pre.textContent += ' (any number)'
			break
	}
	if (d3.keys(attData.types).length > 1) {
		var textarray = []
		var t
		for (t in attData.types) {
			textarray.push(attData.types[t] + ' edges recognized as ' + t)
		}
		pre.textContent += '\nNote: ' + textarray.join(', ') + '.'
	}

	// Values summary
	pre.textContent += '\n\n### Values summary'
	if (attData.valuesStats.differentValues == 1) {
		pre.textContent += '\nAll edges have the same ' + attr + '. '
	} else if (attData.valuesStats.differentValues == g.size) {
		pre.textContent += '\nEvery single edge has a different ' + attr + '. '
	} else if (attData.valuesStats.differentValues > 0.9 * g.size) {
		pre.textContent += '\nEdges take ' + attData.valuesStats.differentValues + ' different values for this attribute. '
		pre.textContent += '\nIn other terms, almost every edge (' + percent(attData.valuesStats.differentValues/g.size) + ') has a different ' + attr + '. '
		pre.textContent += '\nThe biggest group of edges with the shame value has ' + attData.valuesStats.sizeOfBiggestValue + ' edges. '
		pre.textContent += '\n' + attData.valuesStats.valuesUnitary + ' edges have a specific (non shared) value. '
	} else {
		pre.textContent += '\nEdges take ' + attData.valuesStats.differentValues + ' different values for this attribute. '
		pre.textContent += '\nThe biggest group with the same value has ' + attData.valuesStats.sizeOfBiggestValue + ' edges (' + percent(attData.valuesStats.sizeOfBiggestValue/g.size) + '). '
		pre.textContent += '\nThe smallest group has ' + attData.valuesStats.sizeOfSmallestValue + ' edges. '
		pre.textContent += '\n' + attData.valuesStats.valuesUnitary + ' edges have a specific (non shared) value. '
	}

	// Values
	if (attData.valuesStats.differentValues <= 10) {
		pre.textContent += '\n\n### Values'
		pre.textContent += '\n' +
			d3.keys(attData.values)
				.sort(function(a, b){ return attData.values[b] - attData.values[a] })
				.map(function(v){
					return '- ' + v + ': ' + attData.values[v] + ' edges'
				})
				.join('\n')
	} else if (attData.valuesStats.differentValues - attData.valuesStats.valuesUnitary >= 1 && attData.valuesStats.differentValues - attData.valuesStats.valuesUnitary <= 10) {
		pre.textContent += '\n\n### Values taken by more than one edge'
		pre.textContent += '\n' +
			d3.keys(attData.values)
				.sort(function(a, b){ return attData.values[b] - attData.values[a] })
				.filter(function(v, i){
					return attData.values[v] > 1
				})
				.map(function(v){
					return '- ' + v + ': ' + attData.values[v] + ' edges'
				})
				.join('\n')
	} else if (attData.valuesStats.differentValues - attData.valuesStats.valuesUnitary > 10) {
		pre.textContent += '\n\n### Values taken by the most edges (top 10)'
		pre.textContent += '\n' +
			d3.keys(attData.values)
				.sort(function(a, b){ return attData.values[b] - attData.values[a] })
				.filter(function(v, i){
					return attData.values[v] > 1 && i < 10
				})
				.map(function(v){
					return '- ' + v + ': ' + attData.values[v] + ' edges'
				})
				.join('\n')
	}
}


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

function percent(d) {
	return Math.round(100 * d) + '%'
}