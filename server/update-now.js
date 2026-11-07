// Local par chalao: npm run update  (naye questions Open Trivia DB se + aapke custom files se)
require('./updater').run().then(()=>console.log('Update ho gaya')).catch(e=>console.log('Error',e.message));
