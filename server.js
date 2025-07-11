
import express from 'express';
import usersRoutes from './routes/users.js';
import osRoutes from './routes/os.js'
import selectOsRoutes from './routes/selectOs.js'
import logoutRoutes from './routes/logout.js'
import cors from 'cors'
import { verificarToken } from './middlewares/auth.js'

const app = express()
app.use(cors())
app.use(express.json())

app.use('/users', usersRoutes)
app.use('/os', verificarToken, osRoutes)
app.use('/selectOs', verificarToken, selectOsRoutes)
app.use('/logout', verificarToken, logoutRoutes);


app.listen(3000, () => {
  console.log(`Servidor iniciado na porta 3000`)
});