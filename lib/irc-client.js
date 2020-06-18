// Bare-bones IRC client with proxy support

const net = require('net');
const EventEmitter = require('events');
const { SocksClient } = require('socks');

class IRCClient extends EventEmitter {
  constructor(options = {}) {
    super();
    this.opt = options;
  }

  connect() {
    if (this.opt.proxy && this.opt.proxy.host && this.opt.proxy.port) {
      SocksClient.createConnection({
        command: 'connect',
        timeout: this.opt.proxy.timeout || 30000,
        proxy: {
          host: this.opt.proxy.host,
          port: this.opt.proxy.port,
          type: this.opt.proxy.type || 5,
        },
        destination: {
          host: this.opt.server,
          port: this.opt.port,
        },
      }, (err, info) => {
        if (err) {
          this.emit('error', err.message);
        } else {
          this._initSocket(info.socket);
          this._register();
        }
      });
    } else {
      this._initSocket(net.createConnection({
        host: this.opt.server,
        port: this.opt.port,
      }, () => this._register()));
    }
  }

  disconnect() {
    this.socket.destroy();
  }

  send(message) {
    this.emit('send', message);
    this.socket.write(`${message}\r\n`);
  }

  _register() {
    this.emit('connect', this.opt.server, this.opt.port);
    this.send(`NICK ${this.opt.nick}`);
    this.send(`USER ${this.opt.user} 8 * :${this.opt.name}`);
  }

  _initSocket(socket) {
    this._data = '';
    this.socket = socket;
    socket.setEncoding('utf8');
    socket.on('error', (...args) => this.emit('error', ...args));
    socket.on('timeout', () => this.emit('error', 'timeout'));
    socket.on('close', () => this.emit('close'));
    socket.on('data', (data) => {
      this._data += data;
      const messages = this._data.split('\r\n');
      this._data = messages.pop();
      messages.forEach((message) => {
        this.emit('recv', message);
        if (message.startsWith('PING ')) {
          this.send(message.replace('PING', 'PONG'));
        }
      });
    });
  }
}

module.exports = IRCClient;
