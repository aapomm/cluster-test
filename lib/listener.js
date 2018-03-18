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
    let msg = msgData.data.toString()
    let data = Blocks.stringToArray(msg)[0]

    // validation
    // if (from != '') { return }

    if (msg.startsWith('_NT')) {
      console.log('Calculating proof of work...')
      let nonce = this._calculatePOW(data)
      this._sendNonce(nonce)
    }

    else if (msg.startsWith('_UB')) {
      console.log('Receive Update Block')
      let transactions = [
        {
          from: data[6],
          to: 'blackhole',
          value: data[7]
        },
        {
          from: data[3],
          to: data[4],
          value: data[5]
        }
      ]

      Blocks.addTransactions(data[1], data[2], transactions)
    }

    else {
      console.log('Unhandled announcement from: ' + msgData.from)
      console.log(msg)
    }
  }

  _calculatePOW (data) {
    let prefix = this._generatePrefix(data)
    return solver.solve(data[1], Buffer.from(prefix, 'hex'))
  }

  _generatePrefix(data) {
    let prevHash = Blocks.getTransactions(1).hash
    let hash = crypto.createHash('sha256')
    let str = prevHash + data[2] + data[3]+ data[4]

    hash.update(str)
    return hash.digest('hex')
  }

  _sendNonce (msg) {
    console.log('Sending nonce: ')
    let timestamp = + new Date()

    this.node.dialProtocol(this.dialerInfo, '/powvalidate', (err, conn) => {
      if (err) { throw err }

      pull(pull.values([timestamp.toString(), msg, 'winnerhash']), conn)
    })
  }
}

module.exports = Listener
