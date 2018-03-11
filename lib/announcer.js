class Announcer {
  constructor (node) {
    this.node = node
    this.currentTransaction = 'none'
    this.reward = 1
  }

  announceNewTransaction(transaction) {
    // this.currentTransaction = transaction
    this.currentTransaction = 'hash1, hash2, 5'

    // MSGHEADER, COL, FROM_H, TO_H, AMT
    let msg = '_NT, 13, ' + this.currentTransaction

    console.log('announcing...')
    console.log(msg)
    this.node.pubsub.publish(this.node.topic, new Buffer(msg), (err) => {
      if (err) { console.log('announceNT error: ' + err) }
    })
  }

  announceUpdateBlock(hashWinner) {
    console.log('announce UB')

    let msg =
      '_UB, ' +
      this.currentTransaction + ', ' +
      hashWinner + ', ' +
      this.reward

    // this.node.pubsub.publish(this.node.topic, new Buffer(msg), (err) => {
      // if (err) { console.log('announceNT error: ' + err) }
    // })
  }
}

module.exports = Announcer
