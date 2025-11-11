import type { Schema } from "../../amplify/data/resource";

export type Todo = Schema["Todo"]["type"] & {
  order: number;
};

export interface TodoItemProps {
  todo: Todo;
  onDelete: (id: string) => void;
  isDragging?: boolean;
}

export interface DragEndEvent {
  active: {
    id: string;
  };
  over: {
    id: string;
  } | null;
}

export interface TodoOperations {
  createTodo: (content: string) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  updateTodoOrder: (id: string, newOrder: number) => Promise<void>;
  reorderTodos: (activeId: string, overId: string) => Promise<void>;
}