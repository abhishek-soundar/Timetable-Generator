const TimetableGrid = ({ timetable, periods, onUpdate }) => {
  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  // Dynamically generate PERIODS based on the periods prop
  const PERIODS = periods.map(period => period.name);

  const handleCellChange = (dayIndex, periodIndex, value) => {
    onUpdate(dayIndex, periodIndex, value);
  };

  return (
    <div className="timetable-grid">
      <table>
        <thead>
          <tr>
            <th>Day</th>
            {PERIODS.map((period, index) => (
              <th key={index}>{period}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DAYS.map((day, dayIndex) => (
            <tr key={dayIndex}>
              <td>{day}</td>
              {timetable[dayIndex].map((slot, periodIndex) => (
                <td key={periodIndex}>
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => handleCellChange(dayIndex, periodIndex, e.target.textContent)}
                  >
                    {slot ? (
                      <>
                        <strong>{slot.name}</strong>
                        <br />
                        <small>{slot.faculty}</small>
                      </>
                    ) : (
                      '—'
                    )}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};