const sequelize = require('./db')
const {DataTypes} = require('sequelize')

const User = sequelize.define('user', {
  id: {type: DataTypes.INTEGER, primaryKey: true, unique: true, autoIncrement: true},
  chatId: {types: DataTypes.STRING, unique: true},
  rightAnswers: {type: DataTypes.INTEGER, defaultValue: 0},
  wrongAnswers: {type: DataTypes.INTEGER, defaultValue: 0}
})

module.exports = User