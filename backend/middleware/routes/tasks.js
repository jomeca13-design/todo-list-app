const express = require('express');
const Task = require('../models/Task');
const auth = require('../middleware/auth');
const nodemailer = require('nodemailer');
const router = express.Router();

// Crear tarea
router.post('/', auth, async (req, res) => {
  const { title, description, dueDate, category } = req.body;
  try {
    const task = new Task({ title, description, dueDate, category, user: req.user.id });
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ msg: 'Error' });
  }
});

// Obtener tareas del usuario
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ msg: 'Error' });
  }
});

// Actualizar tarea
router.put('/:id', auth, async (req, res) => {
  const { id } = req.params;
  try {
    const task = await Task.findOneAndUpdate(
      { _id: id, user: req.user.id },
      req.body,
      { new: true }
    );
    if (!task) return res.status(404).json({ msg: 'Tarea no encontrada' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ msg: 'Error' });
  }
});

// Eliminar tarea
router.delete('/:id', auth, async (req, res) => {
  const { id } = req.params;
  try {
    const task = await Task.findOneAndDelete({ _id: id, user: req.user.id });
    if (!task) return res.status(404).json({ msg: 'Tarea no encontrada' });
    res.json({ msg: 'Eliminada' });
  } catch (err) {
    res.status(500).json({ msg: 'Error' });
  }
});

// Notificación simple (email si dueDate es hoy)
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

// Función para chequear notificaciones (llámalo en un cron job o al cargar tareas)
router.get('/notifications', auth, async (req, res) => {
  const today = new Date().toDateString();
  const tasks = await Task.find({
    user: req.user.id,
    dueDate: { $exists: true },
    completed: false
  }).where('dueDate').equals(new Date(today));

  if (tasks.length > 0) {
    // Envía email (opcional, desactiva si no quieres)
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: req.user.email,  // Asume que tienes email en req.user
      subject: '¡Tareas pendientes hoy!',
      text: `Tienes ${tasks.length} tareas: ${tasks.map(t => t.title).join(', ')}`
    });
  }
  res.json({ notifications: tasks });
});

module.exports = router;