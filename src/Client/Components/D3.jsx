import Legend from "./Legend.tsx";

import * as d3 from "d3";

import React, { useEffect, useRef, useState } from "react";

import "../Styles/d3.css";

const PackChart = ({ data, options, hoveredMicroservice }) => {
  const svgRef = useRef(null);

  const adjustTextSizeRef = useRef(null);

  let clickCount = 0;

  let clickTimer = null;

  const resetZoom = () => {
    d3.select(svgRef.current)

      .select("g")

      .transition()

      .duration(1800)

      .attr("transform", d3.zoomIdentity);

    if (adjustTextSizeRef.current) {
      adjustTextSizeRef.current(1); // Adjust text size to the default zoom level
    }
  };

  const handleTripleClick = () => {
    clickCount++;

    if (clickCount === 3) {
      resetZoom();

      clickCount = 0;
    }

    clearTimeout(clickTimer);

    clickTimer = setTimeout(() => {
      clickCount = 0;
    }, 500);
  };

  useEffect(() => {
    const { svg, adjustTextSize, initialZoomLevel } = Pack(data, {
      ...options,

      value: (d) => d.size,
    });

    svg.on("click", handleTripleClick);

    adjustTextSizeRef.current = adjustTextSize;

    svgRef.current.innerHTML = ""; // Clear existing SVG content

    svgRef.current.appendChild(svg.node()); // Append the SVG to the ref element

    // Set initial text visibility based on the initial zoom level

    adjustTextSize(initialZoomLevel);
  }, []);

  // useEffect(() => {

  // const svg = d3.select(svgRef.current);

  // const nodes = svg.selectAll("circle");

  // nodes.each(function (d) {

  // if (

  // d &&

  // d.data &&

  // hoveredMicroservice !== null &&

  // hoveredMicroservice.includes(d.data.name)

  // ) {

  // d3.select(this).attr("fill", "yellow"); // Highlight color

  // }

  // });

  // }, []);

  // Update node highlighting based on hoveredMicroservice prop

  useEffect(() => {
    const svg = d3.select(svgRef.current);

    const nodes = svg.selectAll("circle");

    nodes.each(function (d) {
      if (d && d.data) {
        d3.select(this).attr("fill", (d) =>
          hoveredMicroservice && hoveredMicroservice.includes(d.data.name)
            ? "yellow"
            : d.children
            ? "#016e91"
            : d.data.color || options.fill
        );
      }
    });
  }, [hoveredMicroservice, options.fill]);

  return <svg ref={svgRef}></svg>;
};

const Pack = (data, options) => {
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

    onNodeClick,
  } = options;

  const root = d3.hierarchy(data);

  root.sum((d) => d.value || 0);

  const maxDepth = getMaxDepth(root);

  const calculateOpacity = (depth) => {
    const maxOpacity = 1;

    const minOpacity = 0.025;

    const opacityIncrement = 0.1;

    return Math.min(minOpacity + opacityIncrement * depth, maxOpacity);
  };

  function getMaxDepth(node) {
    if (!node.children) return 0;

    return 1 + Math.max(...node.children.map(getMaxDepth));
  }

  const descendants = root.descendants();

  const leaves = descendants.filter((d) => !d.children);

  leaves.forEach((d, i) => (d.index = i));

  const L = label == null ? null : leaves.map((l) => label(l.data, l));

  const T = title == null ? null : descendants.map((d) => title(d.data, d));

  if (sort != null) root.sort(sort);

  const links = generateLinks(data);

  function generateLinks(node) {
    const links = [];

    if (node.children) {
      node.children.forEach((child) => {
        if (child.dependencies) {
          child.dependencies.forEach((dependency) => {
            const sourceNode = descendants.find(
              (d) => d.data.name === child.name
            );

            const targetNode = descendants.find(
              (d) => d.data.name === dependency.source
            );

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

  d3

    .pack()

    .size([width - marginLeft - marginRight, height - marginTop - marginBottom])

    .padding(padding)(root);

  const svg = d3

    .create("svg")

    .attr("viewBox", [-marginLeft, -marginTop, width, height])

    .attr("width", width)

    .attr("height", height)

    .attr("style", "max-width: 100%; height: auto; height: intrinsic;")

    .attr("font-family", "sans-serif")

    .attr("font-size", 10)

    .attr("text-anchor", "middle");

  svg.on("dblclick", (event) => zoomToNode(event, root));

  const g = svg.append("g").attr("id", "pack");

  g.append("defs")

    .append("marker")

    .attr("id", "circle-marker")

    .attr("markerWidth", 12)

    .attr("markerHeight", 12)

    .attr("refX", 6)

    .attr("refY", 6)

    .append("circle")

    .attr("cx", 6)

    .attr("cy", 6)

    .attr("r", 3)

    .style("fill", "yellow")

    .style("filter", "drop-shadow(0 0 5px rgba(255, 255, 0, 0.7))");

  const filterLinks = (links, hoveredNode) => {
    console.log("What is Hovered Node in filterLinks?", hoveredNode);

    const result = links.filter(
      (link) => link.source === hoveredNode || link.target === hoveredNode
    );

    console.log(`These are the filtered links from ${hoveredNode}`, result);

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

      .style("stroke", "yellow")

      .style("stroke-width", 6)

      .style("opacity", 0.6)

      .attr("x1", (d) => d.target.x)

      .attr("y1", (d) => d.target.y)

      .attr("x2", (d) => d.target.x)

      .attr("y2", (d) => d.target.y)

      .transition()

      .duration(500)

      .ease(d3.easeLinear)

      .attr("x2", (d) => d.source.x)

      .attr("y2", (d) => d.source.y);

    svg

      .selectAll("circle")

      .filter((d) =>
        filteredLinks.some((link) => link.source === d || link.target === d)
      )

      .attr("stroke-width", 3)

      .attr("stroke", "yellow");
  };

  // const hoverOut = () => {

  // // Remove all links

  // svg.selectAll(".link").remove();

  // svg.selectAll("circle")

  // .attr("stroke-width", strokeWidth)

  // .attr("stroke", stroke);

  // };

  const hoverOut = (event, node) => {
    if (isDragging) return;

    const target = event.target;

    const relatedTarget = event.relatedTarget;

    // Check if the mouse is still within the circle or the link

    const isStillOnCircle = node && target === node;

    const isStillOnLink =
      relatedTarget && relatedTarget.classList.contains("link");

    if (!isStillOnCircle && !isStillOnLink) {
      // Remove all links

      svg.selectAll(".link").remove();

      svg

        .selectAll("circle")

        .attr("stroke-width", strokeWidth)

        .attr("stroke", stroke);
    }
  };

  const node = g

    .selectAll("g")

    .data(descendants)

    .join("g")

    .attr("transform", (d) => `translate(${d.x},${d.y})`)

    // .call(

    // d3.drag()

    // .on("start", dragstarted)

    // .on("drag", dragged) //these lines add the drag functionality to the nodes

    // .on("end", dragended)

    // )

    .on("mouseover", hoverIn)

    .on("mouseout", (event) => hoverOut(event, node)) //new

    .on(
      "dblclick",

      (event, d) =>
        root !== d && (zoomToNode(event, d), event.stopPropagation())
    );

  function dragstarted(event, d) {
    isDragging = true;

    if (!event.active) root.fx = d.x;

    if (!event.active) root.fy = d.y;

    d3.select(this).attr("cursor", "grabbing");
  }

  function dragged(event, d) {
    root.fx = event.x;

    root.fy = event.y;

    d3.select(this).attr(
      "transform",

      `translate(${(d.x = event.x)},${(d.y = event.y)})`
    );
  }

  function dragended(event, d) {
    isDragging = false;

    if (!event.active) root.fx = null;

    if (!event.active) root.fy = null;

    d3.select(this).attr("cursor", "grab");
  }

  node

    .append("circle")

    .attr("fill", (d) => (d.children ? "#016e91" : d.data.color || fill))

    .attr("fill-opacity", (d) => calculateOpacity(d.depth))

    .attr("stroke", stroke)

    .attr("stroke-width", strokeWidth)

    .attr("stroke-opacity", strokeOpacity)

    .attr("r", (d) => d.r)

    .style("cursor", "pointer") //previously "grab"

    .on("mouseover", (event) =>
      d3.select(event.currentTarget).attr("stroke-width", 5)
    )

    .on("mouseout", (event) =>
      d3

        .select(event.currentTarget)

        .attr("stroke-width", (d) => (d.children ? strokeWidth : null))
    )

    .on("click", (event, d) => {
      //take the data in this node and pass it to the state of D3 parent component to render the node data modal

      onNodeClick(d.data);
    });

  function zoomToNode(event, d) {
    const minZoomLevel = 5;

    const zoomLevel = Math.max(minZoomLevel, width / (2 * d.r + 50));

    const centerX = d.x;

    const centerY = d.y;

    const newTransform = d3.zoomIdentity

      .translate(
        width / 2 - centerX * zoomLevel,

        height / 2 - centerY * zoomLevel
      )

      .scale(zoomLevel);

    d3.select("svg g")

      .transition()

      .duration(1800)

      .attr("transform", newTransform);

    adjustTextSize(zoomLevel);
  }

  function adjustTextSize(zoomLevel) {
    const baseFontSize = 7;

    const minFontSize = 0.9;

    const maxFontSize = 9;

    const newFontSize = Math.max(
      minFontSize,

      Math.min(maxFontSize, baseFontSize / zoomLevel)
    );

    svg

      .selectAll("text")

      .transition()

      .duration(700)

      .ease(d3.easeLinear)

      .attr("font-size", newFontSize)

      .style("visibility", zoomLevel > 1 ? "visible" : "hidden")

      .each(function () {
        const text = d3.select(this);

        const circleRadius = text.datum().r;

        const textLength = text.node().getComputedTextLength();

        const textScale = (circleRadius * 2) / textLength;

        if (textScale < 1) {
          text.attr("font-size", newFontSize * textScale);
        }
      });
  }

  if (T) node.append("title").text((d, i) => T[i]);

  const uid = `O-${Math.random().toString(16).slice(2)}`;

  const leaf = node.filter(
    (d) => !d.children && d.r > 0.3 && L[d.index] != null
  );

  leaf

    .append("clipPath")

    .attr("id", (d) => `${uid}-clip-${d.index}`)

    .append("circle")

    .attr("r", (d) => d.r);

  leaf

    .append("text")

    .attr("class", "text-label") // Add this line

    .attr(
      "clip-path",

      (d) => `url(${new URL(`#${uid}-clip-${d.index}`, location)})`
    )

    .selectAll("tspan")

    .data((d) => `${L[d.index]}`.split(/\n/g))

    .join("tspan")

    .attr("x", 0)

    .attr("y", (d, i, D) => `${i - D.length / 2 + 0.85}em`)

    .attr("fill-opacity", (d, i, D) => (i === D.length - 1 ? 0.7 : null))

    .text((d) => d);

  const simulation = d3

    .forceSimulation()

    .force("collide", d3.forceCollide().strength(0.1).radius(2))

    .alphaDecay(0)

    .alpha(1);

  simulation

    .nodes(leaves)

    .on("tick", () => {
      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

  return { svg, adjustTextSize, initialZoomLevel: 1 };
};

const D3 = ({
  hierarchyData,

  popupShowing,

  setPopupShowing,

  setClickedNodeData,

  hoveredMicroservice,
}) => {
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

    onNodeClick: handleNodeClick,
  };

  return (
    <div className="d3">
      <div className="d3-title-container">
        <h1>Repository Overview</h1>
        <Legend /> {/* Include the Legend component */}
      </div>

      {data && (
        <PackChart
          data={data}
          options={options}
          hoveredMicroservice={hoveredMicroservice}
        />
      )}
    </div>
  );
};

export default D3;
