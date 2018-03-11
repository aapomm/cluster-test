const fs      = require('fs')
const stream  = require('stream')
const spawn   = require('child_process')

const blocks = require('../beebee.json')

class Blocks {
  static getTransactions(lastNTransactions) {
    let count = lastNTransactions || 100
    let transactions = blocks.slice(0, count)

    let transactionArray = transactions.map((record) => record.transactions)

    // Flatten
    return [].concat.apply([], transactionArray)
  }

  static addTransactions(hash, timestamp, transactions) {
    let newRecord = {
      h: hash,
      timestamp: timestamp,
      transactions: transactions
    }
    blocks.unshift(newRecord)

    fs.writeFile('beebee.json', JSON.stringify(blocks), function(err){
      if (err) { return console.log(err) }
    })

    return true
  }

  static stringToArray(string) {
    let records = string.trim().split("\n")

    return records.map((record) => {
      return record.split(', ')
    })
  }
}

module.exports = Blocks
