// Compute the betweenness centrality, normalized, undirected,
// and store it in the attribute "bc"
betweennessCentrality(g, true, false, 'bc')

// ---

function betweennessCentrality(g, normalized, directed, attributeName) {

  if ( normalized === undefined ) {
    normalized = true
  }
  
  if ( directed === undefined ) {
    directed = false
  }

  // From https://networkx.github.io/documentation/latest/_modules/networkx/algorithms/centrality/betweenness.html#edge_betweenness_centrality
  
  betweenness_centrality()
  edge_betweenness_centrality()
  
  function betweenness_centrality() {
    var betweenness = {}
    g.nodes().forEach(function(nid){
      betweenness[nid] = 0
    })
    
    g.nodes().forEach(function(sid){
      var sp = _single_source_shortest_path_basic(sid)
      var S = sp.S
      var P = sp.P
      var sigma = sp.sigma
      _accumulate_basic(betweenness, S, P, sigma, sid)
    })

    _rescale(betweenness, normalized)

    g.nodes().forEach(function(nid){
      var n = g.getNodeAttributes(nid)
      n[attributeName] = betweenness[nid]
    })
  }

  function edge_betweenness_centrality() {
    var betweenness = {}
    g.nodes().forEach(function(nid){
      betweenness[nid] = 0
    })
    g.edges().forEach(function(eid){
      var id = g.source(eid)+'|'+g.target(eid)
      betweenness[id] = 0
    })
    
    g.nodes().forEach(function(sid){
      var s = g.getNodeAttributes(sid)
      var sp = _single_source_shortest_path_basic(sid)
      var S = sp.S
      var P = sp.P
      var sigma = sp.sigma
      _accumulate_edges(betweenness, S, P, sigma, sid)
    })

    _rescale_e(betweenness, normalized)

    g.edges().forEach(function(eid){
      var id = g.source(eid)+'|'+g.target(eid)
      var e = g.getEdgeAttributes(eid)
      e[attributeName] = betweenness[id]
    })
  }

  // helpers for betweenness centrality

  function _single_source_shortest_path_basic(sid) {
    var S = []
    var P = {}
    g.nodes().forEach(function(vid){
      P[vid] = []
    })
    var sigma = {}
    g.nodes().forEach(function(nid){
      sigma[nid] = 0
    })
    var D = {}
    sigma[sid] = 1
    D[sid] = 0
    var Q = [sid]
    var vid
    var Dv
    var sigmav
    while ( Q.length > 0 ) { // use BFS to find shortest paths
      vid = Q.pop()
      S.push(vid)
      Dv = D[vid]
      sigmav = sigma[vid]
      g.inEdges(vid).map(function(eid){return g.source(eid)})
        .concat(g.inEdges(vid).map(function(eid){return g.target(eid)}))
        .forEach(function(wid){
          if ( D[wid] === undefined ) {
            Q.push(wid)
            D[wid] = Dv + 1
          }
          if ( D[wid] == Dv + 1 ) { // this is a shortest path, count paths
            sigma[wid] += sigmav
            P[wid].push(vid) // predecessors
          }
        })
    }
    return {S:S, P:P, sigma:sigma}
  }

  function _accumulate_basic(betweenness, S, P, sigma, sid){
    var delta = {}
    var nid
    S.forEach(function(nid){
      delta[nid] = 0
    })
    var wid
    var coeff
    while ( S.length > 0 ) {
      wid = S.pop()
      coeff = ( 1 + delta[wid] ) / sigma[wid]
      P[wid].forEach(function(vid){
        delta[vid] += sigma[vid] * coeff
      })
      if ( wid != sid ) {
        betweenness[wid] += delta[wid]
      }
    }
  }

  function _rescale(betweenness, normalized) {
    var scale
    var n = g.order
    if ( normalized ) {
      if ( n <= 2 ) {
        scale = -1 // no normalization b=0 for all nodes
      } else {
        scale = 1 / ((n - 1) * (n - 2))
      }
    } else { // rescale by 2 for undirected graphs
      scale = 1 / 2
    }
    if ( scale >= 0 ) {
      g.nodes().forEach(function(nid){
        betweenness[nid] = betweenness[nid] * scale
      })
    }
  }

  function _accumulate_edges(betweenness, S, P, sigma, sid) {
    var delta = {}
    var nid
    S.forEach(function(nid){
      delta[nid] = 0
    })
    var wid
    var coeff
    while ( S.length > 0 ) {
      wid = S.pop()
      coeff = ( 1 + delta[wid] ) / sigma[wid]
      P[wid].forEach(function(vid){
        var c = sigma[vid] * coeff
        if ( betweenness[vid + '|' + wid] === undefined ) {
          betweenness[wid + '|' + vid] = ( betweenness[wid + '|' + vid] || 0 ) + c
        } else {
          betweenness[vid + '|' + wid] = ( betweenness[vid + '|' + wid] || 0 ) + c
        }
        delta[vid] += c
      })
      if ( wid != sid ) {
        betweenness[wid] += delta[wid]
      }
    }
  }

  function _rescale_e(betweenness, normalized) {
    var scale
    var n = g.order
    if ( normalized ) {
      if ( n <= 1 ) {
        scale = -1 // no normalization b=0 for all nodes
      } else {
        scale = 1 / ( n * (n - 1) )
      }
    } else { // rescale by 2 for undirected graphs
      scale = 1 / 2
    }
    if ( scale >= 0 ) {
      g.edges().forEach(function(eid){
        var sid = g.source(eid)
        var tid = g.target(eid)
        betweenness[sid + '|' + tid] = betweenness[sid + '|' + tid] * scale
      })
    }
  }
}