import { pool } from '../db/connection.js';

function calculatorDate() {
  const hoje = new Date()
  const diaSemana = hoje.getDay() - 1

  let dataDe, dataAte

  if (diaSemana >= 0) {
    dataDe = new Date(hoje);
    dataDe.setDate(hoje.getDate() - diaSemana)

    dataAte = new Date(dataDe);
    dataAte.setDate(dataDe.getDate() + 4)
  } else {
    dataDe = new Date(hoje);
    dataDe.setDate(hoje.getDate() - 7)

    dataAte = new Date(hoje);
  }

  const formatarData = (data) => data.toISOString().split('T')[0]
  const dataInicial = formatarData(dataDe)
  const dataFinal = formatarData(dataAte)

  return { dataDe, dataAte }
}


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

      case 'Fazendo':

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
          WHERE O.id_os_situacoes IN (2, 3, 4, 13)
            AND O.id_setores = ?
          ORDER BY O.fazendo DESC, O.id_os_situacoes ASC, O.id_os_prioridades, O.id;
        `, [setorId])

          return res.status(200).json({ osFazendo: resultado })


     case 'Feito': 
        const { dataDe, dataAte } = calculatorDate();

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
          WHERE O.id_os_situacoes = 10
            AND DATE(O.data_conclusao) BETWEEN ? AND ?
            AND O.id_setores = ?
          ORDER BY O.id_os_prioridades, O.id
        `, [dataDe, dataAte, setorId]);

          return res.status(200).json({ osFeito: resultado })

        default:
          return res.status(400).json({ error: 'Filtro inválido' });
    }

  } catch (error) {
    console.error('Erro ao buscar OS:', error);
    res.status(500).json({ error: 'Erro ao buscar OS' });
  }
}




