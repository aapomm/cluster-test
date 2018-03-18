const Blocks = require('./blocks')

class Announcer {
  constructor (node, locker) {
    this.node = node
    this.currentTransaction = []
    this.reward = 1
    this.locker = locker
  }

  announceNewTransaction(transaction) {
    this.currentTransaction = transaction

    // MSGHEADER, COL, FROM_H, TO_H, AMT
    let msg = '_NT, 13, ' + this.currentTransaction.join(', ')

    console.log('announcing...')
    console.log(msg)
    this.node.pubsub.publish(this.node.topic, new Buffer(msg), (err) => {
      if (err) { console.log('announceNT error: ' + err) }
    })
  }

  announceUpdateBlock(hash, ts, hashWinner) {
    console.log('announce UB')
    let tCurrent = this.currentTransaction

    let msg =
      '_UB, ' +
      hash + ', ' +
      ts + ', ' +
      this.currentTransaction.join(', ') + ', ' +
      hashWinner + ', ' +
      this.reward

    this.node.pubsub.publish(this.node.topic, new Buffer(msg), (err) => {
      if (err) { console.log('announceNT error: ' + err) }
    })

    let transactions = [
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

    // Blocks.addTransactions(hash, ts, transactions)

    this.locker.unlock()
  }
}

module.exports = Announcer
