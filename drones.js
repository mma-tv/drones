#!/usr/bin/env node

const IRCClient = require('./lib/irc-client');
const { randomItem, randomString, uid, sleep } = require('./lib/util');
const words = require('fs').readFileSync('./words.txt').toString().trim().split(/[\r\n]+/);

const settings = {
  useTor: true,
  connectInterval: 5000,
  servers: ['efnet.portlane.se'],
};

async function onConnect(drone) {
  const target = '#testchan';
  drone.send(`JOIN ${target}`);
  drone.send(`PRIVMSG ${target} :${randomString(400)}`);
  drone.send(`NICK ${randomString(8)}`);
  await sleep(1000);
  drone.send('QUIT :brb');
}

function createDrone() {
  const drone = new IRCClient({
    nick: randomItem(words).slice(0, 8) + randomString(1, 'abcdefghijklmnopqrstuvwxyz0123456789`_-'),
    user: randomItem(words).slice(0, 8),
    name: randomItem(words),
    server: settings.servers[uid() % settings.servers.length],
    port: 6667,
    proxy: {
      host: settings.useTor ? 'localhost' : '',
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
setInterval(createDrone, settings.connectInterval);
