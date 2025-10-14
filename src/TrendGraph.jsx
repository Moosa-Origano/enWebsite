import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function TrendGraph({ data }) {
  // {year: 2015, Edinburgh: 123456, Oxford: 234567, ...}
  
  // All uni names without year.
  let universities = [];

  if (data.length > 0) { // remove year from each record
    for (const key in data[0]) {
      if (key !== 'year') {
        universities.push(key);
      }
    }
  }

  

  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0', '#a4de6c', '#ffa07a']; // need to add more colours otherwise will cause an error below
  
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year" />
        <YAxis />
        <Tooltip />
        <Legend />
        {universities.map((uni, index) => (
          <Line 
            key={uni}
            type="monotone" 
            dataKey={uni} 
            stroke={colors[index]} 
            activeDot={{ r: 8 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}