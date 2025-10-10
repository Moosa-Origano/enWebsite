import { useEffect, useState } from "react";
import Papa from "papaparse";
import LineGraph from "./energyUsedOverTime";

function App() {
  const [data, setData] = useState([])
  const [wantedUniversities, setWantedUniversities] = useState(["The University of Edinburgh", "The University of Oxford","The University of Cambridge", "University College London", "Imperial College of Science, Technology and Medicine", "The University of Manchester", "King's College London", "The University of Warwick"])
  const [showTotalEnergy, setShowTotalEnergy] = useState(true)
  const [showExported, setShowExported] = useState(false)
  const [showRenewables, setShowRenewables] = useState (true)
  const [year, setYear] = useState (15)

  useEffect(() => {
    fetch(`/energyData/20${year}-${year+1}.csv`)
      .then((response) => response.text())
      .then((csvText) => {
        const parsed = Papa.parse(csvText, { header: true, dynamicTyping: true });
    
        const filtered = parsed.data
        .filter(row => wantedUniversities.includes(row["HE provider"]))
        .map(row => ({
          "HE provider": row["HE provider"],  
          ...(showTotalEnergy && { "Total energy consumption (kWh)": row["Total energy consumption (kWh)"] }), // if false then it isn't added
          ...(showExported && { "Total generation of electricity exported to grid (kWh)": row["Total generation of electricity exported to grid (kWh)"] }),
          ...(showRenewables && { "Total renewable energy generated onsite or offsite (kWh)": row["Total renewable energy generated onsite or offsite (kWh)"] })
        }))

        //console.log("Filtered: " , filtered); // filtered[0]['HE provider']
        setData(filtered); 
      })
      .catch((err) => console.error("Error loading CSV:", err));
  }, []);

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

      <LineGraph totalEnergyConsumed = {showTotalEnergy} energyExported = {showExported} renewablesGenerated = {showRenewables} data = {data} ></LineGraph>
    </>
  )
}

export default App
