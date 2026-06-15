const fs = require('fs');
let code = fs.readFileSync('backend/index.js', 'utf8');
code = code.replace("app.listen(port", "app.get('/api/debug-log', (req, res) => { try { res.json(JSON.parse(fs.readFileSync('data/last-raw-payload.json', 'utf8'))); } catch(e) { res.status(404).json({error: e.message}); } }); app.listen(port");
fs.writeFileSync('backend/index.js', code);
