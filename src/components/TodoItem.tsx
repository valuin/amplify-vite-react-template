import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash2, GripVertical } from "lucide-react";
import type { TodoItemProps } from "../types/todo";

export const TodoItem: React.FC<TodoItemProps> = ({ todo, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  const handleDelete = () => {
    onDelete(todo.id);
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`todo-item ${isSortableDragging ? "dragging" : ""}`}
      data-todo-id={todo.id}
    >
      <div className="todo-content">
        <button
          className="drag-handle"
          {...attributes}
          {...listeners}
          aria-label="Drag todo to reorder"
          title="Drag to reorder"
        >
          <GripVertical size={18} />
        </button>
        <span className="todo-text">{todo.content}</span>
        <button
          className="delete-button"
          onClick={handleDelete}
          aria-label="Delete todo"
          title="Delete todo"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </li>
  );
};