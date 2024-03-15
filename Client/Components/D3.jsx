import React, { useEffect, useRef, useState } from 'react';
import Legend from './Legend.jsx';
import * as d3 from 'd3';


const PackChart = ({ data, options }) => {
    /*Using the useRef hook. The useRef Hook allows you to persist values between renders. */
  const svgRef = useRef(null);
 
  
  useEffect(() => {
  const svg = Pack(data, { ...options, value: (d) => d.size });

  let zoom = d3.zoom()
	.on('zoom', handleZoom)
  .scaleExtent([.5,4]);

  function handleZoom(e) {
    d3.select('svg g')
      .attr('transform', e.transform);
  }


    d3.select('svg')
    .call(zoom);
      


  svgRef.current.innerHTML = ''; // Clear existing SVG content
  svgRef.current.appendChild(svg.node()); // Append the SVG to the ref element

  
}, [data, options]);


  return (

      <svg ref={svgRef}></svg>
  );
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
  } = options;

  /* This part constructs the root node of the hierarchical data structure to be visualized. It uses the provided 
  path, id, and parentId properties from the options object, or defaults to using d3.hierarchy() if those properties 
  are not provided. Seems like we are not providing any of that data so its defaulting to d3.hierachy. Note; look up d3.hierarchy*/
  
  const root = d3.hierarchy(data);


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

  // console.log('Calling descendants', descendants);
  
  /*filtering the array of descendant nodes (descendants) to only include nodes that do not have children.
  !d.children evaluates to true if d.children is falsy or an empty array */

  const leaves = descendants.filter(d => !d.children);
  
  // console.log ('Loggin the leaves', leaves);
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

  // const links = data.children.flatMap(parent => {
  //   return parent.dependencies.flatMap(dependency => {
  //     const source = descendants.find(d => d.data.name === parent.name);
  //     const target = descendants.find(d => d.data.name === dependency.source);
  //       console.log('source', source, 'target', target)
  //     if (source && target) {
  //         return { source, target };
  //       }
  //       return null;
  //   });
  // }).filter(link => link !== null);

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
    .size([400, 400])
    .padding(padding)
    (root);




  

  const svg = d3.create("svg") // creates a new SVG element with the specified tag name, in this case, "svg".
    .attr("viewBox", [-marginLeft, -marginTop, width, height]) //This sets the viewBox attribute of the SVG element.
    .attr("width", width) // This sets the width attribute of the SVG element to the specified width (width), which was provided in the options object.
    .attr("height", height) //This sets the height attribute of the SVG element 
    .attr("style", "max-width: 100%; height: auto; height: intrinsic;") //more styling 
    .attr("font-family", "sans-serif") //more styling 
    .attr("font-size", 10) //more styling 
    .attr("text-anchor", "middle")//more styling 

    const g = svg.append("g")
    .attr("id", "pack");


  g.append("defs").append("marker")
    .attr("id", "arrowhead")
    .attr("viewBox", "-10 -10 25 25")
    .attr("refX", 0)
    .attr("refY", 0)
    .attr("orient", "auto")
    .attr("markerWidth", 5)
    .attr("markerHeight", 5)
    .append("path")
    .attr("d", "M0,5L-10,0L0,-5")
    .attr("fill", "#ccc");



    
    const filterLinks = (links, hoveredNode) => {
      // console.log('What is Hovered Node in filterLinks?', hoveredNode);
      const result = links.filter(link => link.source === hoveredNode || link.target === hoveredNode);
      console.log (`These are the filtered links from ${hoveredNode}`, result);
      return result;
    };

    const hoverIn = (event, node) => {
      console.log ('WHAT IS NODE? in hoverIn function', node);
      const filteredLinks = filterLinks(links, node);
      //if we want to change for this functionality to happen only on hover then we can make this a function ? 
  
     g.selectAll(".link")
    .data(filteredLinks) //instead of rendering all of the links we will only pass in the links of the current node being hovered. 
    .enter().append("line")
    .attr("class", "link")
    .style("stroke", "black")
    .style("stroke-width", 5)
    .attr("marker-start", "url(#arrowhead)") // Add this line to add the arrowhead
    .attr("x1", d => d.source.x)
    .attr("y1", d => d.source.y)
    .attr("x2", d => d.target.x)
    .attr("y2", d => d.target.y)
    .attr("stroke", "#ccc")
    .attr("stroke-width", 1);
   }

      const hoverOut = () => {
        svg.selectAll(".link").remove();
      };




      

/*this block of code dynamically creates and configures anchor elements within the SVG to represent each node in the 
hierarchical structure. It sets the href, target, and transform attributes of each anchor element based on the provided data 
and options. */
  const node = g.selectAll("a") //
    .data(descendants)
    .join("a")
    .attr("xlink:href", link == null ? null : (d, i) => link(d.data, d))
    .attr("target", link == null ? null : linkTarget)
    .attr("transform", d => `translate(${d.x},${d.y})`)
    .call(d3.drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended))
    .on("mouseover", hoverIn)
    .on("mouseout", hoverOut)
    
    

    // Drag functions
function dragstarted(event, d) {
  if (!event.active) root.fx = d.x;
  if (!event.active) root.fy = d.y;
  d3.select(this).attr("cursor", "grabbing").raise();
}

function dragged(event, d) {
  root.fx = event.x;
  root.fy = event.y;
  d3.select(this).attr("transform", `translate(${d.x = event.x},${d.y = event.y})`);
}

function dragended(event, d) {
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
    .on("mouseover", (event) => {
      d3.select(event.currentTarget).attr("stroke-width", 5);
    })
    .on("mouseout", (event) => {
      d3.select(event.currentTarget).attr("stroke-width", d => d.children ? strokeWidth : null)
    })
    .on("dblclick", (event, d) => zoomToNode(d));
    
    
    function zoomToNode(d) {
      const zoomLevel = 1/(((2*d.r))/(width)); // Adjust this value to control the zoom level
      const centerX = d.x; // Get the x-coordinate of the node
      const centerY = d.y; // Get the y-coordinate of the node
    
      console.log('d=========>', d)
      console.log('(2*d.r)=========>', (2*d.r), width,height )
      console.log('zoomLevel=========>', zoomLevel)
      // Create a new zoom transformation with the desired zoom level and center
      const newTransform = d3.zoomIdentity
        // .translate(centerX, centerY)
        .scale(zoomLevel)
        // .translate(centerX, centerY);
    
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

    /* This line of code dynamically creates and sets the title text for each node in the hierarchical structure based
     on the generated array of title texts (T). If T contains title texts for the nodes, they are appended to the corresponding
      title elements within each node's anchor element, providing additional information or context when hovering over the nodes 
      in the visualization. */ 

  if (T) node.append("title").text((d, i) => T[i]);

  if (L) {
    // const uid = `O-${Math.random().toString(16).slice(2)}`;

    const leaf = node
      .filter(d => !d.children && d.r > 10 && L[d.index] != null);

    // leaf.append("clipPath")
    //   .attr("id", d => `${uid}-clip-${d.index}`)
    //   .append("circle")
    //   .attr("r", d => d.r);

    leaf.append("text")
      // .attr("clip-path", d => `url(${new URL(`#${uid}-clip-${d.index}`, location)})`)
      .selectAll("tspan")
      .data(d => `${L[d.index]}`.split(/\n/g))
      .join("tspan")
      .attr("x", 0)
      .attr("y", (d, i, D) => `${(i - D.length / 2) + 0.85}em`)
      .attr("fill-opacity", (d, i, D) => i === D.length - 1 ? 0.7 : null)
      .text(d => d);
  }

  // return svg.node();
  //returning the svg without rendering it, this solves the double render issue
  return svg; 
};

const D3 = ({ hierarchyData }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (hierarchyData) {
      setData(hierarchyData);
    }
  }, [hierarchyData]);

  const options = {
    width: 928,
    height: 600,
    fill: "#ddd",
    stroke: "#bbb"
  };

  return (
    <div className='d3'>
      <h1>Pack Chart</h1>
      <Legend /> {/* Include the Legend component */}
      {data && <PackChart data={data} options={options} />}
    </div>
  );
};

export default D3;