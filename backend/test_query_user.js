(async ()=>{
  const { pool } = require('./db');
  try{
    const res = await pool.query('SELECT cpf,email,senha,tipo FROM pessoa WHERE email = $1',['admin@snoopy.com']);
    console.log(res.rows);
  }catch(e){
    console.error('ERRO QUERY:', e);
  }finally{
    await pool.end();
  }
})();
