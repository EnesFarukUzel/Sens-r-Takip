import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { SensorData } from '../services/api';

interface Props {
  data: SensorData[];
  tempThreshold?: number;
  humThreshold?: number;
}

const SensorLiveChart: React.FC<Props> = ({ data, tempThreshold = 30, humThreshold = 80 }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    const lastData = data
      .filter(d => String(d.sensorId) === '101')
      .sort((a, b) => new Date(a.measurementTime).getTime() - new Date(b.measurementTime).getTime())
      .slice(-20);
    const chartLabels = lastData.map(d => new Date(d.measurementTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }));
    const temperatureData = lastData.map(d => d.temperature);
    const humidityData = lastData.map(d => d.humidity);
    const temperatureThresholdData = lastData.map(() => tempThreshold);
    const humidityThresholdData = lastData.map(() => humThreshold);

    if (chartInstance.current) {
      chartInstance.current.data.labels = chartLabels;
      chartInstance.current.data.datasets[0].data = temperatureData;
      chartInstance.current.data.datasets[1].data = humidityData;
      chartInstance.current.data.datasets[2].data = temperatureThresholdData;
      chartInstance.current.data.datasets[3].data = humidityThresholdData;
      chartInstance.current.update();
      return;
    }

    chartInstance.current = new Chart(chartRef.current, {
      type: 'line',
      data: {
        labels: chartLabels,
        datasets: [
          {
            label: 'Sıcaklık (°C)',
            data: temperatureData,
            borderColor: 'red',
            backgroundColor: 'rgba(255,0,0,0.1)',
            fill: false,
            tension: 0.4,
            pointRadius: 3,
          },
          {
            label: 'Nem (%)',
            data: humidityData,
            borderColor: 'blue',
            backgroundColor: 'rgba(0,0,255,0.1)',
            fill: false,
            tension: 0.4,
            pointRadius: 3,
          },
          {
            label: `Sıcaklık Eşiği (${tempThreshold}°C)`,
            data: temperatureThresholdData,
            borderColor: 'orange',
            borderDash: [5, 5],
            fill: false,
            pointRadius: 0,
          },
          {
            label: `Nem Eşiği (%${humThreshold})`,
            data: humidityThresholdData,
            borderColor: 'purple',
            borderDash: [5, 5],
            fill: false,
            pointRadius: 0,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
    // Temizlik
    return () => {
      chartInstance.current?.destroy();
      chartInstance.current = null;
    };
  }, [data, tempThreshold, humThreshold]);

  return (
    <div style={{ height: 320 }}>
      <canvas ref={chartRef} id="sensorChart" />
    </div>
  );
};

export default SensorLiveChart;
