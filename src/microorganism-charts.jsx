import React, { useState, useRef } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const MicroorganismCharts = () => {
  const [chartType, setChartType] = useState('bar');
  const [showDataEditor, setShowDataEditor] = useState(false);
  const chartRef = useRef(null);
  const legendRef = useRef(null);
  
  // Default organisms and colors
  const defaultOrganisms = [
    { name: 'E. coli', color: '#808080' },
    { name: 'CONS', color: '#87CEEB' },
    { name: 'S. aureus', color: '#FF6B9D' },
    { name: 'Streptococcus spp.', color: '#CD5C5C' },
    { name: 'Klebsiella spp.', color: '#90EE90' },
    { name: 'Enterococcus spp.', color: '#4169E1' },
    { name: 'Pseudomonas spp.', color: '#DDA0DD' },
    { name: 'Candida spp.', color: '#FFD700' },
    { name: 'Enterobacter spp.', color: '#FF8C00' },
    { name: 'Others', color: '#FFA07A' }
  ];

  const [organisms, setOrganisms] = useState(defaultOrganisms);
  
  // Default data
  const defaultData = [
    { category: 'Category 1', values: [25, 15, 12, 10, 10, 8, 6, 5, 6, 3] },
    { category: 'Category 2', values: [22, 18, 13, 11, 11, 9, 5, 5, 4, 2] },
    { category: 'Category 3', values: [20, 20, 12, 10, 12, 10, 6, 5, 4, 1] },
    { category: 'Category 4', values: [18, 22, 11, 9, 13, 11, 6, 5, 4, 1] }
  ];

  const [categories, setCategories] = useState(defaultData);
  const [yAxisLabel, setYAxisLabel] = useState('Percent of Total Isolates (%)');
  const [chartTitle, setChartTitle] = useState('Microorganism Distribution');

  // Convert data to recharts format
  const getChartData = () => {
    return categories.map(cat => {
      const dataPoint = { category: cat.category };
      organisms.forEach((org, idx) => {
        dataPoint[org.name] = cat.values[idx] || 0;
      });
      return dataPoint;
    });
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-semibold mb-2">{label}</p>
          {payload.reverse().map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const addCategory = () => {
    setCategories([...categories, { 
      category: `Category ${categories.length + 1}`, 
      values: new Array(organisms.length).fill(0) 
    }]);
  };

  const removeCategory = (index) => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  const updateCategory = (index, field, value) => {
    const newCategories = [...categories];
    newCategories[index][field] = value;
    setCategories(newCategories);
  };

  const updateCategoryValue = (catIndex, orgIndex, value) => {
    const newCategories = [...categories];
    newCategories[catIndex].values[orgIndex] = parseFloat(value) || 0;
    setCategories(newCategories);
  };

  const addOrganism = () => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788'];
    const randomColor = colors[organisms.length % colors.length];
    setOrganisms([...organisms, { name: `Organism ${organisms.length + 1}`, color: randomColor }]);
    setCategories(categories.map(cat => ({ ...cat, values: [...cat.values, 0] })));
  };

  const removeOrganism = (index) => {
    setOrganisms(organisms.filter((_, i) => i !== index));
    setCategories(categories.map(cat => ({
      ...cat,
      values: cat.values.filter((_, i) => i !== index)
    })));
  };

  const updateOrganism = (index, field, value) => {
    const newOrganisms = [...organisms];
    newOrganisms[index][field] = value;
    setOrganisms(newOrganisms);
  };

  const downloadChart = () => {
    if (!chartRef.current) return;
    
    // Find the SVG element in the chart
    const svgElement = chartRef.current.querySelector('svg');
    if (!svgElement) return;
    
    // Get SVG data
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    
    // Create canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width * 2;
      canvas.height = img.height * 2;
      ctx.scale(2, 2);
      ctx.fillStyle = '#f9fafb';
      ctx.fillRect(0, 0, img.width, img.height);
      ctx.drawImage(img, 0, 0);
      
      // Download
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `${chartTitle.replace(/\s+/g, '_')}_chart.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        URL.revokeObjectURL(svgUrl);
      });
    };
    
    img.src = svgUrl;
  };

  const downloadLegend = () => {
    if (!legendRef.current) return;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    const width = 300;
    const height = organisms.length * 40 + 80;
    canvas.width = width * 2;
    canvas.height = height * 2;
    ctx.scale(2, 2);
    
    // Draw background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    
    // Draw border
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, width, height);
    
    // Draw title
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('Legend', 16, 30);
    
    // Draw legend items
    organisms.forEach((organism, idx) => {
      const y = 60 + idx * 35;
      
      // Draw color box
      ctx.fillStyle = organism.color;
      ctx.fillRect(16, y, 24, 24);
      ctx.strokeStyle = '#d1d5db';
      ctx.lineWidth = 1;
      ctx.strokeRect(16, y, 24, 24);
      
      // Draw text
      ctx.fillStyle = '#374151';
      ctx.font = '14px sans-serif';
      ctx.fillText(organism.name, 52, y + 17);
    });
    
    // Download
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `${chartTitle.replace(/\s+/g, '_')}_legend.png`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-white">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        {chartTitle}
      </h1>

      <div className="mb-6 flex gap-4 flex-wrap items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chart Type
          </label>
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            className="border border-gray-300 rounded px-4 py-2"
          >
            <option value="area">Stacked Area</option>
            <option value="bar">Stacked Bar</option>
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chart Title
          </label>
          <input
            type="text"
            value={chartTitle}
            onChange={(e) => setChartTitle(e.target.value)}
            className="border border-gray-300 rounded px-4 py-2 w-full"
          />
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Y-Axis Label
          </label>
          <input
            type="text"
            value={yAxisLabel}
            onChange={(e) => setYAxisLabel(e.target.value)}
            className="border border-gray-300 rounded px-4 py-2 w-full"
          />
        </div>

        <button
          onClick={() => setShowDataEditor(!showDataEditor)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {showDataEditor ? 'Hide Editor' : 'Edit Data'}
        </button>

        <button
          onClick={downloadChart}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          📥 Download Chart
        </button>

        <button
          onClick={downloadLegend}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          📥 Download Legend
        </button>
      </div>

      {showDataEditor && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-6">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">Organisms</h3>
              <button
                onClick={addOrganism}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
              >
                + Add Organism
              </button>
            </div>
            <div className="space-y-2">
              {organisms.map((org, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={org.name}
                    onChange={(e) => updateOrganism(idx, 'name', e.target.value)}
                    className="border border-gray-300 rounded px-3 py-1 flex-1"
                    placeholder="Organism name"
                  />
                  <input
                    type="color"
                    value={org.color}
                    onChange={(e) => updateOrganism(idx, 'color', e.target.value)}
                    className="border border-gray-300 rounded w-16 h-9"
                  />
                  <button
                    onClick={() => removeOrganism(idx)}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">Categories & Values</h3>
              <button
                onClick={addCategory}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
              >
                + Add Category
              </button>
            </div>
            <div className="space-y-4">
              {categories.map((cat, catIdx) => (
                <div key={catIdx} className="border border-gray-300 rounded p-3">
                  <div className="flex gap-2 mb-2 items-center">
                    <input
                      type="text"
                      value={cat.category}
                      onChange={(e) => updateCategory(catIdx, 'category', e.target.value)}
                      className="border border-gray-300 rounded px-3 py-1 flex-1 font-medium"
                      placeholder="Category name"
                    />
                    <button
                      onClick={() => removeCategory(catIdx)}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {organisms.map((org, orgIdx) => (
                      <div key={orgIdx}>
                        <label className="text-xs text-gray-600 block mb-1">{org.name}</label>
                        <input
                          type="number"
                          value={cat.values[orgIdx] || 0}
                          onChange={(e) => updateCategoryValue(catIdx, orgIdx, e.target.value)}
                          className="border border-gray-300 rounded px-2 py-1 w-full text-sm"
                          step="0.1"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div ref={chartRef} className="lg:col-span-3 bg-gray-50 p-4 rounded-lg">
          <ResponsiveContainer width="100%" height={500}>
            {chartType === 'area' ? (
              <AreaChart data={getChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {organisms.map((organism) => (
                  <Area
                    key={organism.name}
                    type="monotone"
                    dataKey={organism.name}
                    stackId="1"
                    stroke={organism.color}
                    fill={organism.color}
                    fillOpacity={0.8}
                  />
                ))}
              </AreaChart>
            ) : (
              <BarChart data={getChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {organisms.map((organism) => (
                  <Bar
                    key={organism.name}
                    dataKey={organism.name}
                    stackId="1"
                    fill={organism.color}
                  />
                ))}
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        <div ref={legendRef} className="bg-white border border-gray-300 rounded-lg p-4">
          <h3 className="font-semibold text-lg mb-4 text-gray-800">Legend</h3>
          <div className="space-y-2">
            {organisms.map((organism, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div 
                  className="w-6 h-6 rounded border border-gray-300 flex-shrink-0"
                  style={{ backgroundColor: organism.color }}
                ></div>
                <span className="text-sm text-gray-700">{organism.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-lg mb-2">Quick Guide:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
          <li>Click "Edit Data" to customize organisms, categories, and values</li>
          <li>Add/remove organisms and categories as needed</li>
          <li>Change organism colors by clicking the color picker</li>
          <li>Switch between Area and Bar chart types</li>
          <li>Customize chart title and Y-axis label</li>
          <li>Click "Download Chart" to save the chart as a PNG image</li>
          <li>Click "Download Legend" to save the legend as a separate PNG image</li>
        </ul>
      </div>
    </div>
  );
};

export default MicroorganismCharts;
