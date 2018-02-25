'use strict'

const libp2p = require('libp2p')
const TCP = require('libp2p-tcp')
const Mplex = require('libp2p-mplex')
const SECIO = require('libp2p-secio')
const PeerInfo = require('peer-info')
const waterfall = require('async/waterfall')

const express = require('express')
const http = express()

const Node = require('./lib/node')

let node

waterfall([
  (cb) => PeerInfo.create(cb),
  (peerInfo, cb) => {
    peerInfo.multiaddrs.add('/ip4/0.0.0.0/tcp/0')
    node = new Node(peerInfo)
    node.start(cb)
  }
], (err) => {
  if (err) { throw err }

  console.log('Listening on: ')
  node.peerInfo.multiaddrs.forEach((ma) => console.log(ma.toString()))

  node.on('peer:discovery', (peer) => {
    console.log('Discovered:', peer.id.toB58String())
    node.dial(peer, () => {})
  })

  node.on('peer:connect', (peer) => {
    console.log('Connection established to:', peer.id.toB58String())
  })

  node.pubsub.subscribe('bee-bee', (msg) => console.log(msg.from, msg.data.toString()), () => {})

  http.get('/hello', (req, res) => {
    node.pubsub.publish('bee-bee',
      Buffer.from('Hello World!'),
      () => {}
    )
    res.send(200)
  })

  http.listen(3000, () => console.log('Example app listening on port 3000!'))
})
