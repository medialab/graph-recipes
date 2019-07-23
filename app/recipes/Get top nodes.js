// GET TOP NODES - v1.0
// Backscatter Network Export
//
//  This script generates a list of nodes
//  Necessary to other scripts

var nodes = g.nodes().slice(0) // We copy the list of nodes

// Sort the list of nodes
nodes.sort(function(nid_1, nid_2){
  // nid 1 and 2 are node identifiers, just text strings.
  // They correspond to two nodes we need to compare for sorting.
  // We need to get the nodes as objects with their attributes.
  var n1 = g.getNodeAttributes(nid_1)
  var n2 = g.getNodeAttributes(nid_2)

  // The compare function looks at the sign
  // of "offset" to tell if node 1 must be sorted
  // before or after node 2.
  var offset

  // Sort by an attribute
  var attribute_id = "global_occurrences" // Edit this attribute id!
  offset = n2[attribute_id] - n1[attribute_id]

  /*
  // Sort by degree
  // note: also try indegree or outdegree
  offset = g.degree(nid_2) - g.degree(nid_1)
  */

  return offset
})

// Filter the results
nodes = nodes.filter(function(nid, i){
  // nid is the node identifier. It is just a text string.
  // i is the rank in the list

  // We will return the "keep" variable, which must be
  // set to true only if we want to keep this node.
  var keep

  // We only keep the first 10 nodes
  keep = i < 10

  return keep
})

// Write the output
document.querySelector('#playground').innerHTML = '<pre></pre>'
var pre = document.querySelector('#playground pre')
pre.textContent = "settings.highlighted_nodes = " + JSON.stringify(nodes, null, 2)

