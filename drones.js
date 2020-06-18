const IRCClient = require('./irc-client');

const useTor = true;

function onConnect(drone) {
  const target = '#testchan';
  drone.send(`JOIN ${target}`);
  drone.send(`PRIVMSG ${target} :blah blah`);
}

function createDrone() {
  const drone = new IRCClient({
    nick: 'fooff',
    user: 'bar',
    name: 'baz',
    server: 'localhost',
    port: 6667,
    proxy: {
      host: useTor ? 'localhost' : '',
      port: 9050,
      timeout: 5000,
    },
  });
  drone.on('recv', msg => {console.log(msg); /^:\S+ 001 /.test(msg) && onConnect(drone)});
  drone.on('error', err => {console.error('!ERROR', err)});
  drone.on('close', () => drone.disconnect());
  drone.connect();
}

process.on('uncaughtException', err => console.error('!UNCAUGHT EXCEPTION', err.stack));
createDrone();
