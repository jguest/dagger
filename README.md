# Dagger
A directed acyclic graph implementation

## Development

You need Node and npm installed to do development work on Dagger. Once you have them installed run:

    $ npm install

to install all development dependencies. Development leverages the "scripts" node of `package.json`.

Dagger has the following development commands:

    # Run the test suite
    npm test

    # Run the linter
    npm run lint

    # Transpile ES2015 code to ES5
    npm run build

    # Watch for changes during development
    # Runs `lint` then `build`
    npm run watch

    # Run the examples
    npm run ex

## Usage

Create a graph instance:

```javascript
var graph = new Dagger({
  debug: true,
  uniqueKey: "letter",
  descriptionKey: "text",
  checkCycles: true
});
```

Add some edges:

```javascript
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
       .addEdge(z, a);
```

Do stuff with it:

```javascript
var onVisit = function(vert) {
  return vert.letter.toUpperCase();
};

var edge = graph.findEdge(z, g, onVisit);
console.log(edge);

// [ 'G', 'E', 'A', 'Z' ]

console.log(graph.toString());

/*
- z (a is my child)
-- a (b is my child)
--- b (a is my parent and c and d are my children)
---- c (b is my parent)
---- d (b is my parent)
--- e (a is my parent and f and g are my children)
---- f (e is my parent)
---- g (e is my parent)
*/

var descendants = graph.descendantsOf(a, function(descendant) {
  descendant.text = "descendant of a";
  return descendant;
});

/*
- z (a is my child)
-- a (b is my child)
--- b (descendant of a)
---- c (descendant of a)
---- d (descendant of a)
----- g (descendant of a)
--- e (descendant of a)
---- f (descendant of a)
---- g (descendant of a)
*/
```

Further reading:

* [Here's the wikipedia article covering directed acyclic graphs](https://en.wikipedia.org/wiki/Directed_acyclic_graph)
