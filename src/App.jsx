import { useEffect, useState } from "react"
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
  const [perStudent, setPerStudent] = useState(false)
  const [studentData, setStudentData] = useState([])


  // Single year choose data. 
  useEffect(() => {
  if (viewMode !== 'single') return;
  let energyCSV = `${import.meta.env.BASE_URL}energyData/20${year}-${year + 1}.csv`;

  fetch(energyCSV)
    .then((response) => response.text())
    .then((csvText) => {
      const parsed = Papa.parse(csvText, { header: true });
      console.log("Show graphed energy type: ", selectedEnergyType);

      let filtered = parsed.data
        .filter(row => wantedUniversities.includes(row["HE provider"]))
        .map(row => ({
          "HE provider": row["HE provider"]
            .replace('the', '')
            .replace('University', '')
            .replace('of', '')
            .replace('College', '')
            .replace('Science, Technology and Medicine', '')
            .replace('The', '')
            .trim(),
          [selectedEnergyType]: parseFloat(row[selectedEnergyType].split(',').join('').trim() || 0) // instead of doing them seperately
        }))

      if (perStudent) {
        let studentCSV = `${import.meta.env.BASE_URL}studentData/20${year}-${year + 1}SC.csv`;
        fetch(studentCSV)
          .then((res) => res.text())
          .then((studentCSVText) => {
            const studentParsed = Papa.parse(studentCSVText, { header: true })
            console.log("Show student count: ", studentParsed)

            const studentFiltered = studentParsed.data
              .filter(row => wantedUniversities.includes(row["HE provider"]))
              .map(row => ({
                "HE provider": row["HE provider"]
                  .replace('the', '')
                  .replace('University', '')
                  .replace('of', '')
                  .replace('College', '')
                  .replace('Science, Technology and Medicine', '')
                  .replace('The', '')
                  .trim(),
                "Total": parseFloat(row["Total"].split(',').join('').trim() || 1)
              }))

            setStudentData(studentFiltered)

            filtered = filtered.map(energyRow => {
              if (!perStudent) {
                return energyRow;
              }
              const studentRow = studentFiltered.find(student => student["HE provider"] === energyRow["HE provider"])
              let studentCount = 0;
              if (studentRow) {
                studentCount = studentRow["Total"];
              }
              let energy = 0;
              if (energyRow[selectedEnergyType]) {
                energy = energyRow[selectedEnergyType];
              }
              let perStudentEnergy = 0;
              if (studentCount > 0) {
                perStudentEnergy = energy / studentCount;
              }
              return {
                ...energyRow,
                [selectedEnergyType]: perStudentEnergy
              };
            });

            setData(filtered);
          })
          .catch((err) => console.error("Error loading student CSV:", err));
      } else {
        setData(filtered);
      }
    })
    .catch((err) => console.error("Error loading energy CSV:", err));
}, [viewMode, year, wantedUniversities, selectedEnergyType, perStudent]);





  // Multi year data 
  useEffect(() => {
    if (viewMode !== 'trend') return;

    console.log("View Mode: ", viewMode); // output for debugging
    const years = [15, 16, 17, 18, 19, 20, 21, 22, 23]; // the current years of data available.
    const allYearsData = []; // initialising
    let completed = 0;

    years.forEach(y => {
      let energyCSV = `${import.meta.env.BASE_URL}energyData/20${y}-${y + 1}.csv`;
      fetch(energyCSV)
        .then((response) => response.text())
        .then((csvText) => {
          const parsed = Papa.parse(csvText, { header: true});
          const yearData = { year: 2000 + y };

          if (perStudent) {
            let studentCSV = `${import.meta.env.BASE_URL}studentData/20${y}-${y + 1}SC.csv`;

            fetch(studentCSV)
              .then((res) => res.text())
              .then((studentCSVText) => {
                const studentParsed = Papa.parse(studentCSVText, { header: true })
                console.log(`Show student count for 20${y}-${y + 1}: `, studentParsed)

                const studentFiltered = studentParsed.data
                  .filter(row => wantedUniversities.includes(row["HE provider"]))
                  .map(row => ({
                    "HE provider": row["HE provider"]
                      .replace('the', '')
                      .replace('University', '')
                      .replace('of', '')
                      .replace('College', '')
                      .replace('Science, Technology and Medicine', '')
                      .replace('The', '')
                      .trim(),
                    "Total": (parseFloat(row["Total"].split(',').join('').trim()) || 1)
                  }));

                setStudentData(studentFiltered);

                parsed.data
                  .filter(row => wantedUniversities.includes(row["HE provider"]))
                  .forEach(row => {
                    const shortName = row["HE provider"]
                      .replace('the', '')
                      .replace('University', '')
                      .replace('of', '')
                      .replace('College', '')
                      .replace('Science, Technology and Medicine', '')
                      .replace('The', '')
                      .trim()

                    let studentCount = 0;
                    const studentRow = studentFiltered.find(student => student["HE provider"] === shortName);
                    if (studentRow) {
                      studentCount = studentRow["Total"];
                    }

                    let energy = 0;
                    if (row[selectedEnergyType]) {
                      energy = parseFloat((row[selectedEnergyType]).split(',').join('').trim()) || 0;
                    }

                    let perStudentEnergy = 0;
                    if (studentCount > 0) {
                      perStudentEnergy = energy / studentCount;
                    };

                    yearData[shortName] = perStudentEnergy
                  });

                allYearsData.push(yearData);
                completed++;
                if (completed === years.length) {
                  setTrendData(allYearsData.sort((a, b) => a.year - b.year));
                }
              });
              
          } else {
            parsed.data
              .filter(row => wantedUniversities.includes(row["HE provider"]))
              .forEach(row => {
                const shortName = row["HE provider"]
                  .replace('the', '')
                  .replace('University', '')
                  .replace('of', '')
                  .replace('College', '')
                  .replace('Science, Technology and Medicine', '')
                  .replace('The', '')
                  .trim()

                let energy = 0;
                if (row[selectedEnergyType]) {
                  energy = energy = parseFloat((row[selectedEnergyType]).split(',').join('').trim()) || 0;
                }
                yearData[shortName] = energy;
              });

            allYearsData.push(yearData);
            completed++;
            if (completed === years.length) {
              setTrendData(allYearsData.sort((a, b) => a.year - b.year));
            }
          }
        })
    })
  }, [viewMode, wantedUniversities, selectedEnergyType, perStudent]);

  console.log("Data", data); // output data for debugging

  return (
    <>
      <div id="mainTitleDiv"><h1>University Energy Data</h1></div> {/*Main title*/}
      {/*Renders the UniListSearch component for the search bar and choosable list of universities*/}
      <UniListSearch wantedUniversities={wantedUniversities} setWantedUniversities={setWantedUniversities}/>  

      {/*Conditionally rendered if the single bar chart view is wanted */}
      {viewMode === 'single' && 
      <div className="energyGraphingDiv">
      <h2>{selectedEnergyType}{perStudent ? "(per Student)" : ""} {`(20${year}-20${year+1})`}</h2> {/* Ternary operators are amazing */}
      <BarGraph selectedEnergyType = {selectedEnergyType} data = {data} perStudent = {perStudent}></BarGraph>
      </div>
      }
      
      {/*Conditionally rendered if the trend view is wanted */}
      {viewMode === 'trend' && 
      <div className="energyGraphingDiv">
      
      <h2>{selectedEnergyType}{perStudent ? "(per Student)" : ""} (2015-2023)</h2>
      <TrendGraph data = {trendData} perStudent = {perStudent}></TrendGraph>
      </div>
      }


      {/*Radiobuttons for selecting total energy, energy exported, or renewables generated view.*/}
      <div id="EnergyViewDiv">
        <section>
          <label htmlFor="perStudentCheck">Per Student</label>
          <input name = "perStudentCheck" type="checkbox" id="perStudentCheck" checked = {perStudent} onChange={() => setPerStudent(!perStudent)}></input>
        </section>

        <section>
        <label htmlFor="totalE">Total Energy Consumed</label> 
        <input name = "EnergyType"  id="totalE" type='radio' checked={selectedEnergyType === "Total energy consumption (kWh)"} value = "Total energy consumption (kWh)" onChange={(e) => setSelectedEnergyType(e.target.value)}></input>
        </section>

        <section>
        <label htmlFor="exported">Energy Exported to Grid</label>
        <input name = "EnergyType"  id="exported"  type='radio' checked={selectedEnergyType === "Total generation of electricity exported to grid (kWh)"} value = "Total generation of electricity exported to grid (kWh)" onChange={(e) => setSelectedEnergyType(e.target.value)}></input>
        </section>

        <section>
        <label htmlFor="renewables">Renewable Energy Generated</label>
        <input name = "EnergyType" id="renewables"type='radio'  checked={selectedEnergyType === "Total renewable energy generated onsite or offsite (kWh)"} value="Total renewable energy generated onsite or offsite (kWh)" onChange={(e) => setSelectedEnergyType(e.target.value)}></input>
        </section>
      </div>

      {/* Buttons for selecting which year of data should be viewed. */}
      <div id="yearSelectionDiv">
        <section>
        <input className="yearSelectionRadio" name = "yearSelect" id='15' type='radio' value={year} onChange={(e) => setYear(15)}></input>
        <label htmlFor="15">2015-16</label>
        </section>

        <section>
        <input className="yearSelectionRadio" name = "yearSelect" id='16' type='radio' value={year} onChange={(e) => setYear(16)}></input>
        <label htmlFor="16">2016-17</label>
        </section>

        <section>
        <input className="yearSelectionRadio" name = "yearSelect" id='17' type='radio' value={year} onChange={(e) => setYear(17)}></input>
        <label htmlFor="17">2017-18</label>
        </section>

        <section>
        <input className="yearSelectionRadio" name = "yearSelect" id='18' type='radio' value={year} onChange={(e) => setYear(18)}></input>
        <label htmlFor="18">2018-19</label>
        </section>

        <section>
        <input className="yearSelectionRadio" name = "yearSelect" id='19' type='radio' value={year} onChange={(e) => setYear(19)}></input>
        <label htmlFor="19">2019-20</label>
        </section>

        <section>
        <input className="yearSelectionRadio" name = "yearSelect" id='20' type='radio' value={year} onChange={(e) => setYear(20)}></input>
        <label htmlFor="20">2020-21</label>
        </section>

        <section>
        <input className="yearSelectionRadio" name = "yearSelect" id='21' type='radio' value={year} onChange={(e) => setYear(21)}></input>
        <label htmlFor="21">2021-22</label>
        </section>
        
        <section>
        <input className="yearSelectionRadio" name = "yearSelect" id='22' type='radio' value={year} onChange={(e) => setYear(22)}></input>
        <label htmlFor="22">2022-23</label>
        </section>

        <section>
        <input className="yearSelectionRadio" name = "yearSelect" id='23' type='radio' value={year} onChange={(e) => setYear(23)}></input>
        <label htmlFor="23">2023-24</label>
        </section>
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


      {/*Radiobuttons for choosing single bar chart view or trend view for multiple years of data analysis*/}
      <br></br>
      <div id="dataFormatDiv">
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
