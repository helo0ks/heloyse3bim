const bcrypt = require('bcrypt');
const { pool } = require('./db');

(async ()=>{
  try{
    const emails = ['admin@snoopy.com','ana.silva@email.com','bruno.costa@email.com'];
    const newPass = '123456';
    const hash = await bcrypt.hash(newPass, 10);
    for(const email of emails){
      const res = await pool.query('UPDATE pessoa SET senha = $1 WHERE email = $2 RETURNING cpf,email', [hash, email]);
      console.log('Updated:', res.rows);
    }
    console.log('Done. Password set to', newPass);
  }catch(e){
    console.error('Erro:', e);
  }finally{
    await pool.end();
  }
})();
