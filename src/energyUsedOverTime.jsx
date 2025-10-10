import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function LineGraph({ totalEnergyConsumed, energyExported, renewablesGenerated, data }) {

  console.log(totalEnergyConsumed)
  console.log("DATA" , data)
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
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
        />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="Total energy consumption (kWh)" 
          stroke="#8884d8" 
          activeDot={{ r: 8 }} 
          name="Energy Consumed"
        />
        <Line 
          type="monotone" 
          dataKey="Total renewable energy generated onsite or offsite (kWh)" 
          stroke="#82ca9d" 
          name="Renewables Generated"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}