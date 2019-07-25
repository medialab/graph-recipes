// GET TOP NODES
//
//  This script generates a list of nodes
//  Necessary to the script HIGHLIGHT NODES
//  EDIT THIS DIRECTLY - settings are not separated

var myNodes = g.nodes().slice(0) // Copy the list of nodes

// Sort the list of nodes
myNodes.sort(function(nid_1, nid_2){
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
  var attribute_id = "global_occurrences" // <-- Edit this attribute id!
  offset = n2[attribute_id] - n1[attribute_id]

  /*
  // Sort by degree
  // note: also try indegree or outdegree
  offset = g.degree(nid_2) - g.degree(nid_1)
  */

  return offset
})

// Filter the results
myNodes = myNodes.filter(function(nid, i){
  // nid is the node identifier. It is just a text string.
  // i is the rank in the list

  // We will return the "keep" variable, which must be
  // set to true only if we want to keep this node.
  var keep

  // We only keep the first 10 nodes
  keep = i < 10 // <-- Edit this range if you want!

  return keep
})

// Write the output
var ta = document.createElement("textarea")
ta.cols = "30"
ta.rows = "10"
ta.style.minHeight = "150px"
ta.style.fontFamily = "monospace"
ta.style.margin = "0"
ta.textContent = "settings.highlighted_nodes = " + JSON.stringify(myNodes, null, 2)
document.querySelector('#playground').append(ta)

