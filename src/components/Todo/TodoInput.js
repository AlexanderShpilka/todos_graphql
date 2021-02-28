import React, { useState } from 'react';
import { gql, useMutation } from '@apollo/client';

import { GET_MY_TODOS } from './TodoPrivateList';

const ADD_TODO = gql`
  mutation($todo: String!, $isPublic: Boolean!) {
    insert_todos(objects: { title: $todo, is_public: $isPublic }) {
      affected_rows
      returning {
        id
        title
        created_at
        is_completed
      }
    }
  }
`;

const TodoInput = ({ isPublic = false }) => {
  const [todoInput, setTodoInput] = useState('');

  const resetInput = () => setTodoInput('');

  const [addTodo] = useMutation(ADD_TODO, {
    onCompleted: resetInput,
  });

  return (
    <form
      className="formInput"
      onSubmit={(e) => {
        e.preventDefault();
        addTodo({
          variables: {
            todo: todoInput,
            isPublic,
          },
          optimisticResponse: true,
          update: (cache, { data }) => {
            if (isPublic) {
              return null;
            }

            const existingTodos = cache.readQuery({
              query: GET_MY_TODOS,
            });

            const newTodo = data.insert_todos.returning[0];
            cache.writeQuery({
              query: GET_MY_TODOS,
              data: {
                todos: [newTodo, ...existingTodos.todos],
              },
            });
          },
        });
      }}
    >
      <input
        className="input"
        placeholder="What needs to be done?"
        value={todoInput}
        onChange={(e) => setTodoInput(e.target.value)}
      />
      <i className="inputMarker fa fa-angle-right" />
    </form>
  );
};

export default TodoInput;
