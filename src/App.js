import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import {TodoForm, TodoList, Footer} from './components/todo'
import {addTodo, generateId, findById, toggleTodo, updateTodo, removeTodo, filterTodos} from './lib/todoHelpers'
import{pipe, partial} from './lib/utils'
import PropTypes from 'prop-types'
import {loadTodos, createTodo, saveTodo, destroyTodo} from './lib/todoService'

class App extends Component{
  state = {
    todos: [],
    currentTodo: ''
  }
  /*constructor(){
    super()
    this.state = {
      todos: [
        {id: 1, name: 'Learn JSX', isComplete:true},
        {id: 2, name: 'Build an Awesome App', isComplete:false},
        {id: 3, name: 'Ship it!', isComplete:false},
      ],
      currentTodo: ''
    }
    this.handleInputChange = this.handleInputChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleEmptySubmit = this.handleEmptySubmit.bind(this)
  }*/

  static contextTypes = {
    route: PropTypes.string
  }

  componentDidMount() {
    loadTodos()
      .then(todos => this.setState({todos}))
  }

  handleRemove = (id, evt) => {
    evt.preventDefault()
    const updatedTodos = removeTodo(this.state.todos, id)
    this.setState({todos: updatedTodos})
    destroyTodo(id)
      .then(()=> this.showTempMessage('Todo Removed'))
  }

  handleToggle = (id) => {
    const getToggledTodo = pipe(findById, toggleTodo)
    const updated = getToggledTodo(id, this.state.todos)
    const getUpdatedTodos = partial(updateTodo, this.state.todos)
    const updatedTodos = getUpdatedTodos(updated)
    this.setState({todos: updatedTodos})
    saveTodo(updated)
      .then(() => this.showTempMessage('Todo updated'))
  }

  handleSubmit = (evt) => {
    evt.preventDefault()
    const newId = generateId()
    const newTodo = {id: newId, name: this.state.currentTodo, isComplete: false}
    const updatedTodos = addTodo(this.state.todos, newTodo)
    this.setState({
      todos: updatedTodos,
      currentTodo: '',
      errorMessage: ''
    })
    createTodo(newTodo)
      .then(() => this.showTempMessage('Todo added'))
  }

  showTempMessage = (msg)  => {
    this.setState({message: msg})
    setTimeout(() => this.setState({message: ''}), 2500)
  }

  handleEmptySubmit = (evt) => {
    evt.preventDefault()
    this.setState({
      errorMessage: 'Please supply a todo name'
    })
  }

  handleInputChange = (evt) => {
    this.setState(
      {
        currentTodo: evt.target.value
      })
  }

  render(){
    const submitHandler = this.state.currentTodo ? this.handleSubmit : this.handleEmptySubmit
    const displayTodos = filterTodos(this.state.todos, this.context.route)
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React!
          </a>
        </header>

        <div className="Todo-App">
          {this.state.errorMessage && <span className='error'> {this.state.errorMessage}</span>}
          {this.state.message && <span className='success'> {this.state.message}</span>}
          <TodoForm handleInputChange={this.handleInputChange}
            currentTodo={this.state.currentTodo}
            handleSubmit={submitHandler}/>
        </div>

        <TodoList handleToggle={this.handleToggle} 
          todos={displayTodos}
          handleRemove={this.handleRemove}/>
        <Footer/>
      </div>
    );
  }
}

export default App;
