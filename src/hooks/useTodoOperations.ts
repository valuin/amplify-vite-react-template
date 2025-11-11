import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";
import type { Todo, TodoOperations } from "../types/todo";

const client = generateClient<Schema>();

export const useTodoOperations = (todos: Todo[], setTodos: React.Dispatch<React.SetStateAction<Todo[]>>): TodoOperations => {
  
  const createTodo = async (content: string): Promise<void> => {
    if (!content?.trim()) {
      console.warn("Todo content cannot be empty");
      return;
    }
    
    try {
      // Temporarily create without order field until schema is deployed
      const newTodo = await client.models.Todo.create({
        content: content.trim(),
      });
      console.log("Todo created successfully:", newTodo);
    } catch (error) {
      console.error("Failed to create todo:", error);
      throw error;
    }
  };

  const deleteTodo = async (id: string): Promise<void> => {
    if (!id) {
      console.warn("Todo ID is required for deletion");
      return;
    }

    // Optimistic update
    const originalTodos = [...todos];
    setTodos(prev => prev.filter(todo => todo.id !== id));

    try {
      await client.models.Todo.delete({ id });
    } catch (error) {
      console.error("Failed to delete todo:", error);
      // Revert on error
      setTodos(originalTodos);
      throw error;
    }
  };

  const updateTodoOrder = async (id: string, newOrder: number): Promise<void> => {
    if (!id) {
      console.warn("Todo ID is required for order update");
      return;
    }

    try {
      await client.models.Todo.update({ id, order: newOrder });
    } catch (error) {
      console.error("Failed to update todo order:", error);
      throw error;
    }
  };

  const reorderTodos = async (activeId: string, overId: string): Promise<void> => {
    if (!activeId || !overId || activeId === overId) {
      return;
    }

    const oldIndex = todos.findIndex(todo => todo.id === activeId);
    const newIndex = todos.findIndex(todo => todo.id === overId);

    if (oldIndex === -1 || newIndex === -1) {
      console.warn("Invalid todo IDs for reordering");
      return;
    }

    // Create new array with reordered items
    const newTodos = [...todos];
    const [removed] = newTodos.splice(oldIndex, 1);
    newTodos.splice(newIndex, 0, removed);

    // Update order values based on new positions
    const updatedTodos = newTodos.map((todo, index) => ({
      ...todo,
      order: index + 1,
    }));

    // Optimistic update
    setTodos(updatedTodos);

    try {
      // Update all todos with new order values
      await Promise.all(
        updatedTodos.map(todo => 
          client.models.Todo.update({ id: todo.id, order: todo.order })
        )
      );
    } catch (error) {
      console.error("Failed to reorder todos:", error);
      // Revert on error
      setTodos(todos);
      throw error;
    }
  };

  return {
    createTodo,
    deleteTodo,
    updateTodoOrder,
    reorderTodos,
  };
};