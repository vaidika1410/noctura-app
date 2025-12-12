
import React from "react";
import AddHabitModal from "./AddHabitModal";

export default function EditHabitModal({ habit, onClose, onHabitSaved }) {
  return (
    <AddHabitModal
      habit={habit}
      onClose={onClose}
      onHabitAdded={onHabitSaved}
    />
  );
}
