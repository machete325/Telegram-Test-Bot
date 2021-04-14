const express = require('express');
const { default: axios } = require('axios');
const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');
const Currency = require('./models/Currency');
const Moment = require('moment');
const MomentRange = require('moment-range');
const moment = MomentRange.extendMoment(Moment);
const BaseUrl = require('./config/keys').BaseUrl;
const db = require('./config/keys').MongoURI;
const TOKEN = require('./config/keys').TOKEN;
const ACCESS_KEY = require('./config/keys').ACCESS_KEY;
const currency_symbols = require('./src/CurrencySymbols');
const PORT = 9000;

const app = express();

// connect to mongodb
mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log(err));

const bot = new TelegramBot(TOKEN, {
  polling: true,
});

// command "start"
bot.onText(/\/start/, (msg) => {
  try {
    const { id } = msg.chat;
    bot.sendMessage(id, `Hello ${msg.chat.first_name} ${msg.chat.last_name}`);
  } catch (error) {
    const { id } = msg.chat;
    bot.sendMessage(id, 'Error, contact the administrator');
  }
});

// command "list"
bot.onText(/\/list/, async (msg) => {
  async function NewDocBd() {
    try {
      const responce = await axios.get(BaseUrl, {
        params: {
          access_key: ACCESS_KEY,
        },
      });
      let obj = responce.data.rates;
      const { id } = msg.chat;
      let arr = [];
      for (let prop in obj) {
        arr = [...arr, `${prop}: ${obj[prop].toFixed(2)}`];
      }
      list = arr
        .map((item) => {
          return `${item}`;
        })
        .join('\n');
      bot.sendMessage(id, list);
      const date = new Date();
      const data = new Currency({ id: 12345, rates: arr, date: date });

      data.save(function (err) {
        if (err) return console.log(err);
      });
    } catch (error) {
      console.log(error);
    }
  }
  async function UpdateData() {
    try {
      const responce = await axios.get(BaseUrl, {
        params: {
          access_key: ACCESS_KEY,
        },
      });
      let obj = responce.data.rates;
      const { id } = msg.chat;
      let arr = [];
      for (let prop in obj) {
        arr = [...arr, `${prop}: ${obj[prop].toFixed(2)}`];
      }
      list = arr
        .map((item) => {
          return `${item}`;
        })
        .join('\n');
      bot.sendMessage(id, list);
      const date = new Date();
      Currency.updateOne({ id: 12345 }, { $set: { rates: arr }, $set: { date: date } }).exec(
        (err) => {
          if (err) return err;
        },
      );
    } catch (error) {
      console.log(error);
    }
  }
  async function GetData() {
    try {
      const data = await Currency.find({ id: 12345 }).exec();
      let obj = data[0].rates;
      const { id } = msg.chat;
      let arr = [];
      for (let prop in obj) {
        arr = [...arr, `${obj[prop]}`];
      }
      list = arr
        .map((item) => {
          return `${item}`;
        })
        .join('\n');
      bot.sendMessage(id, list);
    } catch (error) {
      console.log(error);
    }
  }
  try {
    let dbExists = await Currency.find({}).exec();
    if (dbExists.length === 0) {
      NewDocBd();
    } else {
      let data = await Currency.find({ id: 12345 }).exec();
      const start = data[0].date;
      const end = new Date();
      const range = moment.range(start, end);
      let minutes = (range.valueOf() / (1000 * 60)).toFixed(1);
      console.log(minutes);
      if (minutes > 10) {
        UpdateData();
        console.log('Data is update');
      } else {
        GetData();
        console.log('Data is not update');
      }
    }
  } catch (error) {
    const { id } = msg.chat;
    bot.sendMessage(id, 'Error, contact the administrator');
  }
});

// command "exchange"
bot.onText(/\/exchange (.+)/, async (msg, arr) => {
  try {
    const { id } = msg.chat;
    let data = arr[1].split(' ', 4);
    if (data.length === 3) {
      let CurrencyType = data[0];
      let ToCurrencyType = data[2];
      let ConvertValue = CurrencyType.slice(1);
      CurrencyType = CurrencyType.slice(0, 1);
      for (let prop in currency_symbols) {
        if (currency_symbols[prop] == CurrencyType) {
          CurrencyType = prop;
        }
      }
      bot.sendMessage(
        id,
        `Available currency: ${CurrencyType}\nRequired currency: ${ToCurrencyType}\nAmount: ${ConvertValue}`,
      );
    } else {
      let CurrencyType = data[1];
      let ToCurrencyType = data[3];
      let ConvertValue = data[0];
      bot.sendMessage(id, arr[1]);
      bot.sendMessage(
        id,
        `Available currency: ${CurrencyType}\nRequired currency: ${ToCurrencyType}\nAmount: ${ConvertValue}`,
      );
    }
  } catch (error) {
    const { id } = msg.chat;
    bot.sendMessage(id, 'Error, contact the administrator');
  }
});

app.listen(PORT, () => {
  console.log(`Telegram Bot started on port: ${PORT}`);
});
