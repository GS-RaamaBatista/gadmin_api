import { getDataHoraAtual } from "./userController.js";
import { pool } from '../db/connection.js';

export async function logoutHandler(req, res) {
  const { ip, usuarioId, detalhe } = req.body;
  const dataHora = getDataHoraAtual();

  if (!usuarioId) {
    return res.status(400).json({ error: 'ID do usuário é obrigatório para registrar logout.' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO gfw_access (idd, date, logout, ip, details) VALUES (?, ?, 1, ?, ?)`,
      [usuarioId, dataHora, ip, detalhe]
    );

    const acessoId = result.insertId;

    res.status(200).json({ message: 'Logout registrado com sucesso.', acessoId });

  } catch (error) {
    res.status(500).json({ error: 'Erro ao registrar logout.' });
  }
}
