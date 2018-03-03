const Announcer = require('./announcer')

const express   = require('express')
const http      = express()
http.use(express.json())

class API {
  constructor (node) {
    this.node = node
    this.announcer = new Announcer(node)

    this.newTransactionLock = false
  }

  listen() {
    this._setEndpoints()
    http.listen(3000, () => console.log('Example app listening on port 3000!'))
  }

  _setEndpoints() {
    http.get('/transactions', (req, res) => {
      let count = req.query.count
      let transactions = BC.getTransactions(count)
      res.send(transactions)
    })

    http.post('/add', (req, res) => {
      if (!this.newTransactionLock) {
        this.announcer.announceNewTransaction()
        this.newTransactionLock = true
      }
      res.sendStatus(200)
    })
  }
}

module.exports = API
