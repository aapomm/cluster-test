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
    super(modules, peerInfo)
  }
}

