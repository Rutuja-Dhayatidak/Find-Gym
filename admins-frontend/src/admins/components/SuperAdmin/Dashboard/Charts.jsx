import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { getDashboardCharts } from '../../../../services/superApi';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

const Charts = () => {
  const [data, setData] = useState({ userGrowth: [], revenueGrowth: [] });

  useEffect(() => {
    const fetchCharts = async () => {
      const response = await getDashboardCharts();
      // Dummy data for visual presentation since API returns empty in stub
      const dates = ['1', '5', '10', '15', '20', '25', '30'];
      
      setData({
        userGrowth: {
          labels: dates,
          datasets: [
            {
              fill: true,
              label: 'New Users',
              data: [120, 200, 150, 280, 220, 310, 350],
              borderColor: '#F97316',
              backgroundColor: 'rgba(249, 115, 22, 0.1)',
              tension: 0.4
            },
          ],
        },
        revenueGrowth: {
          labels: dates,
          datasets: [
            {
              fill: true,
              label: 'Revenue (₹)',
              data: [50000, 75000, 60000, 105000, 85000, 130000, 150000],
              borderColor: '#10B981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              tension: 0.4
            },
          ],
        }
      });
    };
    fetchCharts();
  }, []);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { mode: 'index', intersect: false }
    },
    scales: {
      y: { border: { display: false }, grid: { color: '#E5E7EB' } },
      x: { grid: { display: false } }
    },
    interaction: { mode: 'nearest', axis: 'x', intersect: false }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-96">
        <h3 className="text-lg font-bold text-gray-900 mb-4">User Growth (Last 30 Days)</h3>
        {data.userGrowth.labels && <Line options={options} data={data.userGrowth} />}
      </div>
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-96">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue Growth (Last 30 Days)</h3>
        {data.revenueGrowth.labels && <Line options={options} data={data.revenueGrowth} />}
      </div>
    </div>
  );
};

export default Charts;
