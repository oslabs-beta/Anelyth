import React, { useState, useEffect, FC } from 'react';

interface ClustersDisplayProps {
  clusterData: any[][]; // Adjust the type as needed
}

interface GroupedData {
  [microservice: string]: string[];
}

const ClustersDisplay: FC<ClustersDisplayProps> = ({ clusterData }) => {
  const [groupedData, setGroupedData] = useState<GroupedData>({});

  useEffect(() => {
    if (clusterData) {
      // Group the data based on the inner arrays
      const grouped = clusterData.reduce((acc, group, index) => {
        const groupName = `Microservice ${index + 1}`;
        acc[groupName] = group.map((item) => item.fileName);
        return acc;
      }, {} as GroupedData);
      setGroupedData(grouped);
    }
  }, [clusterData]);

  // Render the grouped data
  return (
    <div>
      <h2>Repository Overview</h2>
      {Object.entries(groupedData).map(([microservice, files]) => (
        <div key={microservice}>
          <h3>{microservice}</h3>
          <ul>
            {files.map((file, idx) => (
              <li key={idx}>{file}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default ClustersDisplay;
