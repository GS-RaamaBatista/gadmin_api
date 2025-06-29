import express from 'express';
import usersRoutes from './routes/users.js';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/users', usersRoutes);

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
