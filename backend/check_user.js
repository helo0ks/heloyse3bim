(async ()=>{
  const { pool } = require('./db');
  const email = 'teste.usuario@example.com';
  try{
    const res = await pool.query('SELECT cpf, nome, email, senha, tipo, reset_token, reset_token_expires, enderecoidendereco FROM pessoa WHERE email = $1', [email]);
    if(res.rows.length===0){
      console.log('Usuário não encontrado para email:', email);
    } else {
      const u = res.rows[0];
      const cpfOrig = u.cpf || '';
      const cpfDigits = cpfOrig.replace(/\D/g,'');
      const cpfFormatted = cpfDigits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
      console.log('Usuário encontrado:');
      console.log('  cpf (orig):', cpfOrig);
      console.log('  cpf (digits):', cpfDigits);
      console.log('  cpf (formatted):', cpfFormatted);
      console.log('  nome:', u.nome);
      console.log('  email:', u.email);
      console.log('  tipo:', u.tipo);
      console.log('  reset_token:', u.reset_token);
      console.log('  enderecoidendereco:', u.enderecoidendereco);
    }
  }catch(e){
    console.error('Erro consultando usuário:', e);
  }finally{
    await pool.end();
  }
})();
