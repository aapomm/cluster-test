const crypto  = require('crypto')
const pow     = require('proof-of-work')
const pull    = require('pull-stream')
const solver  = new pow.Solver()

const Blocks = require('./blocks')

class Listener {
  constructor (node, dialerInfo, walletHash) {
    this.node = node
    this.dialerInfo = dialerInfo
    this.walletHash = walletHash
  }

  handleAnnounce (msgData) {
    let from = msgData.from
    let msg = JSON.parse(msgData.data.toString())

    console.log('announcer: ' + from)

    // from validation
    // if (from != '') { return }

    if (msg.head == '_NT') {
      console.log('Calculating proof of work...')
      let nonce = this._calculatePOW(msg.complexity, msg.transaction)
      this._sendNonce(nonce, msg.transaction[3])
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

  _sendNonce (msg, transactionId) {
    console.log('Sending nonce...')
    let timestamp = + new Date()

    this.node.dialProtocol(this.dialerInfo, '/pow', (err, conn) => {
      if (err) { throw err }

      pull(pull.values([timestamp.toString(), msg, this.walletHash, transactionId]), conn)
    })
  }
}

module.exports = Listener
