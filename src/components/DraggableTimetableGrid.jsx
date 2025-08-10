import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

// Reorder helper
const reorder = (list, startIndex, endIndex) => {
  const result = [...list];
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

// Move between days
const move = (source, destination, droppableSource, droppableDestination) => {
  const sourceClone = [...source];
  const destClone = [...destination];
  const [removed] = sourceClone.splice(droppableSource.index, 1);
  destClone.splice(droppableDestination.index, 0, removed);
  return { source: sourceClone, destination: destClone };
};

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const DraggableTimetableGrid = ({ timetable, onUpdate }) => {
  const onDragEnd = (result) => {
    if (!result.destination) return;

    const sourceDay = parseInt(result.source.droppableId);
    const destDay = parseInt(result.destination.droppableId);

    const draggedSubject = timetable[sourceDay][result.source.index];

    // Skip if dragging over the same slot
    if (
      sourceDay === destDay &&
      result.source.index === result.destination.index
    ) {
      return;
    }

    // Teacher conflict detection
    if (draggedSubject && timetable[destDay][result.destination.index]?.faculty === draggedSubject.faculty) {
      alert(`⚠️ ${draggedSubject.faculty} is already teaching here.`);
      return;
    }

    // Check for lab subjects — should not be split
    if (draggedSubject?.isLab) {
      const isNextSlotEmpty =
        result.destination.index + 1 < timetable[destDay].length &&
        !timetable[destDay][result.destination.index + 1];

      if (!isNextSlotEmpty) {
        alert('⚠️ Lab subject needs two consecutive empty slots.');
        return;
      }
    }

    // Same day reordering
    if (sourceDay === destDay) {
      const updatedDay = reorder(timetable[sourceDay], result.source.index, result.destination.index);
      const updatedTimetable = [...timetable];
      updatedTimetable[sourceDay] = updatedDay;
      onUpdate(updatedTimetable);
      return;
    }

    // Cross-day dragging
    const { source, destination } = move(
      timetable[sourceDay],
      timetable[destDay],
      result.source,
      result.destination
    );

    const updatedTimetable = [...timetable];
    updatedTimetable[sourceDay] = source;
    updatedTimetable[destDay] = destination;

    onUpdate(updatedTimetable);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      {DAYS.map((day, dayIndex) => (
        <Droppable key={dayIndex} droppableId={`${dayIndex}`} type="subject">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="day-row">
              <h3>{day}</h3>
              <div className="periods">
                {timetable[dayIndex].map((slot, periodIndex) => (
                  <Draggable
                    key={`slot-${dayIndex}-${periodIndex}`}
                    draggableId={`slot-${dayIndex}-${periodIndex}`}
                    index={periodIndex}
                    isDragDisabled={!slot} // Disable dragging for null slots
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="period-cell"
                      >
                        <div className="cell-content">
                          {slot ? (
                            <>
                              <strong>{slot.name}</strong><br />
                              <small>{slot.faculty}</small>
                            </>
                          ) : (
                            '—'
                          )}
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            </div>
          )}
        </Droppable>
      ))}
    </DragDropContext>
  );
};