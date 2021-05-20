const TelegramApi = require('node-telegram-bot-api')
const {gameOptions, againOptions} = require('./options')
const sequelize = require('./db')
const UserModel = require('./models')

const token = '1747830878:AAEFrac-p5Lj07eoFOgcqswLHjR4egH-280'

const bot = new TelegramApi(token, {polling: true})

const chats = {}


bot.setMyCommands([
  {command: '/start', description: 'Start the bot'},
  {command: '/info', description: 'Info about the user'},
  {command: '/game', description: 'Start the game'}
])


const startGame = async (chatId) => {
  await bot.sendMessage(chatId, `Now i think of a nr between 0-9`)
  const randomNumber = Math.floor(Math.random() * 10)
  chats[chatId] = randomNumber
  await bot.sendMessage(chatId, `Think of a number`, gameOptions)
}

const start = async() => {

  //db connection
  try {
    await sequelize.authenticate()
    await sequelize.sync()
  } catch (e) {
    console.log('Couldnt connect to db', e);
  }

  bot.on('message', async msg => {
    const text = msg.text 
    const chatId = msg.chat.id
  
    try {
      if (text === '/start') {
        await UserModel.create({chatId})
        return bot.sendMessage(chatId, `Welcome!`)
      }
      if (text === '/info') {
        const user = await UserModel.findOne({chatId})
        return bot.sendMessage(chatId, `Your name is ${msg.from.username}. Right answers: ${user.rightAnswers}. Wrong answers: ${user.wrongAnswers}`)
      }
      if (text === '/game') {
        return startGame(chatId)
      }
      return bot.sendMessage(chatId, `I dont understand you`)
    } catch (e) {
      return bot.sendMessage(chatId, `An error has occured!`)
    }
  })

  bot.on('callback_query', async msg => {
    const data = msg.data
    const chatId = msg.message.chat.id

    if (data === '/again') {
      return startGame(chatId)
    }

    const user = await UserModel.findOne({chatId})
    if (data == chats[chatId]) {
      user.rightAnswers += 1
      await bot.sendMessage(chatId, `Good job! You think like the bot, the number was${data}`, againOptions)
    } else {
      user.wrongAnswers += 1
      await bot.sendMessage(chatId, `Bad! Bot choosed ${chats[chatId]}, but you choosed ${data}`, againOptions)
    }
    await user.save()
  })
}

start()