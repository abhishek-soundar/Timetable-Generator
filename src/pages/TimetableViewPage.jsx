// src/pages/TimetableViewPage.jsx
import React, { useEffect, useState } from 'react';
import './TimetableViewPage.css';
import apiClient from '../services/apiClient';
import { exportToPDF, exportToExcel } from '../services/exportService';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// Helper: Create a safe ID for subjects
const serializeSubject = (subject) => {
  if (!subject) return '';
  return JSON.stringify({
    subject: subject.subject,
    faculty: subject.faculty
  });
};

const deserializeSubject = (str) => {
  if (!str) return null;
  try {
    return JSON.parse(str);
  } catch (e) {
    console.error('Parse error:', e);
    return null;
  }
};

const TimetableViewPage = () => {
  const [timetableData, setTimetableData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [subjectsList, setSubjectsList] = useState([]);

  // 🔁 Fetch timetable data from backend
  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const res = await apiClient.get('/api/timetable/view');
        if (!res.data || !res.data.timetable) {
          throw new Error('No timetable found in response');
        }

        setTimetableData(res.data);
        setSubjectsList(res.data.subjects || []);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load timetable:', err.message);
        setError('Failed to load timetable. Please generate one first.');
        setLoading(false);
      }
    };

    fetchTimetable();
  }, []);

  // ✅ Handle cell change in edit mode
  const handleCellChange = (dayIndex, periodIndex, selectedSubject) => {
    const updatedTimetable = [...timetableData.timetable];
    updatedTimetable[dayIndex][periodIndex] = selectedSubject;
    setTimetableData({
      ...timetableData,
      timetable: updatedTimetable
    });
  };

  // ⚠️ Optional: Only if you have a save endpoint
  const saveTimetable = async () => {
    try {
      const payload = {
        timetable: timetableData.timetable
      };
      await apiClient.put('/api/timetable/update', payload);
      alert('✅ Timetable saved successfully!');
    } catch (err) {
      console.error('Error saving timetable:', err.message);
      alert('❌ Failed to save timetable.');
    }
  };

  if (loading) {
    return <div className="timetable-view-container">Loading timetable...</div>;
  }

  if (error) {
    return <div className="timetable-view-container" style={{ color: 'red' }}>{error}</div>;
  }

  const { timetable, subjects, periods, semester, section } = timetableData;

  const safePeriods = Array.isArray(periods) ? periods : [];
  const safeSubjects = Array.isArray(subjects) ? subjects : [];
  const safeTimetable = Array.isArray(timetable)
    ? timetable.map(day => (Array.isArray(day) ? day : []))
    : Array(DAYS.length).fill([]);

  return (
    <div id="timetable-table" className="timetable-view-container">
      <h2>{semester} | {section}</h2>

      {/* Edit Toggle */}
      <div style={{ marginBottom: '10px' }}>
        <button onClick={() => setIsEditMode(!isEditMode)}>
          {isEditMode ? 'Disable Editing' : 'Enable Editing'}
        </button>
      </div>

      {/* Table View */}
      <table className="timetable-table">
        <thead>
          <tr>
            <th>Day</th>
            {safePeriods.map((p, i) => (
              <th key={i}>
                {p.name}<br />
                <small>{p.startTime}–{p.endTime}</small>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DAYS.map((day, dayIndex) => (
            <tr key={dayIndex}>
              <td>{day}</td>
              {safePeriods.map((p, periodIndex) => {
                const slot = safeTimetable[dayIndex]?.[periodIndex];

                // ✅ Handle breaks (lunch, tea)
                const isLunchBreak = p.startTime === '12:00' && p.endTime === '13:00';
                const isTeaBreak = p.startTime === '11:00' && p.endTime === '11:15';

                if (isLunchBreak) {
                  return (
                    <td key={`break-${dayIndex}-${periodIndex}`} className="lab-slot">
                      <strong>Lunch Break</strong>
                    </td>
                  );
                }

                if (isTeaBreak) {
                  return (
                    <td key={`break-${dayIndex}-${periodIndex}`} className="lab-slot">
                      <strong>Tea Break</strong>
                    </td>
                  );
                }

                return (
                  <td
                    key={`slot-${dayIndex}-${periodIndex}`}
                    className={slot ? 'filled' : 'empty'}
                  >
                    {isEditMode ? (
                      <select
                        value={slot ? serializeSubject(slot) : ''}
                        onChange={(e) =>
                          handleCellChange(
                            dayIndex,
                            periodIndex,
                            deserializeSubject(e.target.value)
                          )
                        }
                        style={{
                          width: '100%',
                          border: 'none',
                          background: 'transparent',
                          fontSize: '14px'
                        }}
                      >
                        <option value="">—</option>
                        {safeSubjects.map((subject, idx) => (
                          <option key={idx} value={serializeSubject(subject)}>
                            {subject.subject || subject.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <>
                        {slot ? (
                          <strong style={{ color: 'black' }}>
                            {slot.subject || 'Subject'}
                          </strong>
                        ) : (
                          '—'
                        )}
                      </>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Save Button */}
      {isEditMode && (
        <div className="actions print-only-hide" style={{ marginTop: '20px' }}>
          <button className="print-btn" onClick={saveTimetable}>
            Save Edited Timetable
          </button>
        </div>
      )}

      {/* Export Buttons */}
      <div className="actions print-only-hide">
        <button className="print-btn" onClick={() => exportToPDF('timetable-table')}>
          Export to PDF
        </button>
        <button
          className="print-btn"
          onClick={() => exportToExcel(safeTimetable, safePeriods, semester, section)}
        >
          Export to Excel
        </button>
      </div>
    </div>
  );
};

export default TimetableViewPage;