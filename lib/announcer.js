class Announcer {
  constructor (node) {
    this.node = node
    this.currentTransaction = 'none'
  }

  announceNewTransaction(transaction) {
    // this.currentTransaction = transaction
    this.currentTransaction = 'hash1, hash2, 5'

    // MSGHEADER, COL, FROM_H, TO_H, AMT
    let msg = new Buffer('_NT, 13, hash1, hash2, 5')

    console.log('announcing...')
    this.node.pubsub.publish(this.node.topic, msg, (err) => {
      if (err) { console.log('announceNT error: ' + err) }
    })
  }

  announceUpdateBlock() {
    console.log('announce UB')
  }
}

module.exports = Announcer
