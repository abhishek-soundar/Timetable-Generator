// src/pages/TimetableInputPage.jsx
import React, { useState, useRef, useEffect } from 'react';
import './TimetableInputPage.css';
import apiClient from '../services/apiClient';
import jwtDecode from 'jwt-decode'; // npm install jwt-decode


const TimetableInputPage = () => {
  const [semester, setSemester] = useState('Semester 1');
  const [section, setSection] = useState('Section A');
  const [subjectRows, setSubjectRows] = useState([
    { subject: '', faculty: '', hoursPerWeek: '', isContinuous: false }
  ]);
  const [periods, setPeriods] = useState([]);
  const [isTimeEditorOpen, setIsTimeEditorOpen] = useState(false);
  const [newPeriodName, setNewPeriodName] = useState('');
  const [isAddingPeriod, setIsAddingPeriod] = useState(false);
  const [editingPeriodId, setEditingPeriodId] = useState(null);
  const [editPeriodData, setEditPeriodData] = useState({ name: '', startTime: '', endTime: '' });
  const [adminId, setAdminId] = useState('');
  const subjectInputRefs = useRef([]);


  // 🔐 Extract user ID from JWT
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    try {
      const decoded = jwtDecode(token);
      setAdminId(decoded.id);
    } catch (err) {
      console.error('Invalid token:', err.message);
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
  }, []);


  // ✅ Load saved input from backend
  useEffect(() => {
    const fetchSavedInput = async () => {
      try {
        const res = await apiClient.get('/api/timetable/input');
        const data = res.data;
        setSemester(data.semester || 'Semester 1');
        setSection(data.section || 'Section A');
        // Make sure hoursPerWeek is string or number but not undefined
        if (data.subjects?.length) {
          // Normalize subjects to have string or '' for hoursPerWeek
          const normalizedSubjects = data.subjects.map(subj => ({
            subject: subj.subject ?? '',
            faculty: subj.faculty ?? '',
            hoursPerWeek:
              subj.hoursPerWeek !== undefined && subj.hoursPerWeek !== null
                ? String(subj.hoursPerWeek)
                : '',
            isContinuous: !!subj.isContinuous,
          }));
          setSubjectRows(normalizedSubjects);
        }
        setPeriods(data.periods?.length ? sortPeriods(data.periods) : []);
      } catch (err) {
        console.log('No saved data found — starting fresh');
      }
    };
    fetchSavedInput();
  }, []);


  // Update refs
  useEffect(() => {
    subjectInputRefs.current = subjectRows.map(
      (_, i) => subjectInputRefs.current[i] || React.createRef()
    );
  }, [subjectRows]);


  // Focus new row
  useEffect(() => {
    const lastIndex = subjectRows.length - 1;
    if (lastIndex >= 0 && subjectInputRefs.current[lastIndex]?.current) {
      subjectInputRefs.current[lastIndex].current.focus();
    }
  }, [subjectRows.length]);


  // ✅ Time Helpers
  const toMinutes = (time) => {
    if (!time) return 0;
    const [hour, min] = time.split(':').map(Number);
    return hour * 60 + min;
  };

  // Removed unused getPeriodType, as we do not require AM/PM sorting anymore


  // ✅ Sort periods purely chronologically (by startTime only)
  const sortPeriods = (periodsToSort) => {
    return [...periodsToSort].sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));
  };


  // Handlers
  const handleSemesterChange = (e) => setSemester(e.target.value);
  const handleSectionChange = (e) => setSection(e.target.value);


  const handleSubjectRowChange = (index, field, value) => {
    const updatedRows = [...subjectRows];
    if (field === 'hoursPerWeek') {
      // Ensure value is string or '', never undefined or null
      updatedRows[index][field] = value !== '' && !isNaN(value) ? value : '';
    } else if (field === 'isContinuous') {
      updatedRows[index][field] = value;
    } else {
      updatedRows[index][field] = value;
    }
    setSubjectRows(updatedRows);
  };


  const handleAddRow = () => {
    setSubjectRows([
      ...subjectRows,
      { subject: '', faculty: '', hoursPerWeek: '', isContinuous: false }
    ]);
  };


  const handleRemoveRow = (index) => {
    if (subjectRows.length === 1) return;
    const updatedRows = [...subjectRows];
    updatedRows.splice(index, 1);
    setSubjectRows(updatedRows);
  };


  const handlePeriodChange = (periodId, field, value) => {
    const updatedPeriods = periods.map(p =>
      p.id === periodId ? { ...p, [field]: value } : p
    );
    setPeriods(sortPeriods(updatedPeriods));
  };


  const handleAddPeriod = () => {
    if (!newPeriodName.trim()) return;
    const newPeriod = {
      id: Date.now(),
      name: newPeriodName.trim(),
      startTime: '',
      endTime: '',
      type: 'period' // ✅ Mark as regular period
    };
    const updatedPeriods = [...periods, newPeriod];
    setPeriods(sortPeriods(updatedPeriods));
    setNewPeriodName('');
    setIsAddingPeriod(false);
  };


  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleAddPeriod();
  };


  const handleRowKeyDown = (e) => {
    if (e.key === 'Enter') handleAddRow();
  };


  const handleRemovePeriod = (periodId) => {
    if (periods.length === 1) return;
    const updatedPeriods = periods.filter(p => p.id !== periodId);
    setPeriods(sortPeriods(updatedPeriods));
  };


  const handleEditPeriod = (period) => {
    setEditingPeriodId(period.id);
    setEditPeriodData({ name: period.name, startTime: period.startTime, endTime: period.endTime });
  };


  const handleEditChange = (field, value) => {
    setEditPeriodData(prev => ({ ...prev, [field]: value }));
  };


  const handleSaveEdit = (periodId) => {
    if (!editPeriodData.name.trim()) {
      alert('Period name cannot be empty');
      return;
    }
    const updatedPeriods = periods.map(p =>
      p.id === periodId ? { ...p, ...editPeriodData, name: editPeriodData.name.trim() } : p
    );
    setPeriods(sortPeriods(updatedPeriods));
    setEditingPeriodId(null);
    setEditPeriodData({ name: '', startTime: '', endTime: '' });
  };


  const handleEditKeyDown = (e, periodId) => {
    if (e.key === 'Enter' && editPeriodData.name.trim()) handleSaveEdit(periodId);
  };


  const handleCancelEdit = () => {
    setEditingPeriodId(null);
    setEditPeriodData({ name: '', startTime: '', endTime: '' });
  };


  // ✅ Generate Timetable
  const handleGenerateTimetable = async () => {
    try {
      // Validate subject rows
      for (let i = 0; i < subjectRows.length; i++) {
        const row = subjectRows[i];
        if (!row.subject.trim()) {
          alert(`Subject name required for row ${i + 1}`);
          return;
        }
        if (!row.faculty.trim()) {
          alert(`Faculty name required for subject "${row.subject}"`);
          return;
        }
        if (!row.hoursPerWeek || isNaN(row.hoursPerWeek) || parseInt(row.hoursPerWeek, 10) < 1) {
          alert(`Valid hours/week required for subject "${row.subject}"`);
          return;
        }
      }

      // Validate periods have startTime and endTime
      for (let i = 0; i < periods.length; i++) {
        const p = periods[i];
        if (!p.startTime || !p.endTime) {
          alert(`Please set start and end times for period "${p.name || (i + 1)}"`);
          return;
        }
        if (toMinutes(p.endTime) <= toMinutes(p.startTime)) {
          alert(`End time must be after start time for period "${p.name || (i + 1)}"`);
          return;
        }
      }

      const payload = {
        semester,
        section,
        subjects: subjectRows.map(row => ({
          name: row.subject.trim(),
          faculty: row.faculty.trim(),
          hoursPerWeek: parseInt(row.hoursPerWeek, 10),
          isContinuous: !!row.isContinuous,
          teacher: adminId
        })),
        periods: sortPeriods(periods),
        createdBy: adminId
      };

      const res = await apiClient.post('/api/timetable/create', payload);
      localStorage.setItem('generatedTimetable', JSON.stringify(res.data));
      window.location.href = '/timetable-view';
    } catch (error) {
      console.error('Failed to generate timetable:', error);
      alert('Failed to generate timetable.');
    }
  };


  return (
    <div className="timetable-container">
      <h1 className="timetable-title">Generate Timetables in Seconds...</h1>

      <div className="selectors">
        <select value={semester} onChange={handleSemesterChange} className="big-select">
          {[...Array(8)].map((_, i) => (
            <option key={i + 1} value={`Semester ${i + 1}`}>
              Semester {i + 1}
            </option>
          ))}
        </select>
        <select value={section} onChange={handleSectionChange} className="big-select">
          {Array.from({ length: 10 }, (_, i) => (
            <option key={i} value={`Section ${String.fromCharCode(65 + i)}`}>
              Section {String.fromCharCode(65 + i)}
            </option>
          ))}
        </select>
      </div>

      <div className="subject-row subject-row-heading">
        <div className="subject-heading-cell">SUBJECT</div>
        <div className="subject-heading-cell">FACULTY</div>
        <div className="subject-heading-cell">HOURS/WEEK</div>
        <div className="subject-heading-cell">CONTINUOUS?</div>
        <div className="subject-heading-cell">ACTION</div>
      </div>

      <div className="subject-rows">
        {subjectRows.map((row, index) => (
          <div className="subject-row" key={index}>
            <input
              type="text"
              className="subject-input"
              placeholder="e.g., Mathematics"
              value={row.subject}
              onChange={(e) => handleSubjectRowChange(index, 'subject', e.target.value)}
              ref={subjectInputRefs.current[index]}
            />
            <input
              type="text"
              className="subject-input"
              placeholder="e.g., Prof. Smith"
              value={row.faculty}
              onChange={(e) => handleSubjectRowChange(index, 'faculty', e.target.value)}
            />
            <input
              type="number"
              className="subject-input"
              placeholder="4"
              value={row.hoursPerWeek}
              min="1"
              max="20"
              onChange={(e) => handleSubjectRowChange(index, 'hoursPerWeek', e.target.value)}
              onKeyDown={handleRowKeyDown}
            />
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={row.isContinuous}
                onChange={(e) => handleSubjectRowChange(index, 'isContinuous', e.target.checked)}
              />
              Yes
            </label>
            <button
              className="big-btn remove-btn"
              onClick={() => handleRemoveRow(index)}
              disabled={subjectRows.length === 1}
              type="button"
            >
              Remove
            </button>
          </div>
        ))}
        <button className="big-btn lightblue-btn" onClick={handleAddRow} type="button">
          Add Subject
        </button>
      </div>

      <button
        className="big-btn lightblue-btn"
        type="button"
        onClick={() => setIsTimeEditorOpen(!isTimeEditorOpen)}
      >
        {isTimeEditorOpen ? 'Close Time Editor' : 'Customize Periods'}
      </button>

      {isTimeEditorOpen && (
        <div className="time-editor">
          <div className="period-list">
            {periods.map((period) => (
              <div className="period-row" key={period.id}>
                {editingPeriodId === period.id ? (
                  <>
                    <input
                      type="text"
                      className="subject-input"
                      value={editPeriodData.name}
                      onChange={(e) => handleEditChange('name', e.target.value)}
                      onKeyDown={(e) => handleEditKeyDown(e, period.id)}
                      autoFocus
                    />
                    <input
                      type="time"
                      value={editPeriodData.startTime}
                      onChange={(e) => handleEditChange('startTime', e.target.value)}
                      onKeyDown={(e) => handleEditKeyDown(e, period.id)}
                    />
                    <span>to</span>
                    <input
                      type="time"
                      value={editPeriodData.endTime}
                      onChange={(e) => handleEditChange('endTime', e.target.value)}
                      onKeyDown={(e) => handleEditKeyDown(e, period.id)}
                    />
                    <button
                      className="big-btn generate-btn"
                      onClick={() => handleSaveEdit(period.id)}
                      disabled={!editPeriodData.name.trim()}
                    >
                      Save
                    </button>
                    <button className="big-btn remove-btn" onClick={handleCancelEdit}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <span className="chocolate-label">{period.name}</span>
                    <input
                      type="time"
                      value={period.startTime}
                      onChange={(e) => handlePeriodChange(period.id, 'startTime', e.target.value)}
                    />
                    <span>to</span>
                    <input
                      type="time"
                      value={period.endTime}
                      onChange={(e) => handlePeriodChange(period.id, 'endTime', e.target.value)}
                    />
                    <button
                      className="big-btn lightblue-btn"
                      onClick={() => handleEditPeriod(period)}
                    >
                      Edit
                    </button>
                    <button
                      className="big-btn remove-btn"
                      onClick={() => handleRemovePeriod(period.id)}
                      disabled={periods.length === 1}
                    >
                      Remove
                    </button>
                  </>
                )}
              </div>
            ))}

            {isAddingPeriod ? (
              <div className="period-row">
                <input
                  type="text"
                  className="subject-input"
                  placeholder={`Period ${periods.length + 1}`}
                  value={newPeriodName}
                  onChange={(e) => setNewPeriodName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                />
                <button className="big-btn generate-btn" onClick={handleAddPeriod} disabled={!newPeriodName.trim()}>
                  Confirm
                </button>
                <button className="big-btn remove-btn" onClick={() => setIsAddingPeriod(false)}>
                  Cancel
                </button>
              </div>
            ) : (
              <button
                className="big-btn lightblue-btn"
                onClick={() => setIsAddingPeriod(true)}
                type="button"
              >
                Add Period
              </button>
            )}
          </div>
        </div>
      )}

      <button
        className="big-btn generate-btn"
        type="button"
        onClick={handleGenerateTimetable}
      >
        Generate Timetable
      </button>
    </div>
  );
};


export default TimetableInputPage;
