var settings = {}
settings.downloadCSV = false // Download the CSV tables of node and edge attributes

// Get a list of nodes attributes
var attributes = {}
var attname
g.nodes().forEach(function(nid){
	var attributesObject = g.getNodeAttributes(nid)
	for (attname in attributesObject) {
		// Note: we count the number of nodes with each attribute
		attributes[attname] = ( attributes[attname] || 0 ) + 1
	}
})

// Format the list of attributes as a table
var nodeAttributesTable = []
for (attname in attributes) {
	nodeAttributesTable.push({'Attribute': attname, 'Nodes Count': attributes[attname]})
}

// Display the data
var nodeText = ''
nodeText += '# Node attributes (' + nodeAttributesTable.length + ')'
nodeAttributesTable.forEach(function(d){
	nodeText += '\n' + d['Attribute']
	if (d['Nodes Count'] < g.order) {
		// Display that not all nodes have this attribute
		nodeText += ' (' + d['Nodes Count'] + ' nodes only)'
	}
})
d3.select('#playground').append('pre').text(nodeText)

// Format the table as a CSV Download it
if (settings.downloadCSV) {
	saveAs(
		new Blob([d3.csvFormat(nodeAttributesTable)], {'type':'text/csvcharset=utf-8'}),
		"Node Attributes of " + store.get('graphname') + ".csv"
	)	
}

// Get a list of edges attributes
attributes = {}
attname
g.edges().forEach(function(eid){
	var attributesObject = g.getEdgeAttributes(eid)
	for (attname in attributesObject) {
		attributes[attname] = ( attributes[attname] || 0 ) + 1
	}
})

// Format the list of attributes as a table
var edgeAttributesTable = []
for (attname in attributes) {
	edgeAttributesTable.push({'Attribute': attname, 'Edges Count': attributes[attname]})
}

// Display the data
var edgeText = ''
edgeText += '# Edge attributes (' + edgeAttributesTable.length + ')'
edgeAttributesTable.forEach(function(d){
	edgeText += '\n' + d['Attribute']
	if (d['Edges Count'] < g.size) {
		// Display that not all edges have this attribute
		edgeText += ' (' + d['Edges Count'] + ' edges only)'
	}
})
d3.select('#playground').append('pre').text(edgeText)


// Format the table as a CSV Download it
if (settings.downloadCSV) {
	saveAs(
		new Blob([d3.csvFormat(edgeAttributesTable)], {'type':'text/csvcharset=utf-8'}),
		"Edge Attributes of " + store.get('graphname') + ".csv"
	)
}