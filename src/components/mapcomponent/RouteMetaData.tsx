import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, BarChart, Bar } from 'recharts';
import './metadata.css';

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
  const [trafficLevel, setTrafficLevel] = useState<number>(50);
  const [weather, setWeather] = useState<'clear' | 'rain'>('clear');
  const [weekday, setWeekday] = useState<'weekday' | 'weekend'>('weekday');
  const [hourlyTrafficData, setHourlyTrafficData] = useState<{ hour: number; traffic: number }[]>([]);
  const [segmentData, setSegmentData] = useState<{ name: string; distance: number }[]>([]);
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);

  useEffect(() => {
    const mockHourlyData = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      traffic: Math.floor(Math.random() * 100)
    }));
    setHourlyTrafficData(mockHourlyData);

    if (selectedLocations.length > 1) {
      const segments = selectedLocations.slice(1).map((location, index) => ({
        name: `${selectedLocations[index].name} to ${location.name}`,
        distance: Math.random() * 10
      }));
      setSegmentData(segments);
    }
  }, [selectedLocations]);

  const calculateTime = () => {
    let multiplier = 1;
    multiplier *= 0.8 + (trafficLevel / 100) * 0.7;
    if (weather === 'rain') multiplier *= 1.1;
    if (weekday === 'weekend') multiplier *= 0.9;
    let minutes = Math.round(baseTime * multiplier);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;

  };

  const getTrafficDescription = (level: number) => {
    if (level < 33) return 'Light';
    if (level < 66) return 'Moderate';
    return 'Heavy';
  };

  return (
    <div className="route-meta-data">
      <h3>Route Information</h3>
      
      <div className="route-info-container">
        <div className="route-details">
          <div className="route-summary">
            <div>
              <p>Distance</p>
              <p>{distance.toFixed(1)} km</p>
            </div>
            <div>
              <p>Estimated Time</p>
              <p>{calculateTime()}</p>
            </div>
          </div>
          
          <div className="route-controls">
            <div>
              <label>
                Traffic Level: {getTrafficDescription(trafficLevel)} ({trafficLevel}%)
              </label>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={trafficLevel} 
                onChange={(e) => setTrafficLevel(parseInt(e.target.value))}
              />
            </div>
            
            <div>
              <label>Weather</label>
              <select 
                value={weather} 
                onChange={(e) => setWeather(e.target.value as 'clear' | 'rain')}
              >
                <option value="clear">Clear</option>
                <option value="rain">Rain</option>
              </select>
            </div>
            
            <div>
              <label>Day Type</label>
              <select 
                value={weekday} 
                onChange={(e) => setWeekday(e.target.value as 'weekday' | 'weekend')}
              >
                <option value="weekday">Weekday</option>
                <option value="weekend">Weekend</option>
              </select>
            </div>
          </div>

          <div className="route-segments">
            <h4>Route Segments</h4>
            <table>
              <thead>
                <tr>
                  <th>Segment</th>
                  <th>Distance (km)</th>
                </tr>
              </thead>
              <tbody>
                {segmentData.map((segment) => (
                  <tr 
                    key={segment.name}
                    className={selectedSegment === segment.name ? 'selected' : ''}
                    onClick={() => setSelectedSegment(segment.name)}
                  >
                    <td>{segment.name}</td>
                    <td>{segment.distance.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="charts">
          <div className="traffic-prediction">
            <h4>Hourly Traffic Prediction</h4>
            <LineChart width={400} height={200} data={hourlyTrafficData}>
              <XAxis dataKey="hour" />
              <YAxis />
              <Line type="monotone" dataKey="traffic" stroke="#8884d8" dot={false} />
            </LineChart>
          </div>

          <div className="segment-chart">
            <h4>Route Segments</h4>
            <BarChart width={400} height={200} data={segmentData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Bar dataKey="distance" fill="#82ca9d" />
            </BarChart>
          </div>
        </div>
      </div>
    </div>
  );
}