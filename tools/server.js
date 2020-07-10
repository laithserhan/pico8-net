const { spawn } = require('child_process');
const net = require('net');
const path = require('path');

var args = process.argv.slice(2);

// start server
const server = net.createServer((client) => {
  // 'connection' listener.
  console.log('client connected');

  // spawns pico8
  // args 0: exe location
  // args 1: home
  // args 2: cart name
  const pico8 = spawn(args[0], ['-home',args[1],'-p','server',path.join(args[1],'carts',args[2])]);

  pico8.stderr.on('data', (data) => {
    console.error(`[PICO8] error: ${data}`);
  });

  pico8.stdout.on('data',(data) => {
    console.log('-->');
    client.write(data);
  });

  client.on('data',(data) => {
    console.log('<--');
    pico8.stdin.write(data);
  });
  
  pico8.on('close', (code) => {
    console.log(`PICO8 process exited with code ${code}`);
    server.close();
  });

  client.on('end', () => {
    console.log('client disconnected');
  });

  // connect pico to remote client
  //pico8.stdout.pipe(client);
  // connect pico to incoming data
  //client.pipe(pico8.stdin);
});
server.on('error', (err) => {
  throw err;
});
server.listen(8124, () => {
  console.log('Server bound\nStarting PICO8...');
});
