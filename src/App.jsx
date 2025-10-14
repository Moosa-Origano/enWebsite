import { useEffect, useState } from "react";
import Papa from "papaparse";
import BarGraph from "./energyUsedOverTime";
import TrendGraph from './TrendGraph'


function App() {
  const [data, setData] = useState([])
  const [wantedUniversities, setWantedUniversities] = useState(["The University of Edinburgh", "The University of Oxford","The University of Cambridge", "University College London", "Imperial College of Science, Technology and Medicine", "The University of Manchester", "King's College London", "The University of Warwick"])
  const [showTotalEnergy, setShowTotalEnergy] = useState(true)
  const [showExported, setShowExported] = useState(false)
  const [showRenewables, setShowRenewables] = useState (true)
  const [year, setYear] = useState (15)
  const [trendData, setTrendData] = useState([])
  const [viewMode, setViewMode] = useState('single') 


  // Single year choose data. 
  useEffect(() => {
    if (viewMode !== 'single') { return } // only produce this data when the option is selected

    fetch(`/energyData/20${year}-${year+1}.csv`)
      .then((response) => response.text())
      .then((csvText) => {
        const parsed = Papa.parse(csvText, { header: true, dynamicTyping: true })
    
        const filtered = parsed.data
          .filter(row => wantedUniversities.includes(row["HE provider"]))
          .map(row => ({
            "HE provider": row["HE provider"].replace('the', '').replace('University', '').replace('of', '').replace('College', '').replace('Science, Technology and Medicine', '').replace('The', '').trim(),  
            ...(showTotalEnergy && { 
              "Total energy consumption (kWh)": parseFloat(row["Total energy consumption (kWh)"].split(',').join('').trim())
            }),
            ...(showExported && { 
              "Total generation of electricity exported to grid (kWh)": parseFloat(row["Total generation of electricity exported to grid (kWh)"].split(',').join('').trim())
            }),
            ...(showRenewables && { 
              "Total renewable energy generated onsite or offsite (kWh)": parseFloat(row["Total renewable energy generated onsite or offsite (kWh)"].split(',').join('').trim())
            })
          }))

        //console.log("Filtered: " , filtered); // filtered[0]['HE provider']
        setData(filtered); 
      })
      .catch((err) => console.error("Error loading CSV:", err));
  }, [year, showTotalEnergy, showExported, showRenewables]); // dependencies for rerender

  useEffect(() => {
    if (viewMode !== 'trend') return;
    
    console.log("View Mode: ", viewMode)
    const years = [15, 16, 17, 18, 19, 20, 21, 22, 23];
    const allYearsData = [];
    let completed = 0;
    
    years.forEach(y => {
      fetch(`/energyData/20${y}-${y+1}.csv`)
        .then((response) => response.text())
        .then((csvText) => {
          const parsed = Papa.parse(csvText, { header: true, dynamicTyping: true });
      
          const yearData = { year: 2000 + y };
          
          parsed.data
            .filter(row => wantedUniversities.includes(row["HE provider"]))
            .forEach(row => {
              const shortName = row["HE provider"].replace('the', '').replace('University', '').replace('of', '').replace('College', '').replace('Science, Technology and Medicine', '').replace('The', '');

              if (showTotalEnergy) {
                yearData[shortName] = parseFloat(row["Total energy consumption (kWh)"].split(',').join(''));
              }
              if (showExported) {
                yearData[shortName + ' Exported'] = parseFloat(row["Total generation of electricity exported to grid (kWh)"].split(',').join(''));
              }
              if (showRenewables) {
                yearData[shortName + ' Renewables'] = parseFloat(row["Total renewable energy generated onsite or offsite (kWh)"].split(',').join(''));
              }
            });
          
          allYearsData.push(yearData);
          completed++;
          
          // When all years are loaded, sort and set state
          if (completed === years.length) {
            allYearsData.sort((a, b) => a.year - b.year);
            setTrendData(allYearsData);
            console.log("Trend Data: ", trendData)
          }
        })
        .catch((err) => console.error("Error loading CSV:", err));
    });
  }, [showTotalEnergy, showExported, showRenewables, viewMode]);

  console.log("Data", data)

  return (
    <>
      <h1>Energy Consumption of Universities</h1>
      <input placeholder='University List' type="text"></input>
      <br></br>

      <label htmlFor="totalE">Total Energy Consumed</label>
      <input id="totalE" checked ={showTotalEnergy} type='checkbox' onChange={(e) => setShowTotalEnergy(e.target.checked)}></input>

      <label htmlFor="exported">Energy Exported to Grid</label>
      <input id="exported" checked ={showExported} type='checkbox' onChange={(e) => setShowExported(e.target.checked)}></input>

      <label htmlFor="renewables">Renewable Energy Generated</label>
      <input id="renewables" checked ={showRenewables} type='checkbox' onChange={(e) => setShowRenewables(e.target.checked)}></input>

      <div>
        <label htmlFor="year">Select Year: </label>
        <select id="year" value={year} onChange={(e) => setYear(parseInt(e.target.value))}>
          {[15, 16, 17, 18, 19, 20, 21, 22, 23].map(y => (
            <option key={y} value={y}>20{y}-{y+1}</option>
          ))}
        </select>
      </div>

      <br></br>
      <div>
        <div>
          <input type="radio" id="singleView" name="viewMode" value="single" checked={viewMode === 'single'} onChange={(e) => setViewMode(e.target.value)}/>
          <label htmlFor="singleView">Single Year View</label>
        </div>

        <div>
          <input type="radio" id="trendView" name="viewMode" value="trend" checked={viewMode === 'trend'} onChange={(e) => setViewMode(e.target.value)}/>
          <label htmlFor="trendView">Trend View (2015-2023)</label>
        </div>
      </div>


      <BarGraph totalEnergyConsumed = {showTotalEnergy} energyExported = {showExported} renewablesGenerated = {showRenewables} data = {data} ></BarGraph>
    </>
  )
}

export default App
