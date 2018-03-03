const crypto  = require('crypto')
const pow     = require('proof-of-work')
const solver  = new pow.Solver()

const BC = require('./block.js')

class Listener {
  static handleAnnounce (msgData) {
    let msg = msgData.data.toString()
    let data = BC.stringToArray(msg)

    if (msg.startsWith('_NT')) {
      let nonce = _calculatePOW()
      _sendNonce(msg.from, nonce)
    }

    else if (msg.startsWith('_UB')) {
    }

    else {
      console.log('Unhandled announcement from: ' + msgData.from)
      console.log(msg)
    }
  }

  static _calculatePOW (data) {
    let prefix = Buffer.from(_generatePrefix(data), 'hex')
    return solver.solver(data[1], prefix)
  }

  static _generatePrefix(data) {
    let prevHash = BC.getTransactions[0]
    let hash = crypto.createHash('sha256')

    hash.update(prevHash + data[2] + data[3]+ data[4])
    return hash.digest('hex')
  }

  static _sendNonce (dialerInfo, msg) {
    node.dialProtocol(dialerInfo, '/powvalidate', (err, conn) => {
      if (err) { throw err }

      pull(pull.values([msg]), conn)
    })
  }
}

module.exports = Listener
