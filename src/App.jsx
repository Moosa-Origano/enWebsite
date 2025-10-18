import { useEffect, useState } from "react";
import Papa from "papaparse";
import BarGraph from "./energyUsedOverTime";
import TrendGraph from './TrendGraph'
import UniListSearch from "./uniList";

import "./styles/App.css"


function App() {
  const [data, setData] = useState([])
  const [wantedUniversities, setWantedUniversities] = useState ([])//(["The University of Edinburgh", "The University of Oxford","The University of Cambridge", "University College London", "Imperial College of Science, Technology and Medicine", "The University of Manchester", "King's College London", "The University of Warwick"])
  const [year, setYear] = useState (15)
  const [trendData, setTrendData] = useState([])
  const [viewMode, setViewMode] = useState('single') 
  const [selectedEnergyType, setSelectedEnergyType] = useState("Total energy consumption (kWh)") // default to total energy consumed


  // Single year choose data. 
  useEffect(() => {
    if (viewMode !== 'single') { return } // only produce this data when the option is selected
    fetch(`/energyData/20${year}-${year+1}.csv`)
      .then((response) => response.text())
      .then((csvText) => {
        const parsed = Papa.parse(csvText, { header: true })
        console.log("Show graphed energy type: " , selectedEnergyType)
        const filtered = parsed.data
          .filter(row => wantedUniversities.includes(row["HE provider"]))
          .map(row => ({
            "HE provider": row["HE provider"].replace('the', '').replace('University', '').replace('of', '').replace('College', '').replace('Science, Technology and Medicine', '').replace('The', '').trim(),  
            ...(selectedEnergyType === 'Total energy consumption (kWh)' && { 
              "Total energy consumption (kWh)": parseFloat(row["Total energy consumption (kWh)"].split(',').join('').trim())
            }),
            ...(selectedEnergyType === 'Total generation of electricity exported to grid (kWh)' && { 
              "Total generation of electricity exported to grid (kWh)": parseFloat(row["Total generation of electricity exported to grid (kWh)"].split(',').join('').trim())
            }),
            ...(selectedEnergyType === 'Total renewable energy generated onsite or offsite (kWh)' && { 
              "Total renewable energy generated onsite or offsite (kWh)": parseFloat(row["Total renewable energy generated onsite or offsite (kWh)"].split(',').join('').trim())
            })
          }))

        console.log("Filtered: " , filtered); // filtered[0]['HE provider']
        setData(filtered); 
      })
      .catch((err) => console.error("Error loading CSV:", err));
  }, [viewMode, year, wantedUniversities, selectedEnergyType]); // dependencies for rerender

  // Multi year data 
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

              if (showTotalEnergy && row["Total energy consumption (kWh)"]) {
                yearData[shortName] = parseFloat(row["Total energy consumption (kWh)"].split(',').join(''));
              }
              // if (showExported) { // i dont think these should be in here now that I think about it..
              //   yearData[shortName + ' Exported'] = parseFloat(row["Total generation of electricity exported to grid (kWh)"].split(',').join(''));
              // }
              // if (showRenewables) {
              //   yearData[shortName + ' Renewables'] = parseFloat(row["Total renewable energy generated onsite or offsite (kWh)"].split(',').join(''));
              // }
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
  }, [viewMode, wantedUniversities, selectedEnergyType]);

  console.log("Data", data)

  return (
    <>
      <h1>{selectedEnergyType}</h1>
      <UniListSearch wantedUniversities={wantedUniversities} setWantedUniversities={setWantedUniversities}/>      

      {viewMode === 'single' && 
      <div>
        
      <h2>{selectedEnergyType} {`(20${year}-20${year+1})`}</h2>
      <BarGraph selectedEnergyType = {selectedEnergyType} data = {data} ></BarGraph>
      </div>
      }
      

      {viewMode === 'trend' && <TrendGraph data = {trendData} ></TrendGraph>}



      {/* Maybe change these to radio buttons so only one is rendered at a time? No scrolling needed and less complicated. Then change the conditional rendering above to else if statements so only one set of data is added. Add parameter in the functions for graph title so only 2 functions total are needed and can create the graphs.  */}
      <label htmlFor="totalE">Total Energy Consumed</label> 
      <input name = "EnergyType"  id="totalE" type='radio' checked={selectedEnergyType === "Total energy consumption (kWh)"} value = "Total energy consumption (kWh)" onChange={(e) => setSelectedEnergyType(e.target.value)}></input>

      <label htmlFor="exported">Energy Exported to Grid</label>
      <input name = "EnergyType"  id="exported"  type='radio' checked={selectedEnergyType === "Total generation of electricity exported to grid (kWh)"} value = "Total generation of electricity exported to grid (kWh)" onChange={(e) => setSelectedEnergyType(e.target.value)}></input>

      <label htmlFor="renewables">Renewable Energy Generated</label>
      <input name = "EnergyType" id="renewables"type='radio'  checked={selectedEnergyType === "Total renewable energy generated onsite or offsite (kWh)"} value="Total renewable energy generated onsite or offsite (kWh)" onChange={(e) => setSelectedEnergyType(e.target.value)}></input>

      <div>
        <input name = "yearSelect" id='15' type='radio' value={year} onChange={(e) => setYear(15)}></input>
        <label htmlFor="15">2015-16</label>

        <input name = "yearSelect" id='16' type='radio' value={year} onChange={(e) => setYear(16)}></input>
        <label htmlFor="16">2016-17</label>

        <input name = "yearSelect" id='17' type='radio' value={year} onChange={(e) => setYear(17)}></input>
        <label htmlFor="17">2017-18</label>

        <input name = "yearSelect" id='18' type='radio' value={year} onChange={(e) => setYear(18)}></input>
        <label htmlFor="18">2018-19</label>

        <input name = "yearSelect" id='19' type='radio' value={year} onChange={(e) => setYear(19)}></input>
        <label htmlFor="19">2019-20</label>

        <input name = "yearSelect" id='20' type='radio' value={year} onChange={(e) => setYear(20)}></input>
        <label htmlFor="20">2020-21</label>

        <input name = "yearSelect" id='21' type='radio' value={year} onChange={(e) => setYear(21)}></input>
        <label htmlFor="21">2021-22</label>

        <input name = "yearSelect" id='22' type='radio' value={year} onChange={(e) => setYear(22)}></input>
        <label htmlFor="22">2022-23</label>

        <input name = "yearSelect" id='23' type='radio' value={year} onChange={(e) => setYear(23)}></input>
        <label htmlFor="23">2023-24</label>

      </div>  

{/* 
      <div> // alternative view with list instead of separate radio buttons
        <label htmlFor="year">Select Year: </label>
        <select id="year" value={year} onChange={(e) => setYear(parseInt(e.target.value))}>
          {[15, 16, 17, 18, 19, 20, 21, 22, 23].map(y => (
            <option key={y} value={y}>20{y}-{y+1}</option>
          ))}
        </select>
      </div> */}

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



    </>
  )
} 

export default App
