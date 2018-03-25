'use strict'

const PeerInfo      = require('peer-info')
const pull			    = require('pull-stream')
const waterfall     = require('async/waterfall')

const Announcer = require('./lib/announcer')
const API       = require('./lib/api')
const Blocks    = require('./lib/blocks')
const Locker    = require('./lib/locker')
const Node      = require('./lib/node')
const Validator = require('./lib/validator')

let node

waterfall([
  (cb) => PeerInfo.create(cb),
  (peerInfo, cb) => {
    peerInfo.multiaddrs.add('/ip4/0.0.0.0/tcp/0')
    node = new Node(peerInfo, [])
    node.start(cb)
  }
], (err) => {
  if (err) { throw err }

  const locker    = new Locker()
  const announcer = new Announcer(node, locker)
  const api       = new API(node, announcer, locker)
  const validator = new Validator(announcer)

  console.log('Listening on: ')
  node.peerInfo.multiaddrs.forEach((ma) => console.log(ma.toString()))

  node.on('peer:discovery', (peer) => {
    console.log('Discovered:', peer.id.toB58String())
    node.dial(peer, () => {})
  })

  node.on('peer:connect', (peer) => {
    console.log('Connection established to:', peer.id.toB58String())

    let blocksString = Blocks.getBlocksFile()

    node.dialProtocol(peer, '/bootstrap', (err, conn) => {
      if (err) { throw err }
      pull(pull.values([blocksString]), conn)
    })
  })

  node.handle('/pow', (protocol, conn) => {
    pull(
      conn,
      validator.validate(validator)
    )
  })

  node.pubsub.subscribe(node.topic, (msg) => console.log(msg.from, msg.data.toString()), () => {})

  api.listen()
})
