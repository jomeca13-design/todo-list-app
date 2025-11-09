const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB conectado'))
  .catch(err => console.log(err));

app.get('/', (req, res) => res.send('Backend OK!'));

const PORT = process.env.PORT || 3306;
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
app.use('/api/auth', require('./routes/auth'));