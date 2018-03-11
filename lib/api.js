const express   = require('express')
const http      = express()
http.use(express.json())

class API {
  constructor (node, announcer) {
    this.node = node
    this.announcer = announcer

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
      let transaction = ''
      if (!this.newTransactionLock) {
        this.announcer.announceNewTransaction(transaction)
        this.newTransactionLock = true
      }
      res.sendStatus(200)
    })
  }
}

module.exports = API
