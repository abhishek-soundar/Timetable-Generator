import React, { useEffect, useState } from 'react';
import apiClient from '../services/apiClient';

const AdminDashboardPage = () => {
  const [timetables, setTimetables] = useState([]);

  useEffect(() => {
    const fetchTimetables = async () => {
      try {
        const res = await apiClient.get('/api/timetable/me');
        setTimetables(res.data);
      } catch (err) {
        console.error('Failed to load timetables:', err.message);
        alert('Failed to load timetables.');
      }
    };

    fetchTimetables();
  }, []);

  const handleEdit = (tt) => {
    localStorage.setItem('generatedTimetable', JSON.stringify(tt));
    window.location.href = '/timetable/view';
  };

  return (
    <div className="dashboard-container">
      <h2>Your Saved Timetables</h2>

      <div className="timetable-list">
        {timetables.length === 0 && <p>No timetables found.</p>}

        {timetables.map((tt, index) => (
          <div key={index} className="timetable-card">
            <h3>{tt.semester} – {tt.section}</h3>
            <button onClick={() => handleEdit(tt)}>Edit</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboardPage;