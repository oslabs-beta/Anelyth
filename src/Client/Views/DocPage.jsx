import React, { useState } from "react";

import Header from "../Components/Header.tsx";

import NavigationModal from "../Components/NavigationModal.jsx";

import "../Styles/docpage.css";

import "../Styles/navigationmodal.css";

import tutorial1 from "../Assets/tutorial1.gif";

import tutorial1static from "../Assets/tutorial1static.jpg";

function DocPage() {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div className="doc-page">
      <Header />

      <div className="content-wrapper">
        <NavigationModal />

        <div className="doc-content">
          <h1>Installation</h1>

          <p>
            You are currently using the web version of Anelyth. If you want to
            use the offline/dekstop version of Anelyth, you can download the
            file at www.anelyth.com/download
          </p>

          <h1>How To Use</h1>

          <p>
            Anelyth is a powerful tool that provides a comprehensive
            visualization of your codebase, enabling you to gain valuable
            insights into its structure, dependencies, and potential
            microservice candidates. Here's how you can get started:
          </p>

          <h3>Upload Your Repository</h3>

          <ul>
            <li>
              Click on the "Choose Files" button to open your file explorer.
            </li>

            <li>Navigate to the root folder of your project and select it.</li>

            <li>
              Once selected, click "Submit" to initiate the upload process.
            </li>
          </ul>

          <img
            src={isHovering ? tutorial1 : tutorial1static}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            alt="How to upload folder"
          ></img>

          <h3>Analyze Your Codebase</h3>

          <ul>
            <li>
              After the upload is complete, Anelyth will perform a static
              analysis on your codebase.
            </li>

            <li>
              The analysis results will be presented in a visually appealing
              circular packing visualization powered by the D3.js library.
            </li>
          </ul>

          <img
            src={isHovering ? tutorial1 : tutorial1static}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            alt="How to upload folder"
          ></img>

          <h3>Explore the Visualization</h3>

          <ul>
            <li>
              The visualization represents your codebase's folder structure and
              individual files.
            </li>

            <li>
              Outer nodes without labels represent folders, while inner nodes
              display file names.
            </li>

            <li>
              Hover over a node to see its dependencies and dependents
              highlighted.
            </li>

            <li>
              Double-click on a node to open a modal with detailed information
              about the file, including its byte size and dependencies.
            </li>
          </ul>

          <h3>Identify Potential Microservices</h3>

          <ul>
            <li>
              On the right side of the screen, you'll find the "Repository
              Overview" panel.
            </li>

            <li>
              This panel showcases areas within your codebase that Anelyth has
              identified as potential candidates for microservice implementation
              based on its static analysis.
            </li>

            <li>
              Each microservice candidate is listed, along with the files and
              components it encompasses.
            </li>

            <li>
              Hover over a microservice suggestion and you will see that the nodes belonging to that microservice cluster
              will be highlighted for you to visualize.
            </li>
          </ul>

          <h3>Interact with the Visualization</h3>

          <ul>
            <li>
              You can drag and rearrange the nodes within the visualization to
              better suit your needs for prototyping or exploration purposes.
            </li>

            <li>
              This interactive feature allows you to experiment with different
              organizational structures and gain a deeper understanding of your
              codebase's architecture.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default DocPage;
