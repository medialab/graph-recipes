// Helper scripts

// Seeing the list of nodes attributes as a CSV in the console
d3.csvFormat(g.nodesAttributes)

// Saving an array as a CSV (in this example, applied to g.nodesAttributes)
(function(csvArray){
	var blob = new Blob([d3.csvFormat(csvArray)], {type: "text/csv; charset=UTF-8"})
	saveAs(blob, 'Output CSV.csv')
})(g.nodesAttributes)

