const crypto  = require('crypto')
const pow     = require('proof-of-work')
const pull    = require('pull-stream')
const solver  = new pow.Solver()

const BC = require('./block.js')

class Listener {
  constructor (node, dialerInfo) {
    this.node = node
    this.dialerInfo = dialerInfo
  }

  handleAnnounce (msgData) {
    let msg = msgData.data.toString()
    let data = BC.stringToArray(msg)[0]

    if (msg.startsWith('_NT')) {
      console.log('Calculating proof of work...')
      let nonce = this._calculatePOW(data)
      this._sendNonce(nonce)
    }

    else if (msg.startsWith('_UB')) {
    }

    else {
      console.log('Unhandled announcement from: ' + msgData.from)
      console.log(msg)
    }
  }

  _calculatePOW (data) {
    let prefix = Buffer.from(this._generatePrefix(data), 'hex')
    return solver.solve(data[1], prefix)
  }

  _generatePrefix(data) {
    let prevHash = BC.getTransactions(1)[0]
    let hash = crypto.createHash('sha256')

    hash.update(prevHash + data[2] + data[3]+ data[4])
    return hash.digest('hex')
  }

  _sendNonce (msg) {
    console.log('Sending nonce: ')
    console.log(msg)
    this.node.dialProtocol(this.dialerInfo, '/powvalidate', (err, conn) => {
      if (err) { throw err }

      pull(pull.values([msg]), conn)
    })
  }
}

module.exports = Listener
