import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

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

  return <svg ref={svgRef}></svg>;
};

const Pack = (data, options) => {
  const {
    path,
    id = Array.isArray(data) ? (d) => d.id : null,
    parentId = Array.isArray(data) ? (d) => d.parentId : null,
    children,
    value,
    sort = (a, b) => d3.descending(a.value, b.value),
    label,
    title,
    link,
    linkTarget = "_blank",
    width = 640,
    height = 400,
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

  const root =
    path != null
      ? d3.stratify().path(path)(data)
      : id != null || parentId != null
      ? d3.stratify().id(id).parentId(parentId)(data)
      : d3.hierarchy(data, children);

  value == null ? root.count() : root.sum((d) => Math.max(0, value(d)));

  const descendants = root.descendants();
  const leaves = descendants.filter((d) => !d.children);
  leaves.forEach((d, i) => (d.index = i));
  const L = label == null ? null : leaves.map((d) => label(d.data, d));
  const T = title == null ? null : descendants.map((d) => title(d.data, d));

  if (sort != null) root.sort(sort);

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

  const node = svg
    .selectAll("a")
    .data(descendants)
    .join("a")
    .attr("xlink:href", link == null ? null : (d, i) => link(d.data, d))
    .attr("target", link == null ? null : linkTarget)
    .attr("transform", (d) => `translate(${d.x},${d.y})`);

  node
    .append("circle")
    .attr("fill", (d) => (d.children ? "#fff" : fill))
    .attr("fill-opacity", (d) => (d.children ? null : fillOpacity))
    .attr("stroke", (d) => (d.children ? stroke : null))
    .attr("stroke-width", (d) => (d.children ? strokeWidth : null))
    .attr("stroke-opacity", (d) => (d.children ? strokeOpacity : null))
    .attr("r", (d) => d.r);

  if (T) node.append("title").text((d, i) => T[i]);

  if (L) {
    const uid = `O-${Math.random().toString(16).slice(2)}`;

    const leaf = node.filter(
      (d) => !d.children && d.r > 10 && L[d.index] != null
    );

    leaf
      .append("clipPath")
      .attr("id", (d) => `${uid}-clip-${d.index}`)
      .append("circle")
      .attr("r", (d) => d.r);

    leaf
      .append("text")
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
  }

  return svg.node();
};

// const D3 = () => {
//   const data = {
//     name: "Root",
//     children: [
//       {
//         name: "Node 1",
//         children: [
//           { name: "Node 1.1", value: 10 },
//           { name: "Node 1.2", value: 15 },
//           { name: "Node 1.3", value: 20 }
//         ]
//       },
//       {
//         name: "Node 2",
//         children: [
//           {
//             name: "Node 2.1",
//             children: [
//               { name: "Node 2.1.1", value: 5 },
//               { name: "Node 2.1.2", value: 8 }
//             ]
//           },
//           { name: "Node 2.2", value: 12 }
//         ]
//       },
//       {
//         name: "Node 3",
//         children: [
//           { name: "Node 3.1", value: 18 },
//           { name: "Node 3.2", value: 25 },
//           { name: "Node 3.3", value: 30 }
//         ]
//       }
//     ]
//   };

//   const options = {
//     width: 500,
//     height: 500,
//     fill: "#ddd",
//     stroke: "#bbb"
//   };

//   return (
//     <div className='d3'>
//       <h1>Pack Chart</h1>
//       <PackChart data={data} options={options} />
//     </div>
//   );
// };

// export default D3;

const D3 = ({ hierarchyData }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (hierarchyData) {
      setData(hierarchyData);
    }
  }, [hierarchyData]);

  const options = {
    width: 500,
    height: 500,
    fill: "#ddd",
    stroke: "#bbb",
  };

  return (
    <div className="d3">
      <h1>Pack Chart</h1>
      {data && <PackChart data={data} options={options} />}
    </div>
  );
};

export default D3;
