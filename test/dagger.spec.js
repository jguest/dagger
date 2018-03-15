'use strict';

let expect = require('chai').expect;
let Dagger = require('../dist/dagger');

describe('dagger', function () {

  let dag, data;

  beforeEach(function () {

    dag = new Dagger({
      debug: false,
      uniqueKey: "letter",
      descriptionKey: "text",
      checkCycles: true
    });

    data = {
      a: { letter: "a", text: "b is my child" },
      b: { letter: "b", text: "a is my parent and c and d are my children" },
      c: { letter: "c", text: "b is my parent" },
      d: { letter: "d", text: "b is my parent" },
      e: { letter: "e", text: "a is my parent and f and g are my children" },
      f: { letter: "f", text: "e is my parent" },
      g: { letter: "g", text: "e is my parent" },
      z: { letter: "z", text: "a is my child" }
    }
  });

  describe('depth-first search', function () {

    beforeEach(function () {
      dag.addEdge(data.a, data.b);
      dag.addEdge(data.b, data.c);
      dag.addEdge(data.c, data.d);
      dag.addEdge(data.b, data.e)
    });

    it('should visit nodes in depth-first order', function () {

      let arr = [];
      dag.dfs({}, function (data) {
        arr.push(data.letter);
      });

      expect(arr).to.deep.equal([ 'a', 'b', 'c', 'd', 'e' ]);

    });
  });

  describe('descendants of', function () {

    beforeEach(function () {
      dag.addEdge(data.a, data.b);
      dag.addEdge(data.b, data.c);
      dag.addEdge(data.c, data.d);
      dag.addEdge(data.b, data.e)
    });

    it('should return an array of descendants in depth-first order', function () {

      let descendants = dag.descendantsOf(data.b, function (descendant) {
        return descendant.letter.toUpperCase();
      });

      expect(descendants).to.deep.equal([ 'C', 'D', 'E' ]);

    });

  });

  describe('ancestors of', function () {

    beforeEach(function () {
      dag.addEdge(data.a, data.b);
      dag.addEdge(data.b, data.c);
      dag.addEdge(data.c, data.d);
      dag.addEdge(data.b, data.e)
      dag.addEdge(data.c, data.e)
    });

    it('should return an array of ancestors in reverse depth-first order', function () {

      let ancestors = dag.ancestorsOf(data.e, function (ancestor) {
        return ancestor.letter.toUpperCase();
      });

      expect(ancestors).to.deep.equal([ 'B', 'A', 'C', 'B', 'A' ]);

    });

  });

  describe('remove edge', function () {

    beforeEach(function () {
      dag.addEdge(data.a, data.b);
      dag.addEdge(data.b, data.c);
      dag.addEdge(data.b, data.d);
    });

    it('should remove connection between two verticies', function () {
      let bc = dag.findEdge(data.b, data.c);
      expect(bc.length).to.equal(2);
      dag.removeEdge(data.b, data.c);
      bc = dag.findEdge(data.b, data.c);
      expect(bc.length).to.equal(0);
    });

    it('should not remove the severed nodes from memory', function () {
      expect(Object.keys(dag.nodes()).length).to.equal(4);
      dag.removeEdge(data.b, data.c);
      expect(Object.keys(dag.nodes()).length).to.equal(4);
    });

  });

  describe('remove vertex', function () {

    beforeEach(function () {
      dag.addEdge(data.a, data.b);
      dag.addEdge(data.b, data.c);
      dag.addEdge(data.b, data.d);
    });

    it('should remove the connection between verticies', function () {
      let bc = dag.findEdge(data.b, data.c);
      expect(bc.length).to.equal(2);
      dag.removeVertex(data.b);
      bc = dag.findEdge(data.b, data.c);
      expect(bc.length).to.equal(0);
    });

    it('should remove the vertex node from memory', function () {
      expect(Object.keys(dag.nodes()).length).to.equal(4);
      dag.removeVertex(data.b);
      expect(Object.keys(dag.nodes()).length).to.equal(3);
    });

    it('should attach its children to its parents', function () {
      let ac = dag.findEdge(data.a, data.c);
      expect(ac.length).to.equal(3);
      dag.removeVertex(data.b);
      ac = dag.findEdge(data.a, data.c);
      expect(ac.length).to.equal(2);
    });

  });

  describe('find edge', function () {

    beforeEach(function () {
      dag.addEdge(data.a, data.b);
      dag.addEdge(data.b, data.c);
      dag.addEdge(data.b, data.d);
    });

    it('should find simple edges', function () {
      let edge = dag.findEdge(data.a, data.b);
      expect(edge.length).to.equal(2);
    });

    it('should add a complex edge', function () {
      let edge = dag.findEdge(data.a, data.c);
      expect(edge.length).to.equal(3);
    });

    it('should map each vertex in the edge if function given', function () {

      let edge = dag.findEdge(data.a, data.c, function (v) {
        return v.letter.toUpperCase();
      });

      expect(edge).to.deep.equal(['A', 'B', 'C']);

    });

  });

  describe('add edge', function () {

    beforeEach(function () {
      dag.addEdge(data.a, data.b);
    });

    it('should check for cycles', function () {
      try {
        dag.addEdge(data.b, data.a);
      } catch (ex) {
        expect(ex).to.equal('adding edge would create cycle in the graph: "b" -> "a"');
      }
    });

    it('should allow chaining', function () {
      expect(dag.addEdge(data.b, data.c)).to.deep.equal(dag);
    });

  });

});
