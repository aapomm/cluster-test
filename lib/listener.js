const crypto  = require('crypto')
const pow     = require('proof-of-work')
const pull    = require('pull-stream')
const solver  = new pow.Solver()

const Blocks = require('./blocks')

class Listener {
  constructor (node, dialerInfo) {
    this.node = node
    this.dialerInfo = dialerInfo
  }

  handleAnnounce (msgData) {
    let from = msgData.from
    let msg = JSON.parse(msgData.data.toString())
    // let data = Blocks.stringToArray(msg)[0]

    console.log('announcer: ' + from)

    // validation
    // if (from != '') { return }

    if (msg.head == '_NT') {
      console.log('Calculating proof of work...')
      let nonce = this._calculatePOW(msg.complexity, msg.transaction)
      this._sendNonce(nonce)
    }

    else if (msg.head == '_UB' || msg.head == '_NW') {
      console.log('Updating block...')
      Blocks.addTransactions(msg.hash, msg.timestamp, msg.transactions)
    }

    else {
      console.log('Unhandled announcement from: ' + msgData.from)
      console.log(msg)
    }
  }

  _calculatePOW (complexity, data) {
    let prefix = this._generatePrefix(data)
    return solver.solve(complexity, Buffer.from(prefix, 'hex'))
  }

  _generatePrefix(data) {
    let prevHash = Blocks.getTransactions(1).hash
    let hash = crypto.createHash('sha256')

    hash.update(prevHash + data.join(''))
    return hash.digest('hex')
  }

  _sendNonce (msg) {
    console.log('Sending nonce...')
    let timestamp = + new Date()

    this.node.dialProtocol(this.dialerInfo, '/powvalidate', (err, conn) => {
      if (err) { throw err }

      pull(pull.values([timestamp.toString(), msg, 'winnerhash']), conn)
    })
  }
}

module.exports = Listener
