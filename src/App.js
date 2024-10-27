import React, { useState, useEffect } from 'react';
import { usePapaParse } from 'react-papaparse';
import { Pie, Bar } from 'react-chartjs-2'; // Import Pie and Bar from react-chartjs-2
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, plugins } from 'chart.js';
import './App.css';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);


function App() {
  const { readString } = usePapaParse();
  const [csvData, setCsvData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  useEffect(() => {
    const fetchAndParseCsv = async () => {
      const response = await fetch('/Electric_Vehicle_Population_Data.csv');
      const csvText = await response.text();

      readString(csvText, {
        header: true,
        dynamicTyping: true,
        complete: (results) => {
          setCsvData(results.data);
          setLoading(false);
        },
      });
    };

    fetchAndParseCsv();
  }, [readString]);

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = csvData.slice(indexOfFirstRow, indexOfLastRow);

  const handlePageChange = (direction) => {
    setCurrentPage((prevPage) => {
      if (direction === 'next' && prevPage * rowsPerPage < csvData.length) {
        return prevPage + 1;
      }
      if (direction === 'prev' && prevPage > 1) {
        return prevPage - 1;
      }
      return prevPage;
    });
  };

  // Data preparation for Pie and Bar charts
  const vehicleMakeCounts = csvData.reduce((acc, row) => {
    acc[row.Make] = (acc[row.Make] || 0) + 1;
    return acc;
  }, {});

  const electricRangeCounts = csvData.reduce((acc, row) => {
    if (row['Electric Range']) {
      acc[row['Electric Range']] = (acc[row['Electric Range']] || 0) + 1;
    }
    return acc;
  }, {});

  const pieData = {
    labels: Object.keys(vehicleMakeCounts),
    datasets: [
      {
        label: 'Vehicle Make Distribution',
        data: Object.values(vehicleMakeCounts),
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
          '#FF9F40', '#C9CBCF'
        ],
      },
    ],
  };

  const pieOptions = {
    plugins:{
      legend: {
        display:true,
        position:'left',
        align:'start',
        labels:{
          boxWidth:10,
        },
      },
    },
  };

  const barData = {
    labels: Object.keys(electricRangeCounts),
    datasets: [
      {
        label: 'Electric Range Distribution',
        data: Object.values(electricRangeCounts),
        backgroundColor: '#36A2EB',
      },
    ],
  };

  return (
    <div>
      <h1 className='Heading'>Electric Vehicle Population Data</h1>
      {loading ? (
        <p>Loading data...</p>
      ) : (
        <>
          <table border={3}>
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

          <div className='btns'>
            <button onClick={() => handlePageChange('prev')} disabled={currentPage === 1}>
            &#8592; Previous
            </button>
            <button onClick={() => handlePageChange('next')} disabled={indexOfLastRow >= csvData.length}>
              Next &#8594;
            </button>
            <span className='span'> Page {currentPage} </span>
          </div>

 {/* Display Bar Chart and Pie */}
          <div style={{display:'flex',justifyContent:'space-around'}}>
            <div>
            <h2>Vehicle Make Distribution</h2>
            <Pie data={pieData} options={pieOptions} style={{height:'500px',width:'500px'}}/>
            </div>
            <div style={{width:'100vh'}}>
            <h2>Electric Range Distribution</h2>
            <Bar data={barData} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
