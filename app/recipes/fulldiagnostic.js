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

console.log(nAttributes)

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