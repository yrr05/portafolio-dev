// scripts/server.cjs — Arranca todos los json-server en puertos distintos
const { exec } = require('child_process');
const path = require('path');

const servers = [
  { file: 'data/usuarios.json',   port: 3001 },
  { file: 'data/rutinas.json',    port: 3002 },
  { file: 'data/ejercicios.json', port: 3003 },
  { file: 'data/clases.json',     port: 3004 },
  { file: 'data/eventos.json',    port: 3005 },
];

servers.forEach(({ file, port }) => {
  const cmd = `npx json-server --watch ${file} --port ${port} --host 0.0.0.0`;
  const proc = exec(cmd, { cwd: path.resolve(__dirname, '..') });
  proc.stdout.on('data', d => process.stdout.write(`[${port}] ${d}`));
  proc.stderr.on('data', d => process.stderr.write(`[${port}] ${d}`));
  console.log(`JSON Server: ${file} → http://0.0.0.0:${port}`);
});
