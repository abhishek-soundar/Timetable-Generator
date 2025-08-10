import React from 'react';

const SubjectRow = ({ index, row, onChange, onRemove }) => {
  return (
    <div className="subject-row">
      <input
        type="text"
        placeholder="e.g., Math"
        value={row.subject}
        onChange={(e) => onChange('subject', e.target.value)}
      />
      <input
        type="text"
        placeholder="e.g., Prof. X"
        value={row.faculty}
        onChange={(e) => onChange('faculty', e.target.value)}
      />
      <input
        type="number"
        placeholder="e.g., 4"
        value={row.hoursPerWeek}
        onChange={(e) => onChange('hoursPerWeek', e.target.value)}
      />
      <button onClick={onRemove}>Remove</button>
    </div>
  );
};

export default SubjectRow;