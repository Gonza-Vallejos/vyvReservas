import React, { useEffect, useRef } from 'react';

const InteractiveChart = ({ options, series, type = 'line', height = 350 }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (window.ApexCharts && chartRef.current) {
      // Limpiar gráfico previo si existe
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const chartOptions = {
        ...options,
        series: series,
        chart: {
          ...options.chart,
          type: type,
          height: height,
          toolbar: { show: true },
          animations: {
            enabled: true,
            easing: 'easeinout',
            speed: 800,
          }
        },
        theme: {
          mode: 'light',
          palette: 'palette1',
        },
        grid: {
          borderColor: '#f1f5f9',
        },
        tooltip: {
          theme: 'dark',
          x: { show: true },
        }
      };

      chartInstance.current = new window.ApexCharts(chartRef.current, chartOptions);
      chartInstance.current.render();
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [options, series, type, height]);

  return <div ref={chartRef} />;
};

export default InteractiveChart;
