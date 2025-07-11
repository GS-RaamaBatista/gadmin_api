import { pool } from '../db/connection.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import crypto from 'crypto';
dotenv.config();

export function getDataHoraAtual() {
  const agora = new Date();

  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const dia = String(agora.getDate()).padStart(2, '0');

  const hora = String(agora.getHours()).padStart(2, '0');
  const minuto = String(agora.getMinutes()).padStart(2, '0');
  const segundo = String(agora.getSeconds()).padStart(2, '0');

  return `${ano}-${mes}-${dia} ${hora}:${minuto}:${segundo}`;
}

async function registrarAcesso({ usuarioId, ip, sucesso, detalhe }) {
  const dataHora = getDataHoraAtual();
  const coluna = sucesso ? 'login' : 'try';
  const [result] = await pool.query(
    `INSERT INTO gfw_access (idd, date, ${coluna}, ip, details) VALUES (?, ?, 1, ?, ?)`,
    [usuarioId, dataHora, ip, detalhe]
  );
  return result.insertId;
}


export async function loginHandler(req, res) {
  const { email, password, ip } = req.body;
  const SECRET_KEY = process.env.SECRET_KEY;

  try {
    const [rows] = await pool.query(
      'SELECT name, client, id, nickname, email, active, password FROM gfw_users WHERE email = ? OR nickname = ?',
      [email, email]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }


    const usuario = rows[0]
    const loginVia = email === usuario.email ? 'Email' : 'Nickname';
    const detalhe = `${loginVia}: ${email}`;

    const hashDigitado = crypto.createHash('md5').update(password).digest('hex')

    if (hashDigitado !== usuario.password) {
      await registrarAcesso({ usuarioId: usuario.id, ip, sucesso: false, detalhe: detalhe });
      return res.status(401).json({ error: 'Senha incorreta.' })
    }

    if (usuario.active === '0') {
      await registrarAcesso({ usuarioId: usuario.id, ip, sucesso: false, detalhe: detalhe});
      return res.status(403).json({ error: 'Esse usuário encontra-se inativo.' })
    }

    const acessoId = await registrarAcesso({
      usuarioId: usuario.id,
      ip,
      sucesso: true,
      detalhe: detalhe
    });

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      SECRET_KEY
    );

    const dataHora = getDataHoraAtual();

    await pool.query(
      'INSERT INTO ips_liberados (id_pessoas, data, ip) VALUES (?, ?, ?)',
      [usuario.id, dataHora, ip]
    )

    const [noticias] = await pool.query(`
      SELECT  c.id,c.titulo, subtitulo, conteudo, t.descricao tipo, p.nome_interno produto
      FROM gadmin.comunicacao c
      LEFT JOIN gadmin.comunicacao_tipos t ON c.id_comunicacao_tipos=t.id
      LEFT JOIN gadmin.produtos p ON c.id_produtos=p.id WHERE ativa = 1 AND c.aprovada=1 and c.data_inicio< NOW()
      AND c.data_final> NOW()
      AND (c.id_comunicacao_tipos<>5 AND (c.uf_ba+c.uf_ma+c.uf_mt+c.uf_go+c.uf_pr+c.uf_mg+c.uf_rj=0))
      ORDER BY c.data_inicio desc limit 5;
    `);

    res.status(200).json({
      token,
      usuario,
      acessoId,
      noticias,
      message: 'Acesso registrado com sucesso!'
    });

  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ error: 'Erro ao buscar usuários.' });
  }
}
