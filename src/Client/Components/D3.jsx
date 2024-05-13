
import Legend from './Legend.tsx';

//Last 9:18 pm 


import * as d3 from 'd3';
import React, { useEffect, useRef, useState } from 'react';
import '../Styles/d3.css';



const PackChart = ({ data, options, hoveredMicroservice }) => {
  /*Using the useRef hook. The useRef Hook allows you to persist values between renders. */
  const svgRef = useRef(null);
  
  useEffect(() => {
    const svg = Pack(data, { ...options, value: (d) => d.size });
    let zoom = d3.zoom()
    .on('zoom', handleZoom)
    .scaleExtent([.5,4])
    .translateExtent([[0, 0], [2000, 2000]]);
  
    function handleZoom(e) {
      d3.select('svg g')
        .attr('transform', e.transform);
    }

    d3.select('svg')
    .call(zoom);
    
    svgRef.current.innerHTML = ''; // Clear existing SVG content
    svgRef.current.appendChild(svg.node()); // Append the SVG to the ref element
  }, [data, options]);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const nodes = svg.selectAll('circle');

    // Update node color or highlight based on hoveredMicroservice
    nodes.each(function(d) {
      if (d && d.data && hoveredMicroservice !== null && hoveredMicroservice.includes(d.data.name)) {
        d3.select(this).attr('fill', 'yellow'); // Highlight color
      } 
    });
  }, [hoveredMicroservice]);

  return <svg ref={svgRef}></svg>;
};
const Pack = (data, options) => { //data and options are props passed down from App
  const { 
    value,
    sort = (a, b) => d3.descending(a.value, b.value),
    label = (nodeData, node) => nodeData.name,
    title = (nodeData, node) => nodeData.name,
    link,
    linkTarget = "_blank",
    width,
    height,
    margin = 1,
    marginTop = margin,
    marginRight = margin,
    marginBottom = margin,
    marginLeft = margin,
    padding = 3,
    fill,
    fillOpacity,
    stroke,
    strokeWidth,
    strokeOpacity,
    onNodeClick
  } = options;

  /* This part constructs the root node of the hierarchical data structure to be visualized. It uses the provided 
  path, id, and parentId properties from the options object, or defaults to using d3.hierarchy() if those properties 
  are not provided. Seems like we are not providing any of that data so its defaulting to d3.hierachy. Note; look up d3.hierarchy*/
  
  const root = d3.hierarchy(data);

  /* This line dynamically chooses whether to count the nodes or calculate the sum of values for the nodes based
   on the presence of the value property in the options object. In our case we are not setting a value to the value variable so 
   it is null */

  //  value == null ? root.count() : root.sum(d => Math.max(0, value(d)));
  root.sum((d) => d.value || 0); // Sum the file sizes

  const maxDepth = getMaxDepth(root); // Calculate the maximum depth of the hierarchy

  const calculateOpacity = (depth) => {
    const maxOpacity = 1; // Maximum opacity
  const minOpacity = 0.025; // Minimum opacity (increased from 0.2)
  const opacityIncrement = 0.1; // Increment value for opacity
  // Calculate the opacity based on a linear scale with an increment
  return Math.min(minOpacity + opacityIncrement * depth, maxOpacity);
  };

  // Function to calculate the maximum depth of the hierarchy
  function getMaxDepth(node) {
    if (!node.children) return 0;
    return 1 + Math.max(...node.children.map(getMaxDepth));
  }

  
  /*This method, provided by D3.js, returns an array containing all descendant nodes of the root node. It traverses the hierarchical 
  structure and collects all nodes into an array, including the root node itself. */
  const descendants = root.descendants();

  console.log('Calling descendants', descendants);
  
  /*filtering the array of descendant nodes (descendants) to only include nodes that do not have children.
  !d.children evaluates to true if d.children is falsy or an empty array */

  const leaves = descendants.filter(d => !d.children);
  
  console.log ('Loggin the leaves', leaves);
  /* iterates through each leaf node in the leaves array and assigns an index to each leaf node. */
  leaves.forEach((d, i) => d.index = i);

  /*L is an array containing labels generated for each leaf node in the leaves array based on the provided 
  label function. If no label function is provided (i.e., label is null or undefined), L is assigned the value null. In this case
  the value of label is null so L is null */

  const L = label == null ? null : leaves.map(l => label(l.data, l));


  /* T is an array containing titles generated for each descendant node in the descendants array based on the provided title function. 
  sIf no title function is provided (i.e., title is null or undefined), T is assigned the value null.*/
  const T = title == null ? null : descendants.map(d => title(d.data, d));

  /* Checks if a sorting function (sort) is provided in the options object. If a sorting function is provided, it sorts the descendant 
  nodes of the root node (root) using that sorting function. In this case we are providing a sort function which is using d3.descending */

  if (sort != null) root.sort(sort);

  const links = generateLinks(data);

  function generateLinks(node) {
    const links = [];
    if (node.children) {
      node.children.forEach(child => {
        if (child.dependencies) {
          child.dependencies.forEach(dependency => {
            const sourceNode = descendants.find(d => d.data.name === child.name);
            const targetNode = descendants.find(d => d.data.name === dependency.source);
            if (sourceNode && targetNode) {
              links.push({ source: sourceNode, target: targetNode });
            }
          });
        }
        links.push(...generateLinks(child));
      });
    }
    return links;
  }

  d3.pack()
    .size([width - marginLeft - marginRight, height - marginTop - marginBottom])
    .padding(padding)
    (root);


  const svg = d3.create("svg") // creates a new SVG element with the specified tag name, in this case, "svg".
    .attr("viewBox", [-marginLeft, -marginTop, width, height]) //This sets the viewBox attribute of the SVG element.
    .attr("width", width) // This sets the width attribute of the SVG element to the specified width (width), which was provided in the options object.
    .attr("height", height) //This sets the height attribute of the SVG element 
    .attr("style", "max-width: 100%; height: auto; height: intrinsic;") //more styling 
    .attr("font-family", "sans-serif") //more styling 
    .attr("font-size", 10) //more styling 
    .attr("text-anchor", "middle"); //more styling 


  const g = svg.append("g")
  .attr("id", "pack");


g.append("defs")
.append("marker")
  .attr("id", "circle-marker")
  .attr("markerWidth", 12) // Enlarge the marker width
  .attr("markerHeight", 12) // Enlarge the marker height
  .attr("refX", 6) // Position the marker at the end of the line
  .attr("refY", 6)
  .append("circle")
  .attr("cx", 6)
  .attr("cy", 6)
  .attr("r", 3) // Radius of the circle
  .style("fill", "yellow") // Color of the circle
  .style("filter", "drop-shadow(0 0 5px rgba(255, 255, 0, 0.7))"); // Glow effect




    const filterLinks = (links, hoveredNode) => {
      console.log('What is Hovered Node in filterLinks?', hoveredNode);
      const result = links.filter(link => link.source === hoveredNode || link.target === hoveredNode);
      console.log (`These are the filtered links from ${hoveredNode}`, result);
      return result;
    };
    
    
  let isDragging = false;
    
      

    const hoverIn = (event, node) => {

      if (isDragging) return;
      const filteredLinks = filterLinks(links, node);
      
        // Select all existing links and remove them
        g.selectAll(".link").remove();
      
        // Append new lines for the filtered links with animation
        g.selectAll(".link")
          .data(filteredLinks)
          .enter()
          .append("line")
          .attr("class", "link")
          .style("stroke", "yellow") // Set the color of the links to black
          // .style("stroke-dasharray", "5,5") // Define the dashed pattern
          .style("stroke-width", 6) // Set the width of the lines
          .style("opacity", .6)
          .attr("x1", d => d.target.x) // Set initial positions to target node
          .attr("y1", d => d.target.y) // Set initial positions to target node
          .attr("x2", d => d.target.x) // Set initial positions to target node
          .attr("y2", d => d.target.y) // Set initial positions to target node
          .transition()
          .duration(500) // Set the duration of the transition in milliseconds
          .ease(d3.easeLinear)
          .attr("x2", d => d.source.x) // Transition to source node positions
          .attr("y2", d => d.source.y) // Transition to source node positions
          svg.selectAll("circle")
    .filter(d => filteredLinks.some(link => link.source === d || link.target === d))
    .attr("stroke-width", 3) // Set thicker stroke
    .attr("stroke", "yellow"); // Set highlight color

    };

    const hoverOut = () => {
      // Remove all links
      svg.selectAll(".link").remove();
      svg.selectAll("circle")
    .attr("stroke-width", strokeWidth) // Restore original stroke width
    .attr("stroke", stroke); // Restore original stroke color
    };

    
   
  
/*this block of code dynamically creates and configures anchor elements within the SVG to represent each node in the 
hierarchical structure. It sets the href, target, and transform attributes of each anchor element based on the provided data 
and options. */
  const node = g.selectAll("g") //
    .data(descendants)
    .join("g")
    .attr("transform", d => `translate(${d.x},${d.y})`)
    .call(d3.drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended))
    .on("mouseover", hoverIn)
    .on("mouseout", hoverOut);


function dragstarted(event, d) {
  isDragging = true;
  if (!event.active) root.fx = d.x;
  if (!event.active) root.fy = d.y;
  if (!d.children) {
    // If it's a leaf node, initiate the drag behavior
    d3.select(this).attr("cursor", "grabbing").raise();
  } else {
    d3.select(this).attr("cursor", "grabbing")
    
  }
}

function dragged(event, d) {
  // Update the position of the dragged node
  root.fx = event.x;
  root.fy = event.y;
  d3.select(this).attr("transform", `translate(${d.x = event.x},${d.y = event.y})`);
}


function dragended(event, d) {
  isDragging = false;
  if (!event.active) root.fx = null;
  if (!event.active) root.fy = null;
  d3.select(this).attr("cursor", "grab");
}

    /*responsible for appending circle elements (<circle>) to the anchor elements (<a>) created earlier, and then setting 
    various attributes (such as fill color, stroke color, etc.) of these circle elements based on the data associated with
     each node (d). */
  node.append("circle")
    .attr("fill", d => d.children ? "#016e91" : (d.data.color || fill)) //this is changing the color based on the color being passed in on the node data
    .attr("fill-opacity", d => calculateOpacity(d.depth)) // Calculate opacity based on depth
    .attr("stroke", stroke)
    .attr("stroke-width", strokeWidth)
    .attr("stroke-opacity", strokeOpacity)
    .attr("r", d => d.r)
    .style("cursor", "grab") // Set cursor style to grab
    .on("mouseover", (event) => {
      d3.select(event.currentTarget).attr("stroke-width", 5);
    })
    .on("mouseout", (event) => {
      d3.select(event.currentTarget).attr("stroke-width", d => d.children ? strokeWidth : null);
    })
    .on("click", (event, d) => {
      //take the data in this node and pass it to the state of D3 parent component to render the node data modal
      onNodeClick(d.data);
    })
    .on("dblclick", (event, d) => zoomToNode(event, d));    
  
    function zoomToNode(event, d) {
      const zoomLevel = width/(2*d.r + 40); // Adjust this value to control the zoom level
      const centerX = d.x; // Get the x-coordinate of the node
      const centerY = d.y; // Get the y-coordinate of the node
    
      console.log('d=========>', d)
      console.log('event=========>', event)
      // Create a new zoom transformation with the desired zoom level and center
      const newTransform = d3.zoomIdentity
        .translate((width / 2 - centerX * zoomLevel),(height / 2 - centerY * zoomLevel))
        .scale(zoomLevel)
        // .translate(d.x-event.x,d.y-event.y);
    
      // Apply the new zoom transformation to the svg element
      d3.select('svg g')
        .transition()
        .duration(1500) // Adjust the duration for a smoother animation
        .attr('transform', newTransform);
    }    
  


    /* This line of code dynamically creates and sets the title text for each node in the hierarchical structure based
     on the generated array of title texts (T). If T contains title texts for the nodes, they are appended to the corresponding
      title elements within each node's anchor element, providing additional information or context when hovering over the nodes 
      in the visualization. */ 

  if (T) node.append("title").text((d, i) => T[i]);

  if (L) {
    const uid = `O-${Math.random().toString(16).slice(2)}`;

    const leaf = node.filter(
      (d) => !d.children && d.r > 10 && L[d.index] != null
    );

    leaf.append("clipPath")
      .attr("id", d => `${uid}-clip-${d.index}`)
      .append("circle")
      .attr("r", d => d.r);

    leaf.append("text")
      .attr("clip-path", d => `url(${new URL(`#${uid}-clip-${d.index}`, location)})`)
      .selectAll("tspan")
      .data((d) => `${L[d.index]}`.split(/\n/g))
      .join("tspan")
      .attr("x", 0)
      .attr("y", (d, i, D) => `${i - D.length / 2 + 0.85}em`)
      .attr("fill-opacity", (d, i, D) => (i === D.length - 1 ? 0.7 : null))
      .text((d) => d);
  }

  const simulation = d3.forceSimulation()
    // .force("charge", d3.forceManyBody().strength(1)) // Nodes are attracted to each other if value is > 0
    .force("collide", d3.forceCollide().strength(.1).radius(2)) // Force that avoids circle overlapping
    .alphaDecay(0) // Disable alpha decay
    .alpha(1); // Set initial alpha value

  // Apply these forces to the nodes
  simulation.nodes(leaves)
    .on("tick", () => {
      // Update node positions on each tick
      node.attr("transform", d => `translate(${d.x},${d.y})`);
    });


  // return svg.node();
  //returning the svg without rendering it, this solves the double render issue
  return svg; 
};








const D3 = ({ hierarchyData, popupShowing, setPopupShowing, setClickedNodeData, hoveredMicroservice }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (hierarchyData) {
      setData(hierarchyData);
    }
  }, [hierarchyData]);

  function handleNodeClick(nodeData) {
    setClickedNodeData(nodeData);
    setPopupShowing(!popupShowing);
  }

  const options = {
    width: 1000,
    height: 820,
    fill: "#ddd",
    stroke: "#bbb",
    onNodeClick: handleNodeClick
  };

  return (
    <div className="d3">
      <div className='d3-title-container'>
        <h1>Repository Overview</h1>
        <Legend /> {/* Include the Legend component */}
      </div>
      {data && <PackChart data={data} options={options} hoveredMicroservice={hoveredMicroservice} />}
    </div>
  );
};

export default D3;


