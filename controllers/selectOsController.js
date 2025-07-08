import { pool } from '../db/connection.js';

export async function selectOs(req, res) {
  const { userId, setorId, filtro } = req.query;

  try {
    let resultado;

    switch (filtro) {
      case 'Backlog':
        [resultado] = await pool.query(`
          SELECT
            O.*,
            S.descricao AS situacao,
            P.nome_interno AS produto,
            R.descricao AS prioridade,
            T.descricao AS tipo
          FROM os O
          LEFT JOIN os_situacoes S ON O.id_os_situacoes = S.id
          LEFT JOIN produtos P ON O.id_produtos = P.id
          LEFT JOIN os_prioridades R ON O.id_os_prioridades = R.id
          LEFT JOIN os_tipos T ON T.id = O.id_os_tipos
          WHERE O.id_os_situacoes IN (1,13,15,14) 
            AND O.id_setores = ?
          ORDER BY O.id_os_prioridades, O.id;
        `, [setorId]);

        return res.status(200).json({ osBacklog: resultado });

      case 'Afazer':
        [resultado] = await pool.query(`
          SELECT
            O.*,
            S.descricao AS situacao,
            P.nome_interno AS produto,
            R.descricao AS prioridade,
            T.descricao AS tipo
          FROM os O
          LEFT JOIN os_situacoes S ON O.id_os_situacoes = S.id
          LEFT JOIN produtos P ON O.id_produtos = P.id
          LEFT JOIN os_prioridades R ON O.id_os_prioridades = R.id
          LEFT JOIN os_tipos T ON T.id = O.id_os_tipos
          WHERE O.id_os_situacoes IN (1,14,13) 
            AND O.id_setores = ?
          ORDER BY O.id_os_prioridades, O.id;
        `, [setorId]);

        return res.status(200).json({ osAfazer: resultado });

        default:
          return res.status(400).json({ error: 'Filtro inválido' });
    }

  } catch (error) {
    console.error('Erro ao buscar OS:', error);
    res.status(500).json({ error: 'Erro ao buscar OS' });
  }
}


