import React from 'react';

const SectionSelector = ({ value, onChange }) => {
  return (
    <select value={value} onChange={onChange}>
      <option value="Section A">Section A</option>
      <option value="Section B">Section B</option>
      {/* Add more sections as needed */}
    </select>
  );
};

export default SectionSelector;