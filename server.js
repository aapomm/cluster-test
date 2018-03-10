'use strict'

const PeerInfo      = require('peer-info')
const pull			    = require('pull-stream')
const waterfall     = require('async/waterfall')
const { Writable }  = require('stream');

const API  = require('./lib/api')
const BC   = require('./lib/block')
const Node = require('./lib/node')

let node

const outStream = new Writable({
  write(chunk, encoding, callback) {
    console.log(chunk.toString());
  }
});

function logger () {
  return function (read) {
    read(null, function next(end, data) {
      if(end === true) return
      if(end) throw end

      console.log(data)
      read(null, next)
    })
  }
}

waterfall([
  (cb) => PeerInfo.create(cb),
  (peerInfo, cb) => {
    peerInfo.multiaddrs.add('/ip4/0.0.0.0/tcp/0')
    node = new Node(peerInfo, [])
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

  node.handle('/powvalidate', (protocol, conn) => {
    console.log('handle...')

    pull(
      conn,
      logger()
    )
  })

  node.pubsub.subscribe(node.topic, (msg) => console.log(msg.from, msg.data.toString()), () => {})

  const api = new API(node)
  api.listen()
})
