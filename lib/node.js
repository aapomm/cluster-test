const libp2p    = require('libp2p')
const TCP       = require('libp2p-tcp')
const Mplex     = require('libp2p-mplex')
const SECIO     = require('libp2p-secio')
const Railing   = require('libp2p-railing')

class Node extends libp2p {
  constructor (peerInfo, bootstrappers) {
    const modules = {
      transport: [new TCP()],
      connection: {
        muxer: [Mplex],
        crypto: [SECIO]
      },
      discovery: [new Railing(bootstrappers)]
    }

    this.topic = 'bee-bee'
    super(modules, peerInfo)
  }
}

module.exports = Node
