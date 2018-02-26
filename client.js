'use strict'

const PeerInfo = require('peer-info')
const waterfall = require('async/waterfall')

const Node = require('./lib/node')

// Insert peerinfo cluster head here.
const bootstrappers = [
	''
]

let node

waterfall([
  (cb) => PeerInfo.create(cb),
  (peerInfo, cb) => {
    peerInfo.multiaddrs.add('/ip4/0.0.0.0/tcp/0')
    node = new Node(peerInfo, bootstrappers)
    node.start(cb)
  }
], (err) => {
  if (err) { throw err }

  console.log('Listening on:')
  node.peerInfo.multiaddrs.forEach((ma) => console.log(ma.toString()))

  node.on('peer:discovery', (peer) => {
    console.log('Discovered:', peer.id.toB58String())
    node.dial(peer, () => {})
  })

  node.on('peer:connect', (peer) => {
    console.log('Connection established to:', peer.id.toB58String())
  })

  node.pubsub.subscribe('bee-bee', (msg) => console.log(msg.from, msg.data.toString()), () => {})
})
