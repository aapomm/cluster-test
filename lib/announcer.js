class Announcer {
  constructor (node) {
    this.node = node
  }

  announceNewTransaction() {
    // MSGHEADER, COL, FROM_H, TO_H, AMT
    let msg = new Buffer('_NT, 22, hash1, hash2, amt')

		node.pubsub.publish(node.topic, msg, (err) => {
      console.log('announceNT error: ' + err)
    })
  }

  announceUpdateBlock() {
  }
}

module.exports = Announcer
