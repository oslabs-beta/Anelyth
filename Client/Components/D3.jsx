import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';


const PackChart = ({ data, options }) => {
    /*Using the useRef hook. The useRef Hook allows you to persist values between renders. */
  const svgRef = useRef(null);
  
  useEffect(() => {
    const svg = d3.create("svg"); // Create SVG element

    const pack = Pack(data, options); // Pass location

    svg.selectAll("*").remove(); // Clear existing SVG content
    svg.node().appendChild(pack); // Append the generated SVG to the component's SVG

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
    label = (nodeData, node) => nodeData.label,
    title = (nodeData, node) => nodeData.title,
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
    fill = "#ddd",
    fillOpacity,
    stroke = "#bbb",
    strokeWidth,
    strokeOpacity,
  } = options;

  /* This part constructs the root node of the hierarchical data structure to be visualized. It uses the provided 
  path, id, and parentId properties from the options object, or defaults to using d3.hierarchy() if those properties 
  are not provided. Seems like we are not providing any of that data so its defaulting to d3.hierachy. Note; look up d3.hierarchy*/
  
  const root = d3.hierarchy(data);

  /* This line dynamically chooses whether to count the nodes or calculate the sum of values for the nodes based
   on the presence of the value property in the options object. In our case we are not setting a value to the value variable so 
   it is null */

   value == null ? root.count() : root.sum(d => Math.max(0, value(d)));

  /*root.count() is a method provided by D3.js for hierarchical data structures. When called on a root node of a hierarchical 
  structure (such as the one we created using d3.hierarchy()), it traverses the entire hierarchy and counts the number of nodes 
  in the tree. The result of root.count() is not explicitly stored in a variable in this code. Instead, it directly modifies 
  the hierarchy's nodes by adding a count property to each node, representing the count of descendant nodes for that particular 
  node. */
  
  /*This method, provided by D3.js, returns an array containing all descendant nodes of the root node. It traverses the hierarchical 
  structure and collects all nodes into an array, including the root node itself. */
  const descendants = root.descendants();

  console.log('Calling descendants', descendants);
  
  /*filtering the array of descendant nodes (descendants) to only include nodes that do not have children.
  !d.children evaluates to true if d.children is falsy or an empty array */

  const leaves = descendants.filter(d => !d.children);

  /* iterates through each leaf node in the leaves array and assigns an index to each leaf node. */
  leaves.forEach((d, i) => d.index = i);

  /*L is an array containing labels generated for each leaf node in the leaves array based on the provided 
  label function. If no label function is provided (i.e., label is null or undefined), L is assigned the value null. In this case
  the value of label is null so L is null */

  const L = label == null ? null : leaves.map(d => label(d.data, d));

  /* T is an array containing titles generated for each descendant node in the descendants array based on the provided title function. 
  sIf no title function is provided (i.e., title is null or undefined), T is assigned the value null.*/
  const T = title == null ? null : descendants.map(d => title(d.data, d));

  /* Checks if a sorting function (sort) is provided in the options object. If a sorting function is provided, it sorts the descendant 
  nodes of the root node (root) using that sorting function. In this case we are providing a sort function which is using d3.descending */

  if (sort != null) root.sort(sort);


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


/*this block of code dynamically creates and configures anchor elements within the SVG to represent each node in the 
hierarchical structure. It sets the href, target, and transform attributes of each anchor element based on the provided data 
and options. */
  const node = svg.selectAll("a") //
    .data(descendants)
    .join("a")
    .attr("xlink:href", link == null ? null : (d, i) => link(d.data, d))
    .attr("target", link == null ? null : linkTarget)
    .attr("transform", d => `translate(${d.x},${d.y})`);

    /*responsible for appending circle elements (<circle>) to the anchor elements (<a>) created earlier, and then setting 
    various attributes (such as fill color, stroke color, etc.) of these circle elements based on the data associated with
     each node (d). */
  node.append("circle")
    .attr("fill", d => d.children ? "#fff" : fill)
    .attr("fill-opacity", d => d.children ? null : fillOpacity)
    .attr("stroke", d => d.children ? stroke : null)
    .attr("stroke-width", d => d.children ? strokeWidth : null)
    .attr("stroke-opacity", d => d.children ? strokeOpacity : null)
    .attr("r", d => d.r);

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

  return svg.node();
};









//Uncomment this if you want to use test data. 
const D3 = () => {
  // const data = {
  //   name: "Root",
  //   children: [
  //     {
  //       name: "Node 1",
  //       children: [
  //         { name: "Node 1.1", value: 10 },
  //         { name: "Node 1.2", value: 15 },
  //         { name: "Node 1.3", value: 20 }
  //       ]
  //     },
  //     {
  //       name: "Node 2",
  //       children: [
  //         {
  //           name: "Node 2.1",
  //           children: [
  //             { name: "Node 2.1.1", value: 5 },
  //             { name: "Node 2.1.2", value: 8 }
  //           ]
  //         },
  //         { name: "Node 2.2", value: 12 }
  //       ]
  //     },
  //     {
  //       name: "Node 3",
  //       children: [
  //         { name: "Node 3.1", value: 18 },
  //         { name: "Node 3.2", value: 25 },
  //         { name: "Node 3.3", value: 30 }
  //       ]
  //     }
  //   ]
  // };

  const data = {
    name: "Root",
    title: "Root Title",
    label: "Root Label",
    children: [
        {
            name: "Node 1",
            title: "Node 1 Title",
            label: "Node 1 Label",
            children: [
                { name: "Leaf 1.1", value: 10, title: "Leaf 1.1 Title", label: "Leaf 1.1 Label" },
                { name: "Leaf 1.2", value: 15, title: "Leaf 1.2 Title", label: "Leaf 1.2 Label" }
            ]
        },
        {
            name: "Node 2",
            title: "Node 2 Title",
            label: "Node 2 Label",
            children: [
                { name: "Leaf 2.1", value: 12, title: "Leaf 2.1 Title", label: "Leaf 2.1 Label" }
            ]
        }
    ]
};


  

  const options = {
    width: 500,
    height: 500,
    fill: "#ddd",
    stroke: "#bbb"
  };

  return (
    <div className='d3'>
      <h1>Pack Chart</h1>
      <PackChart data={data} options={options} />
    </div>
  );
};

export default D3;

// const D3 = ({ hierarchyData }) => {

//   const [data, setData] = useState(null);

//   useEffect(() => {
//     if (hierarchyData) {
//       setData(hierarchyData);
//     }
//   }, [hierarchyData]);

//   const options = {
//     width: 500,
//     height: 500,
//     fill: "#ddd",
//     stroke: "#bbb"
//   };

//   return (
//     <div className='d3'>
//       <h1>Pack Chart</h1>
//       {data && <PackChart data={data} 
//       options={options} 
//       />}
//     </div>
//   );
// };

// export default D3;