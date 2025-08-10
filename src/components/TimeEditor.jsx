import React from 'react';

const TimeEditor = ({ periods, onChange, onAddPeriod, onRemovePeriod }) => {
  return (
    <div className="time-editor">
      {periods.map((period) => (
        <div key={period.id} className="period">
          <span>{period.name}</span>
          <input
            type="time"
            value={period.startTime}
            onChange={(e) => onChange(period.id, 'startTime', e.target.value)}
          />
          <span>to</span>
          <input
            type="time"
            value={period.endTime}
            onChange={(e) => onChange(period.id, 'endTime', e.target.value)}
          />
          <button onClick={() => onRemovePeriod(period.id)}>Remove</button>
        </div>
      ))}
      <button onClick={onAddPeriod}>Add Period</button>
    </div>
  );
};

export default TimeEditor;