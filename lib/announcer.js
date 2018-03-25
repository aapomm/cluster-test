const crypto = require('crypto')

const Blocks = require('./blocks')

class Announcer {
  constructor (node, locker) {
    this.locker = locker
    this.node = node

    this.complexity = 13
    this.currentId = null
    this.currentTransaction = []
    this.reward = 1
  }

  announceNewTransaction(transaction) {
    this.currentTransaction = transaction

    this.currentId = crypto.randomBytes(32).toString('hex')
    this.currentTransaction.push(this.currentId)

    let data = {
      head: '_NT',
      complexity: this.complexity,
      // [FROM_H, TO_H, AMT, ID]
      transaction: this.currentTransaction
    }
    let msg = JSON.stringify(data)

    console.log('announcing...')
    console.log(msg)

    this.node.pubsub.publish(this.node.topic, new Buffer(msg), (err) => {
      if (err) { console.log('announceNT error: ' + err) }
    })
  }

  announceUpdateBlock(hash, ts, hashWinner) {
    console.log('announce UB')
    let tCurrent = this.currentTransaction

    let data = {
      head: '_UB',
      hash: hash,
      timestamp: ts,
      transactions: [
        {
          from: hashWinner.toString(),
          to: 'blackhole',
          value: this.reward
        },
        {
          from: tCurrent[0],
          to: tCurrent[1],
          value: tCurrent[2]
        }
      ]
    }

    let msg = JSON.stringify(data)

    this.node.pubsub.publish(this.node.topic, new Buffer(msg), (err) => {
      if (err) { console.log('announceUB error: ' + err) }
    })

    // Blocks.addTransactions(hash, ts, data.transactions)

    this.locker.unlock()
  }

  announceNewWallet() {
    console.log('announce NW')

    let hash  = crypto.createHash('sha256')
    hash.update(crypto.randomBytes(128))

    let walletHash = hash.digest('hex')

    let msg = {
      head: '_NW',
      hash: walletHash,
      timestamp: + new Date(),
      transactions: [
        {
          from: 'blackhole',
          to: walletHash,
          value: 100
        }
      ]
    }

    this.node.pubsub.publish(this.node.topic, new Buffer(JSON.stringify(msg)), (err) => {
      if (err) { console.log('announceNW error: ' + err) }
    })

    return walletHash
  }
}

module.exports = Announcer
