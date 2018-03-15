(function (root, factory) {

  // UMD
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.Dagger = factory();
  }

}(this, function () {

  /**
   * @typedef Dagger
   */

  /**
   * A Directed Acyclic Graph Implementation
   * by yours truly
   * @access public
   * @module Dagger
   *
   * @param {Object} opts Options for configuring the DAG.
   * @param {String} opts.uniqueKey Unique key
   * @param {String} opts.descriptionKey Description key
   * @param {Boolean} [opts.checkCycles=false] Flag indicating whether we should check for cycles. Set to <code>true</code> to check for cycles.
   * @param {Boolean} [opts.debug=false] Flag indicating we're running in debug mode. Set to <code>true</code> to enable debug mode.
   *
   * @return {Dagger} A directed acyclic graph.
   */
  const Dagger = function (opts) {

    /**
     * set defaults
     */
    let key   = opts.uniqueKey || "id";
    let dKey  = opts.descriptionKey || "text";
    let debug = opts.debug === true;

    /**
     * should #addEdge check for cycles and error if found?
     */
    let checkCycles = opts.checkCycles === true;

    /**
     * node to set<node> parent mapping
     * @access private
     */
    let parents = {};

    /**
     * node to set<node> children mapping
     */
    let children = {};

    /**
     * uniqueKey to node mapping
     */
    let nodes = {};

    /**
     * the root node
     */
    let root = null;

    /**
     * @typedef Node
     */

    /**
     * A node in the graph
     * @class Node
     *
     * @param {Object} data The data held by the <code>Node</code>.
     * @return {Node} A node in the DAG.
     */
    let Node = function (data) {

      /**
       * Information stored in the node.
       * Should contain key of name <code>opts.uniqueKey</code>.
       * @access private
       */
      this.data = data;

      /**
       * Get all parents of this <code>Node</code>.
       * @access public
       * @function parents
       * @return {Array} List of all parents of this <code>Node</code>.
       */
      this.parents = function () {
        return parents[this.data[key]];
      };

      /**
       * Get all children of this <code>Node</code>.
       * @access public
       * @function children
       * @return {Array} List of all children of this <code>Node</code>.
       */
      this.children = function () {
        return children[this.data[key]];
      };

      /**
       * Check if node data matches query.
       * @access public
       * @function matches
       * @param {Object} query Data to query.
       * @return {Boolean} <code>true</code> if there is a match, <code>false</code> otherwise.
       */
      this.matches = function (query) {

        if (!query || Object.keys(query).length === 0) {
          return false;
        }

        for (let k in query) {
          if (!query.hasOwnProperty(k)) {
            continue;
          }

          if (query[k] !== this.data[k]) {
            return false;
          }
        }

        return true;
      }

      /**
       * Quick equals method, compare two nodes.
       * @access public
       * @function equals
       * @param {Node} anotherNode <code>Node</code> to compare against.
       * @return {Boolean} <code>true</code> if the <code>Node</code>s match, <code>false</code> otherwise.
       */
      this.equals = function (anotherNode) {
        return this.matches(anotherNode.data);
      }

      /**
       * iterate through a collection of objects, applying onVisit to each element
       * @access private
       * @function eachNodeIn
       * @param {Array} collection Array of <code>Node</code>s to iterate.
       * @param {Function} onVisit Iterator function that is called on each <code>Node</code> as it is visited.
       * @return {void}
       */
      const eachNodeIn = function (collection, onVisit) {

        if (collection) {
          for (let i = 0; i < collection.length; i++) {
            onVisit(nodes[collection[i]]);
          }
        }
      }

      /**
       * Helper function for iterating through each child.
       * @access private
       * @function childrenEach
       * @param {Function} onVisit Iterator function that is called on each <code>Node</code> as it is visited.
       * @return {Array} Array of all visited <code>Node</code>s.
       */
      this.childrenEach = function (onVisit) {
        return eachNodeIn(this.children(), onVisit);
      }

      /**
       * Helper function for iterating through each parent.
       * @access private
       * @function parentsEach
       * @param {Function} onVisit Iterator function that is called on each <code>Node</code> as it is visited.
       * @return {Array} Array of all visited <code>Node</code>s.
       */
      this.parentsEach = function (onVisit) {
        return eachNodeIn(this.parents(), onVisit);
      }

      /**
       * Remove self from graph explosively.
       * @access public
       * @function removeFromGraph
       * @return {void}
       */
      this.removeFromGraph = function () {

        let cutEach = (toRemove, collection) => {

          eachNodeIn(toRemove, (node) => {

            let toCut = collection[node.data.key];

            if (toCut) {
              let index = toCut.indexOf(this.data[key]);
              delete collection[node.data.key][index];
            }
          });

        };

        cutEach(this.children(), parents);
        cutEach(this.parents(), children);

        delete parents[this.data[key]];
        delete children[this.data[key]];
        delete nodes[this.data[key]];

      };
    };

    /**
     * Only console log if we're in debug.
     * @access private
     * @function log
     *
     * @param {String} message Message to print.
     * @param {Object} obj JSON object to print.
     * @return {void}
     */
    const log = function (message, obj) {

      if (debug === true) {
        if (obj) {
          message += " " + JSON.stringify(obj, null, 2);
        }

        console.log("[INFO] " + message);
      }
    }

    /**
     * Get all <code>Node</code>s.
     * @access public
     * @function nodes
     * @return {Array} Array of all nodes in the graph.
     */
    this.nodes = function () {
      return nodes;
    };

    /**
     * Wrap data in a node and add it to nodes object.
     * @param {Object} data Data to add to the vertex.
     * @return {void}
     */
    this.addVertex = function (data) {
      if (data[key] && !nodes[data[key]]) {
        nodes[data[key]] = new Node(data);
      }
    };

    /**
     * Add an edge between parent and child
     * @param {Object} parent Parent node.
     * @param {Object} child Child node.
     * @return {Dagger} The DAG for chaining.
     */
    this.addEdge = function (parent, child) {

      if (!parent || !child) {
        return this;
      }

      let rootNode   = nodes[root];
      let parentNode = nodes[parent[key]];
      let childNode  = nodes[child[key]];

      checkCyclesInEdge(parentNode, childNode);

      let query  = {};
      query[key] = root;

      if (!rootNode || (childNode && childNode.matches(query))) {
        root = parent[key];
        this.addVertex(root);
        log('added new root node "' + root + '"');
      }

      let childrenOfParent = children[parent[key]] || [];
      let parentsOfChild   = parents[child[key]] || [];

      childrenOfParent.push(child[key]);
      parentsOfChild.push(parent[key]);

      children[parent[key]] = childrenOfParent;
      parents[child[key]]   = parentsOfChild;

      this.addVertex(parent);
      this.addVertex(child);

      return this;
    };

    /**
     * Find the edge between two nodes.
     * @access private
     * @function findEdge
     * @param {Node} n1 First node.
     * @param {Node} n2 Second node.
     * @param {Array} edge The edge to find.
     * @param {Function} onVisit Iterator function that is called on each <code>Node</code> as it is visited.
     * @return {Array} Edge in graph
     */
     const findEdge = function (n1, n2, edge = [], onVisit) {

       if (!n1 || !n2) {
           return [];
       }

       let query  = {};
       query[key] = n2.data[key];

       let match = dfs({ start: n1, q: query });

       if (match) {
         if (onVisit && typeof onVisit === 'function') {
           edge.push(onVisit(n1.data));
         } else {
           edge.push(n1.data);
         }
       }

       if (n1) {
         n1.childrenEach((child) => {
           findEdge(child, n2, edge, onVisit);
         });
       }

       return edge;
     }

    /**
     * Find the edge between two verticies
     * @param {Object} v1 First vertex.
     * @param {Object} v2 Second vertex.
     * @param {Function} onVisit Iterator function that is called on each <code>Node</code> as it is visited.
     * @return {Array} Path from <code>v1</code> to <code>v2</code>.
     */
    this.findEdge = function (v1, v2, onVisit) {
      return findEdge(nodes[v1[key]], nodes[v2[key]], [], onVisit);
    }

    /**
     * Check for cycles in the graph and throw an exception if found.
     * @access private
     * @function checkCyclesInEdge
     * @throws Will throw an exception if there is a cycle.
     *
     * @param {Node} parent The parent node.
     * @param {Node} child The child node.
     * @return {void}
     */
    const checkCyclesInEdge = function (parent, child) {

      if (!checkCycles) {
        return;
      }

      if (child && parent) {

        let edge = findEdge(child, parent);
        if (edge.length > 1) {

          let ex = 'adding edge would create cycle in the graph: "'
            + parent.data[key]
            + '" -> "'
            + child.data[key]
            + '"';

          throw ex;
        }
      }
    }

    /**
     * Remove an edge between parent and child, connects child to parent's parents
     * @access public
     * @function removeEdge
     * @param {Object} parent Parent node.
     * @param {Object} child Child node.
     * @return {void}
     */
    this.removeEdge = function (parent, child) {

      if (!parent || !child) {
        return;
      }

      let childrenOfParent = children[parent[key]];
      let parentsOfChild   = parents[child[key]];

      if (!childrenOfParent || !parentsOfChild) {
        log('attempting to remove an edge that does not exist');
        return;
      }

      let childIndex  = childrenOfParent.indexOf(child[key]);
      let parentIndex = parentsOfChild.indexOf(parent[key]);

      delete childrenOfParent[childIndex];
      delete parentsOfChild[parentIndex];

      children[parent[key]] = childrenOfParent;
      parents[child[key]]   = parentsOfChild;

      log('removed edge between "'
        + parent[key]
        + '" and "'
        + child[key]
        + '"');
    };

    /**
     * Remove a vertex from the graph, connecting children of v to parents
     * @access public
     * @function removeVertex
     *
     * @param {Object} v Vertex to remove
     * @return {void}
     */
    this.removeVertex = function (v) {

      let node = nodes[v[key]];
      if (node) {

        let parentsOfVertex  = parents[v[key]];
        let childrenOfVertex = children[v[key]];

        node.removeFromGraph();

        if (parentsOfVertex && childrenOfVertex) {
          for (let i = 0; i < parentsOfVertex.length; i++) {
            for (let j = 0; j < childrenOfVertex.length; j++) {

              log('adding edge between "'
                + parentsOfVertex[i] + '" and "' + childrenOfVertex[j] + '"');
              this.addEdge(nodes[parentsOfVertex[i]].data, nodes[childrenOfVertex[j]].data);

            }
          }
        }

        log('removed vertex "' + v[key] + '"');

      } else {
        log('attempted to remove vertex that does not exist');
      }
    }

    /**
     * A recursive depth-first search implementation.
     * @access private
     * @function dfs
     *
     * @param {Object} params Search parameters.
     * @param {Node} params.start starting node
     * @param {Object} params.q key-value pairs to match on
     * @param {String} params.direction up or down
     * @param {Number} params.depth depth of search
     * @param {Function} onVisit Iterator function that is called on each <code>Node</code> as it is visited.
     *
     * @return {Object} match if query given
     */
    const dfs = function (params, onVisit) {

      if (!params || Object.keys(params).length === 0) {
          params = {};
      }

      if (typeof params.start === 'undefined') {
          params.start = nodes[root];
      }

      let node  = params.start
        , query = params.q
        , depth = params.depth || 0
        , hasQuery  = query && Object.keys(query).length > 0
        , direction = params.direction;

      if (typeof onVisit === 'function') {
        onVisit(node, depth);
      }

      if (hasQuery && node.matches(query)) {

        return node.data;

      } else {

        let items = direction === 'up'
          ? node.parents()
          : node.children();

        if (items) {

          for (let i = 0; i < items.length; i++) {

            let recNode = nodes[items[i]];
            if (recNode) {
                let recParams = {
                start: nodes[items[i]],
                depth: depth + 1,
                q: query,
                direction: direction
                };

                let match = dfs(recParams, onVisit);

                if (hasQuery && match) {
                return match;
                }
            }
          }
        }
      }
    };

    /**
     * A recursive depth-first search implementation.
     * @access public
     * @function dfs
     *
     * @param {Object} params Search parameters.
     * @param {Node} params.start starting node
     * @param {Object} params.query key-value pairs to match on
     * @param {String} params.direction up or down
     * @param {Number} params.depth depth of search
     * @param {Function} onVisit Iterator function that is called on each <code>Node</code> as it is visited.
     *
     * @return {Object} match if query given
     */
    this.dfs = function (params, onVisit) {
      return dfs(params, (node) => {
        onVisit(node.data);
      });
    }

    /**
     * Do a depth-first search starting at v, moving in given direction
     * @access private
     * @function relativesOf
     *
     * @param {Object} v Vertex to start at,
     * @param {String} direction Direction to search. 'up' or 'down'.
     * @param {Function} onVisit Iterator function that is called on each <code>Node</code> as it is visited.
     * @return {Array} relatives
     */
    const relativesOf = function (v, direction, onVisit) {

      let node = nodes[v[key]];
      let relatives = []
        , dfsParams = {
          direction: direction,
          start: node
        };

      dfs(dfsParams, function (relative) {
        if (!relative.equals(node)) {
          if (onVisit && typeof onVisit === "function") {
            relatives.push(onVisit(relative.data));
          } else {
            relatives.push(relative.data);
          }
        }
      });

      return relatives;
    }

    /**
     * Get all descendants of a vertex.
     * @access public
     * @function descendantsOf
     *
     * @param {Object} v Vertex to find descendents of.
     * @param {Function} onVisit Iterator function that is called on each <code>Node</code> as it is visited.
     * @return {Array} Descendants.
     */
    this.descendantsOf = function (v, onVisit) {
      return relativesOf(v, 'down', onVisit);
    };

    /**
     * Get all ancestors of a vertex.
     * @access public
     * @function ancestorsOf
     *
     * @param {Object} v Vertext to find ancestors of.
     * @param {Function} onVisit Iterator function that is called on each <code>Node</code> as it is visited.
     * @return {Array} Ancestors.
     */
    this.ancestorsOf = function (v, onVisit) {
      return relativesOf(v, 'up', onVisit);
    };

    /**
     * Get a simple text representation of the graph.
     * @access public
     * @function toString
     *
     * @return {String} String representation of the DAG.
     */
    this.toString = function () {

      let str = "";

      this.dfs({}, function (node, depth) {

        if (node === undefined) {
          return "";
        }

        for (let i = 0; i < depth + 1; i++) {
          str += "-";
        }

        str += " ";
        str += node.data[key]
        str += " ("
        str += node.data[dKey]
        str += ")"
        str += "\n";

      });

      return str;
    };
  };

  return Dagger;

}));
