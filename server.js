'use strict'

const PeerInfo      = require('peer-info')
const pull			    = require('pull-stream')
const waterfall     = require('async/waterfall')

const Announcer = require('./lib/announcer')
const API       = require('./lib/api')
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

  const announcer = new Announcer(node)
  const api       = new API(node, announcer)
  const validator = new Validator(announcer)

  console.log('Listening on: ')
  node.peerInfo.multiaddrs.forEach((ma) => console.log(ma.toString()))

  node.on('peer:discovery', (peer) => {
    console.log('Discovered:', peer.id.toB58String())
    node.dial(peer, () => {})
  })

  node.on('peer:connect', (peer) => {
    console.log('Connection established to:', peer.id.toB58String())
  })

  node.handle('/powvalidate', (protocol, conn) => {
    pull(
      conn,
      validator.validate(validator)
    )
  })

  node.pubsub.subscribe(node.topic, (msg) => console.log(msg.from, msg.data.toString()), () => {})

  api.listen()
})
