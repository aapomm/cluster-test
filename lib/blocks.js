const fs      = require('fs')
const stream  = require('stream')
const spawn   = require('child_process')

const blocksFile  = 'beebee.json'

class Blocks {
  static getTransactions(lastNTransactions) {
    delete require.cache[require.resolve('../' + blocksFile)]
    const blocks      = require('../' + blocksFile)

    let count = lastNTransactions || 100
    let transactions = blocks.slice(0, count)

    let transactionArray = transactions.map((record) => record.transactions)

    // Flatten
    return [].concat.apply([], transactionArray)
  }

  static addTransactions(hash, timestamp, transactions) {
    delete require.cache[require.resolve('../' + blocksFile)]
    const blocks = require('../' + blocksFile)

    let newRecord = {
      h: hash,
      timestamp: timestamp,
      transactions: transactions
    }
    blocks.unshift(newRecord)

    fs.writeFile(blocksFile, JSON.stringify(blocks, null, 2), function(err){
      if (err) { return console.log(err) }
    })

    return true
  }

  static getAccountValue(hash) {
    let transactions = Blocks.getTransactions()

    let totalValue = 0
    transactions.forEach((element) => {
      if (element['from'] == hash) {
        totalValue -= element['value']
      }
      else if (element['to'] == hash) {
        totalValue += element['value']
      }
      else {}
    })

    return totalValue
  }
}

module.exports = Blocks
