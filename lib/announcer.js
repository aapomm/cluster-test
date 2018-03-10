class Announcer {
  constructor (node) {
    this.node = node
  }

  announceNewTransaction() {
    // MSGHEADER, COL, FROM_H, TO_H, AMT
    let msg = new Buffer('_NT, 13, hash1, hash2, amt')

    console.log('announcing...')
    this.node.pubsub.publish(this.node.topic, msg, (err) => {
      if (err) { console.log('announceNT error: ' + err) }
    })
  }

  announceUpdateBlock() {
  }
}

module.exports = Announcer
