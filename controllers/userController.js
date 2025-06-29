import { pool } from '../db/connection.js';

function getDataHoraAtual() {
  const agora = new Date();

  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const dia = String(agora.getDate()).padStart(2, '0');

  const hora = String(agora.getHours()).padStart(2, '0');
  const minuto = String(agora.getMinutes()).padStart(2, '0');
  const segundo = String(agora.getSeconds()).padStart(2, '0');

  return `${ano}-${mes}-${dia} ${hora}:${minuto}:${segundo}`;
}

export async function loginHandler(req, res) {
  const { email, password, ip } = req.query;

  try {
    let query = 'SELECT name, client, id, nickname, email FROM gfw_users WHERE (email = ? OR nickname = ?) AND password = ?';
    let params = [email, email, password];

    const [rows] = await pool.query(query, params);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    const usuario = rows[0];

    if (usuario.client == '1') {
      return res.status(403).json({ error: 'Usuário não tem permissão.' });
    }

    const dataHora = getDataHoraAtual();
    const details = email === usuario.nickname
    ? `Nickname: ${usuario.nickname}`
    : `Email: ${usuario.email}`;

  // pegar ip do front

    const [result] = await pool.query(
      'INSERT INTO gfw_access (idd, date, login, details) VALUES (?, ?, ?, ?)',
      [usuario.id, dataHora, '1', details ]
  )

    res.status(200).json({
      usuario,
      acessoId: result.insertId,
      message: 'Acesso registrado com sucesso!'
    });

  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ error: 'Erro ao buscar usuários.' });
  }
}

