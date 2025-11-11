import { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { TodoItem } from "./components/TodoItem";
import { useTodoOperations } from "./hooks/useTodoOperations";
import type { Todo } from "./types/todo";
import "./App.css";

const client = generateClient<Schema>();

function App() {
  const { signOut, user } = useAuthenticator();
  const [todos, setTodos] = useState<Array<Todo>>([]);

  useEffect(() => {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => {
        // Handle existing todos without order field by assigning them sequential orders
        const itemsWithOrder = data.items.map((item, index) => ({
          ...item,
          order: item.order !== undefined ? item.order : index + 1,
        }));
        
        const sortedTodos = [...itemsWithOrder].sort((a, b) => (a.order || 0) - (b.order || 0));
        setTodos(sortedTodos as Todo[]);
      },
    });
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { createTodo, deleteTodo, reorderTodos } = useTodoOperations(todos, setTodos);

  function handleCreateTodo() {
    const content = window.prompt("Todo content");
    if (content) {
      createTodo(content);
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    await reorderTodos(active.id as string, over.id as string);
  }

  return (
    <main>
      <h1>{user?.signInDetails?.loginId}'s todos</h1>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={handleCreateTodo}>+ new</button>
        <button onClick={signOut}>Sign out</button>
      </div>
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={todos.map(todo => todo.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="todo-list">
            {todos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onDelete={deleteTodo}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
      
      <div>
        🥳 App successfully hosted. Try creating a new todo.
        <br />
        <a href="https://docs.amplify.aws/react/start/quickstart/#make-frontend-updates">
          Review next step of this tutorial.
        </a>
      </div>
    </main>
  );
}

export default App;
