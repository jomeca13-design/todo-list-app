import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = ({ user, setToken }) => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '', dueDate: '', category: 'Personal' });

  useEffect(() => {
    fetchTasks();
    fetchNotifications();
  }, []);

  const fetchTasks = async () => {
    const res = await axios.get('http://localhost:5000/api/tasks');
    setTasks(res.data);
  };

  const fetchNotifications = async () => {
    const res = await axios.get('http://localhost:5000/api/tasks/notifications');
    if (res.data.notifications.length > 0) {
      alert(`¡Notificaciones! Tareas pendientes: ${res.data.notifications.map(t => t.title).join(', ')}`);
    }
  };

  const addTask = async (e) => {
    e.preventDefault();
    await axios.post('http://localhost:5000/api/tasks', newTask);
    setNewTask({ title: '', description: '', dueDate: '', category: 'Personal' });
    fetchTasks();
  };

  const toggleComplete = async (id) => {
    const task = tasks.find(t => t._id === id);
    await axios.put(`http://localhost:5000/api/tasks/${id}`, { completed: !task.completed });
    fetchTasks();
  };

  const deleteTask = async (id) => {
    await axios.delete(`http://localhost:5000/api/tasks/${id}`);
    fetchTasks();
  };

  return (
    <div>
      <h2>Bienvenido, {user.username}!</h2>
      <button onClick={() => { localStorage.removeItem('token'); setToken(null); }}>Logout</button>
      <h3>Agregar Tarea</h3>
      <form onSubmit={addTask}>
        <input value={newTask.title} onChange={(e) => setNewTask({...newTask, title: e.target.value})} placeholder="Título" required />
        <input value={newTask.description} onChange={(e) => setNewTask({...newTask, description: e.target.value})} placeholder="Descripción" />
        <input type="date" value={newTask.dueDate} onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})} />
        <select value={newTask.category} onChange={(e) => setNewTask({...newTask, category: e.target.value})}>
          <option>Trabajo</option><option>Personal</option><option>Urgente</option><option>Otro</option>
        </select>
        <button type="submit">Agregar</button>
      </form>
      <h3>Tareas</h3>
      <ul>
        {tasks.map(task => (
          <li key={task._id} style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
            {task.title} - {task.category} {task.dueDate && `- Due: ${new Date(task.dueDate).toLocaleDateString()}`}
            <button onClick={() => toggleComplete(task._id)}>{task.completed ? 'Reabrir' : 'Completar'}</button>
            <button onClick={() => deleteTask(task._id)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;