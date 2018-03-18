'use strict'

const PeerInfo 	= require('peer-info')
const pull			= require('pull-stream')
const waterfall = require('async/waterfall')

const Node      = require('./lib/node')
const Listener  = require('./lib/listener')

const dialerInfo = process.argv[2]

// Insert peerinfo cluster head here.
const bootstrappers = [ dialerInfo ]

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

    const listener = new Listener(node, dialerInfo)
    node.pubsub.subscribe('bee-bee', (msg) => listener.handleAnnounce(msg), () => {})
  })
})
