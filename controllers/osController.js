import { pool } from '../db/connection.js';

export async function getOS(req, res) {
  const { userId } = req.query;

  try {

    const [os] = await pool.query(`
      SELECT
          O.*, S.descricao AS situacao, P.nome_interno AS produto,
          R.descricao AS prioridade, T.descricao AS tipo
      FROM os O
      LEFT JOIN os_situacoes S ON O.id_os_situacoes = S.id
      LEFT JOIN produtos P ON O.id_produtos = P.id
      LEFT JOIN os_prioridades R ON O.id_os_prioridades = R.id
      LEFT JOIN os_tipos T ON T.id = O.id_os_tipos
      WHERE O.id_pessoas_atendente = ?
        AND O.id_os_situacoes IN (1, 2, 3)
      ORDER BY O.sprint DESC, O.id_os_prioridades, O.data_cadastro;
    `, [userId]);

    res.status(200).json({ os });

  } catch (err) {
    console.error('Erro ao buscar OS:', err);
    res.status(500).json({ error: 'Erro ao buscar OS' });
  }
}


export async function getSetores(req, res) {
  try {
    const [setores] = await pool.query(`
      SELECT id, descricao FROM setores;
    `);

    res.status(200).json({ setores })
  } catch (error) {
    console.error('Erro ao buscar setores:', error)
    res.status(500).json({ error: 'Erro ao buscar setores.' })
  }
}
