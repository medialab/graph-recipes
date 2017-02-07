// Get a list of nodes attributes
var attributes = {};
var attname;
g.nodes().forEach(function(nid){
	var attributesObject = g.getNodeAttributes(nid);
	for (attname in attributesObject) {
		attributes[attname] = ( attributes[attname] || 0 ) + 1;
	}
});

// Format the list of attributes as a table
var nodeAttributesTable = [];
for (attname in attributes) {
	nodeAttributesTable.push({'Attribute': attname, 'Nodes Count': attributes[attname]});
}

// Display the table
var div1 = d3.select('#playground').append('div');
div1.append('h4')
	.text('Node attributes (' + nodeAttributesTable.length +')');
div1.selectAll('div')
	.data(nodeAttributesTable).enter()
		.append('div')
		.text(function(d){return d['Attribute'] + ' (' + d['Nodes Count'] + ' nodes)' });

// Format the table as a CSV Download it (UNCOMMENT TO USE)
// saveAs(
// 	new Blob([d3.csvFormat(nodeAttributesTable)], {'type':'text/csv;charset=utf-8'}),
// 	"Node Attributes of " + store.get('graphname') + ".csv"
// );

// Get a list of edges attributes
attributes = {};
attname;
g.edges().forEach(function(eid){
	var attributesObject = g.getEdgeAttributes(eid);
	for (attname in attributesObject) {
		attributes[attname] = ( attributes[attname] || 0 ) + 1;
	}
});

// Format the list of attributes as a table
var edgeAttributesTable = [];
for (attname in attributes) {
	edgeAttributesTable.push({'Attribute': attname, 'Edges Count': attributes[attname]});
}

// Display the table
var div2 = d3.select('#playground').append('div');
div2.append('h4')
	.text('Edge attributes (' + edgeAttributesTable.length +')');
div2.selectAll('div')
	.data(edgeAttributesTable).enter()
		.append('div')
		.text(function(d){return d['Attribute'] + ' (' + d['Edges Count'] + ' edges)' });

// Format the table as a CSV Download it (UNCOMMENT TO USE)
// saveAs(
// 	new Blob([d3.csvFormat(edgeAttributesTable)], {'type':'text/csv;charset=utf-8'}),
// 	"Edge Attributes of " + store.get('graphname') + ".csv"
// );
