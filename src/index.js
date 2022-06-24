
const request = require('express');
const response = require('express');
const express = require('express');
const cors = require('cors')

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

 const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find( user => user.username === username);

  if(!user){
    return response.status(404).json({error: 'User not found !'});
  }

  request.user = user;

  return next();

}

app.post('/users', (request, response) => {
  const { name , username } = request.body;
    
  const userAlreadyExists = users.find(
      (user) => user.username === username
  );

  if(userAlreadyExists){
      return response.status(400).json({error: "Username already exists! "})
  }

  const user = {
      id: uuidv4(),
      username,
      name,
      todos: []
  };

  users.push(user);

  return response.status(201).json(user);
});

/* app.get('/users',checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user);


} ) */

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const { user } = request;

  const todosOperation = {
    id: uuidv4(),
    deadline: new Date(deadline),
    title,
    done: false,
    created_at: new Date()
  };

  user.todos.push(todosOperation);

  return response.status(201).json(todosOperation);

  
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.params;
  const { user } = request;

  const todo = user.todos.find( todo => todo.id === id );

  if(!todo){
    return response.status(404).json({error: 'Todo not found ! '})
  }


  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.json(todo) 

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user} = request;

  const changeDone = user.todos.find( changeDone => changeDone.id === id);

  if(!changeDone){
    return response.status(404).json({error: 'Todo not found ! '})
  }

  changeDone.done = true;

  return response.json(changeDone);

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const deleteTodo = user.todos.findIndex( deleteTodo => deleteTodo.id === id);

  if(deleteTodo === -1){
    return response.status(404).json({error: 'Todo not dound'});
  } 

  user.todos.splice(deleteTodo, 1);

  return response.status(204).json();
});


module.exports = app;