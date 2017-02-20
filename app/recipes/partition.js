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
	attData.valuesIndex[n[settings.attribute]] = (attData.valuesIndex[n[settings.attribute]] || 0) + 1
})
attData.values = d3.keys(attData.valuesIndex)
var valuesCounts = d3.values(attData.valuesIndex)
attData.valuesStats = {}
attData.valuesStats.differentValues = valuesCounts.length
attData.valuesStats.sizeOfSmallestValue = d3.min(valuesCounts)
attData.valuesStats.sizeOfBiggestValue = d3.max(valuesCounts)
attData.valuesStats.medianSize = d3.median(valuesCounts)
attData.valuesStats.deviation = d3.deviation(valuesCounts)
attData.valuesStats.valuesUnitary = valuesCounts.filter(function(d){return d==1}).length
attData.valuesStats.valuesAbove1Percent = valuesCounts.filter(function(d){return d>=g.order*0.01}).length
attData.valuesStats.valuesAbove10Percent = valuesCounts.filter(function(d){return d>=g.order*0.1}).length

// Count edge flow
attData.valueFlow = {}
attData.values.forEach(function(v1){
	attData.valueFlow[v1] = {}
	attData.values.forEach(function(v2){
		attData.valueFlow[v1][v2] = {count: 0}
	})
})
g.edges().forEach(function(eid){
	var nsid = g.source(eid)
	var ntid = g.target(eid)
	attData.valueFlow[g.getNodeAttribute(nsid, settings.attribute)][g.getNodeAttribute(ntid, settings.attribute)].count++
})

console.log('Attribute data', attData)


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