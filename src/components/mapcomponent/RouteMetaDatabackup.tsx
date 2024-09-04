import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface Location {
  id: number;
  name: string;
  lat: number;
  lng: number;
}

type RouteMetaDataProps = {
  distance: number; // in kilometers
  baseTime: number; // in minutes
  selectedLocations: Location[];
}

export function RouteMetaData({ distance, baseTime, selectedLocations }: RouteMetaDataProps) {
  const [trafficLevel, setTrafficLevel] = useState<number>(50); // 0-100 scale
  const [weather, setWeather] = useState<'clear' | 'rain'>('clear');
  const [weekday, setWeekday] = useState<'weekday' | 'weekend'>('weekday');
  const [hourlyTrafficData, setHourlyTrafficData] = useState<{ hour: number; traffic: number }[]>([]);
  const [segmentData, setSegmentData] = useState<{ name: string; distance: number }[]>([]);

  useEffect(() => {
    // Generate mock hourly traffic data
    const mockHourlyData = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      traffic: Math.floor(Math.random() * 100)
    }));
    setHourlyTrafficData(mockHourlyData);

    // Generate segment data
    if (selectedLocations.length > 1) {
      const segments = selectedLocations.slice(1).map((location, index) => ({
        name: `${selectedLocations[index].name} to ${location.name}`,
        distance: Math.random() * 10 // Mock distance, replace with actual calculation
      }));
      setSegmentData(segments);
    }
  }, [selectedLocations]);

  const calculateTime = () => {
    let multiplier = 1;
    multiplier *= 0.8 + (trafficLevel / 100) * 0.7;
    if (weather === 'rain') multiplier *= 1.1;
    if (weekday === 'weekend') multiplier *= 0.9;
    return Math.round(baseTime * multiplier);
  };

  const getTrafficDescription = (level: number) => {
    if (level < 33) return 'Light';
    if (level < 66) return 'Moderate';
    return 'Heavy';
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Route Information</h3>
      
      <div className="mb-4">
        <h4 className="text-md font-medium mb-2">Selected Locations:</h4>
        <ul className="list-disc pl-5">
          {selectedLocations.map(location => (
            <li key={location.id} className="text-sm text-gray-600">{location.name}</li>
          ))}
        </ul>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm font-medium text-gray-500">Distance</p>
          <p className="text-lg font-bold">{distance.toFixed(1)} km</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Estimated Time</p>
          <p className="text-lg font-bold">{calculateTime()} min</p>
        </div>
      </div>
      
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">
            Traffic Level: {getTrafficDescription(trafficLevel)} ({trafficLevel}%)
          </label>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={trafficLevel} 
            onChange={(e) => setTrafficLevel(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Weather</label>
          <select 
            value={weather} 
            onChange={(e) => setWeather(e.target.value as 'clear' | 'rain')}
            className="w-full p-2 border rounded"
          >
            <option value="clear">Clear</option>
            <option value="rain">Rain</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Day Type</label>
          <select 
            value={weekday} 
            onChange={(e) => setWeekday(e.target.value as 'weekday' | 'weekend')}
            className="w-full p-2 border rounded"
          >
            <option value="weekday">Weekday</option>
            <option value="weekend">Weekend</option>
          </select>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="text-md font-medium mb-2">Hourly Traffic Prediction</h4>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={hourlyTrafficData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="traffic" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h4 className="text-md font-medium mb-2">Route Segments</h4>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={segmentData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="distance" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}