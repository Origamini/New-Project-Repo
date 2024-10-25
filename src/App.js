import React, { useState, useEffect } from 'react';
import { usePapaParse } from 'react-papaparse';

function App() {
  const { readString } = usePapaParse(); // Use readString for parsing CSV
  const [csvData, setCsvData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 20; // Number of rows per page

  useEffect(() => {
    const fetchAndParseCsv = async () => {
      const response = await fetch('/Electric_Vehicle_Population_Data.csv');
      const csvText = await response.text(); // Read CSV as text

      // Parse the CSV string using readString
      readString(csvText, {
        header: true, // Use first row as headers
        dynamicTyping: true, // Automatically convert types
        complete: (results) => {
          setCsvData(results.data); // Set the parsed data in state
          setLoading(false); // Set loading to false
        },
      });
    };

    fetchAndParseCsv();
  }, [readString]);

  // Calculate the index of the first and last rows on the current page
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = csvData.slice(indexOfFirstRow, indexOfLastRow);

  // Function to handle page change
  const handlePageChange = (direction) => {
    setCurrentPage((prevPage) => {
      if (direction === 'next' && (prevPage * rowsPerPage < csvData.length)) {
        return prevPage + 1;
      }
      if (direction === 'prev' && prevPage > 1) {
        return prevPage - 1;
      }
      return prevPage;
    });
  };

  return (
    <div>
      <h1>Electric Vehicle Population Data</h1>
      {loading ? (
        <p>Loading data...</p>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                {Object.keys(csvData[0]).map((header) => (
                  <th key={header}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentRows.map((row, index) => (
                <tr key={index}>
                  {Object.values(row).map((cell, cellIndex) => (
                    <td key={cellIndex}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div>
            <button onClick={() => handlePageChange('prev')} disabled={currentPage === 1}>
              Previous
            </button>
            <span> Page {currentPage} </span>
            <button onClick={() => handlePageChange('next')} disabled={indexOfLastRow >= csvData.length}>
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
