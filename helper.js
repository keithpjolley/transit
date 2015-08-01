var halfpi = Math.PI/2
var twopi  = Math.PI*2

Math.notsorandom = function(max, min) {
    max = max || 1;
    min = min || 0;
 
    Math.seed = (Math.seed * 9301 + 49297) % 233280;
    var rnd = Math.seed / 233280;
 
    return min + rnd * (max - min);
}

function arcme(A, B, curve) {
  if (curve == 0) {
    return "M" + A.x + "," + A.y + 
           " " + B.x + "," + B.y + 
           "Z"
  }
  Math.seed = A.index + B.index
  //curve = (A.index + B.index) % 2 ? curve : -curve // have some curves go up, some down
  var rise = B.y - A.y
  var run  = B.x - A.x
  var theta= Math.abs(Math.atan(rise/run)||halfpi) + curve * halfpi
  var r = Math.notsorandom(1,1.1)
  if (Math.abs(r) < 1) { console.log("r: " + r) }
  if (Math.abs(r) > 1.1) { console.log("r: " + r) }
  var h    = Math.sqrt(Math.pow(B.x-A.x,2) + Math.pow(B.y-A.y,2)) * r
  
  var c    = {  x: (A.x+B.x)/2 + h*Math.cos(theta),
                y: (A.y+B.y)/2 + h*Math.cos(theta)}
  return "M" + A.x + "," + A.y + " " +
         "S" + c.x + "," + c.y +
         " " + B.x + "," + B.y + 
         "Z"
}

function centroids(nodes, trans) {
  var m   = []
  myComms.forEach(function(o, i) {
    m[o + ".x"] = new Array()
    m[o + ".y"] = new Array()
  })
  nodes.forEach(function(o, i) {
    var thiscommunity = o.community + ""
    m[thiscommunity + ".x"].push(trans === "scatter" ? xMap(o.x) : o.x)
    m[thiscommunity + ".y"].push(trans === "scatter" ? yMap(o.y) : o.y)
  })
  var ret = []
  myComms.forEach(function(o, i) {
    ret[o + ".x"] = d3.mean(m[o + ".x"])
    ret[o + ".y"] = d3.mean(m[o + ".y"])
  })
  return ret
}

function labelize(nodes, trans) {
  if (typeof nodes === "undefined") {
    d3.selectAll(".community_label")
      .transition()
      .duration(tmilli)
      .style("opacity", 0)
    return
  }
  var roids = centroids(nodes)
/*
  d3.selectAll(".label_back")
    .attr("x", function(){
      return roids[this.attributes.community.value + ".x"]-parseInt(this.attributes.width.value)/2+"px"})
    .attr("y", function(){
      return roids[this.attributes.community.value + ".y"]-parseInt(this.attributes.height.value)+5+"px"})
  d3.selectAll(".label_text")
    .attr("x", function(){return roids[this.attributes.community.value + ".x"]+"px"})
    .attr("y", function(){return roids[this.attributes.community.value + ".y"]+"px"})
*/
  d3.selectAll(".label_group")
    .attr("transform", function(o,i){
        return "translate(" + roids[this.attributes.community.value + ".x"]
        +               "," + roids[this.attributes.community.value + ".y"]
        + ")"
    })
  return
}

function toscatter() {
  d3.selectAll(".scatter")
    .transition()
    .duration(tmilli)
    .style("opacity", 1)
  force.stop()
  d3.selectAll(".node")
    .transition()
    .duration(tmilli)
    .attr("cx", function(d){return xMap(d)})
    .attr("cy", function(d){return yMap(d)})
    .attr("fixed", true)
    .style("opacity", 1)
  d3.selectAll(".link")
    .transition()
    .duration(tmilli)
    .attr("d", function(d) { 
      var s = {x: xMap(d.source), y: yMap(d.source)}
      var t = {x: xMap(d.target), y: yMap(d.target)}
      return arcme(s, t, 0) })
    //kjlink .attr("x1", function(d){return(xMap(d.source))})
    //kjlink .attr("y1", function(d){return(yMap(d.source))})
    //kjlink .attr("x2", function(d){return(xMap(d.target))})
    //kjlink .attr("y2", function(d){return(yMap(d.target))})
    //kjlink .style("stroke-opacity", 0.125)
  labelize()
}

function toforce() {
  d3.selectAll(".node")
    .transition()
    .duration(tmilli)
    .attr("cx", function(d){return(d.x_old||0)})
    .attr("cy", function(d){return(d.y_old||0)})
    .style("opacity", 1)
  d3.selectAll(".link")
    .transition()
    .duration(tmilli)
    .attr("d", function(d) { return arcme(d.source, d.target, 0) })
// there's something that keeps this from working correctly when a curve is added
//  d3.selectAll(".link")
//    .transition()
//    .delay(tmilli)
//    .duration(2*tmilli)
//    .attr("d", function(d) { return arcme(d.source, d.target, 1) })
//kjlink      .attr("x1", function(d){return(d.source.x)})
//kjlink      .attr("y1", function(d){return(d.source.y)})
//kjlink      .attr("x2", function(d){return(d.target.x)})
//kjlink      .attr("y2", function(d){return(d.target.y)})
    .style("stroke-opacity", 0.25)
  labelize(graph.nodes, "force")
  d3.selectAll(".label_text")
    .transition()
    .duration(tmilli)
    .style("opacity", 1)
  d3.selectAll(".label_back")
    .transition()
    .duration(tmilli)
    .style("opacity", 0.8)
}

// hide the map and whatnot
function fromgeo() {
  d3.selectAll(".geo")
    .transition()
    .duration(tmilli)
    .style("opacity", 0)
}

// hide the axis and whatnot
function fromscatter() {
  d3.selectAll(".scatter")
    .transition()
    .duration(tmilli)
    .style("opacity", 0)
}

// show the map and whatnot
function togeo() {
  d3.selectAll(".geo")
    .transition()
    .duration(tmilli)
    .style("opacity", 1)
  d3.selectAll(".node")
    .transition()
    .duration(tmilli)
    .attr("cx", function(d){cx=projection([d.location.lon, d.location.lat])[0]; return cx})
    .attr("cy", function(d){cy=projection([d.location.lon, d.location.lat])[1]; return cy})
    .attr("fixed", true)
    .style("opacity", 0.5)
  d3.selectAll(".link")
    .transition()
    .duration(tmilli)
    .attr("d", function(d) { 
        var s = projection([d.source.location.lon, d.source.location.lat])
        var t = projection([d.target.location.lon, d.target.location.lat])
        return arcme({x: s[0], y: s[1], index: d.source.index}, {x: t[0], y: t[1], index: d.target.index}, 1)
    })
//kjlink      .attr("x1", function(d){x1=projection([d.source.location.lon, d.source.location.lat])[0]; return x1})
//kjlink      .attr("y1", function(d){y1=projection([d.source.location.lon, d.source.location.lat])[1]; return y1})
//kjlink      .attr("x2", function(d){x2=projection([d.target.location.lon, d.target.location.lat])[0]; return x2})
//kjlink      .attr("y2", function(d){y2=projection([d.target.location.lon, d.target.location.lat])[1]; return y2})
    .style("stroke-opacity", 0.5)
  labelize()
}

// https://github.com/mbostock/d3/blob/gh-pages/talk/20111018/collision.html#L76-101
// i really dislike this code. i hope nobody ever looks here. but it works. and that's hard to argue with.
function collide(node) {
//    var r1  = 2 + (radtype ? node.pr_rad : node.evc_rad)
  var r1  = 1 + node.radius
  var nx1 = node.x - r1
  var nx2 = node.x + r1
  var ny1 = node.y - r1
  var ny2 = node.y + r1
  return function(quad, x1, y1, x2, y2) {
    if (quad.point && (quad.point !== node)) {
      var x = node.x - quad.point.x
      var y = node.y - quad.point.y
      var l = Math.sqrt(x * x + y * y)
//        var r = radtype ? (node.pr_rad + quad.point.pr_rad) : (node.evc_rad + quad.point.evc_rad)
      var r = node.radius + quad.point.radius
      if (l < r) {
        l = (l - r) / l * 0.5
        node.x -= x *= l
        node.y -= y *= l
        quad.point.x += x
        quad.point.y += y
      }
    }
    return x1 > nx2
        || x2 < nx1
        || y1 > ny2
        || y2 < ny1
  }
}

function mymin(dec) {  // i do realize this would be the time to demonstrate my knowledge of recursion and unreadable code.
  if (dec < 1) { return 0 }
  var ret = 1/2
  while (dec>0) {
    ret /= 10
    dec--
  }
  return ret
}

// http://java-scripts.net/javascripts/Format-Number.phtml
function fmt(pnumber, decimals){
  if (isNaN(parseFloat(pnumber)))  { return ''}
  if (pnumber==0)                  { return 0}
  if (pnumber=='')                 { return ''}
  if (!isFinite(pnumber))          { return ''}
  if (pnumber < mymin(decimals)/2) { return '0.0'}
  var snum = new String(pnumber)
  var sec = snum.split('.')
  var whole = parseFloat(sec[0])
  var result = ''
  if (sec.length > 1) {
    var dec = new String(sec[1])
    dec = String(parseFloat(sec[1])/Math.pow(10,(dec.length - decimals)))
    dec = String(whole + Math.round(parseFloat(dec))/Math.pow(10,decimals))
    var dot = dec.indexOf('.')
    if(dot == -1){
      dec += '.'
      dot = dec.indexOf('.')
    }
    while (dec.length <= dot + decimals) { dec += '0' }
    result = dec
  } else {
    var dot
    var dec = new String(whole)
    dec += '.'
    dot = dec.indexOf('.')
    while (dec.length <= dot + decimals) { dec += '0' }
    result = dec
  }
  return result
}

function nComms(nodes) {
  nodes.forEach(function(o, i) {
    var community = o.community + "" // make sure community is a string
    myComms.push(community)
    if (o.prlead) { myLeaders[community] = i }
  })
  myComms = d3.set(myComms).values().sort()
  return myComms.length
}
