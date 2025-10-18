import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function BarGraph({ totalEnergyConsumed, energyExported, renewablesGenerated, data }) {

  console.log(totalEnergyConsumed)
  console.log("DATA" , data)
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        width={500}
        height={300}
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="HE provider" 
          angle={-45}
          textAnchor="end"
          height={100}
        />x 
         {/* domain={[0, 300000000]} */}
        <YAxis /> 
        <Tooltip />
        <Legend />
        <Bar 
          dataKey="Total energy consumption (kWh)" 
          fill="#8884d8" 
        />
        {/* <Bar 
          dataKey="Total renewable energy generated onsite or offsite (kWh)" 
          fill="#82ca9d" 
          name="Renewables Generated"
        /> */}
      </BarChart>
    </ResponsiveContainer>
  );
}