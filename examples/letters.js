var fs = require('fs');
var Dagger = require('../dist/dagger');

/**
 * example dagger usage
 */
var run = function() {

  var graph = new Dagger({
    debug: true,
    uniqueKey: "letter",
    descriptionKey: "text",
    checkCycles: true
  });

  var a = { letter: "a", text: "b is my child" }
    , b = { letter: "b", text: "a is my parent and c and d are my children" }
    , c = { letter: "c", text: "b is my parent" }
    , d = { letter: "d", text: "b is my parent" }
    , e = { letter: "e", text: "a is my parent and f and g are my children" }
    , f = { letter: "f", text: "e is my parent" }
    , g = { letter: "g", text: "e is my parent" }
    , z = { letter: "z", text: "a is my child" }

  graph.addEdge(a, b)
       .addEdge(b, c)
       .addEdge(b, d)
       .addEdge(a, e)
       .addEdge(e, f)
       .addEdge(e, g)
       .addEdge(z, a)

  console.log();
  console.log(graph.toString());

  var edge = graph.findEdge(z, g, function(v) { return v.letter.toUpperCase() });
  console.log(edge);

  graph.addEdge(d, g);

  console.log();
  console.log(graph.toString());

  var descendants = graph.descendantsOf(a, function(descendant) {
    descendant.text = "descendant of a";
    return descendant;
  });

  console.log(descendants);

  console.log();
  console.log(graph.toString());

  var ancestors = graph.ancestorsOf(b, function(ancestor) {
    ancestor.text = "ancestor of b";
    return ancestor;
  });

  console.log(ancestors);

  console.log();
  console.log(graph.toString());

};

run();
