import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

type Belt = any;

export default function App() {
  const [belts, setBelts] = useState<Belt[]>([]);

  useEffect(() => {
    const backend = (import.meta as any).env.VITE_BACKEND_URL || 'http://localhost:3000';
    const socket = io(backend);

    socket.on('connect', () => console.log('connected', socket.id));
    socket.on('bolero:update', (data: Belt[]) => setBelts(data));

    // fetch initial (via backend directly)
    fetch(`${backend}/api/status`)
      .then((r) => r.json())
      .then((d) => setBelts(d.belts || []))
      .catch(() => {});

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div style={{ fontFamily: 'sans-serif', padding: 20 }}>
      <h1>Bolero Dashboard</h1>
      <table border={1} cellPadding={6} cellSpacing={0}>
        <thead>
          <tr>
            <th>BP ID</th>
            <th>Name</th>
            <th>BP Number</th>
            <th>Battery %</th>
            <th>Signal</th>
            <th>Antenna</th>
          </tr>
        </thead>
        <tbody>
          {belts.map((b) => (
            <tr key={b.id}>
              <td>{b.id}</td>
              <td>{b.config?.bpName}</td>
              <td>{b.config?.bpNumber}</td>
              <td>{b.runtime?.battery?.status ?? '-'}</td>
              <td>{b.runtime?.signalLevel ?? '-'}</td>
              <td>{b.antenna?.name ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
