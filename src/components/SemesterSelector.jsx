import React from 'react';

const SemesterSelector = ({ value, onChange }) => {
  return (
    <select value={value} onChange={onChange}>
      <option value="Semester 1">Semester 1</option>
      <option value="Semester 2">Semester 2</option>
      {/* Add more semesters as needed */}
    </select>
  );
};

export default SemesterSelector;