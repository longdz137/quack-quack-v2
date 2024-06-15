const getGoldenDuckInfo = require("../modules/getGoldenDuckInfo");
const getGoldenDuckReward = require("../modules/getGoldenDuckReward");
const claimGoldenDuck = require("../modules/claimGoldenDuck");
const addLog = require("../modules/addLog");
const Timer = require("easytimer.js").Timer;
const randomUseragent = require("random-useragent");
const goldenDuckRewardText = require("../modules/goldenDuckRewardText");
const getBalance = require("../modules/getBalance");
const randomSleep = require("../modules/randomSleep");

const ua = randomUseragent.getRandom((ua) => {
  return ua.browserName === "Chrome";
});
// console.log(ua);

const ERROR_MESSAGE = "CHỤP MÀN HÌNH VÀ TẠO ISSUE ĐỂ TUI TÌM CÁCH FIX"; 

let run = false;
let timerInstance = new Timer();
let accessToken = null;
let timeToGoldenDuck = 0;
let eggs = 0;
let pets = 0;
let goldenDuck = 0;
let myInterval = null;
let wallets = null;
let balanceEgg = 0;
let balancePet = 0;

async function collectGoldenDuckInternal(token) {
  if (timeToGoldenDuck <= 0) {
    const collectGoldenDuckInternalData = await getGoldenDuckInfo(
      accessToken,
      ua
    );

    if (collectGoldenDuckInternalData.error_code !== "") {
      console.log(
        "collectGoldenDuckInternalData error",
        collectGoldenDuckInternalData.error_code
      );
      console.log(ERROR_MESSAGE);
    } else {
      if (collectGoldenDuckInternalData.data.time_to_golden_duck === 0) {
        clearInterval(myInterval);

        console.log("[ GOLDEN DUCK 🐥 ] : ZIT ZANG xuat hien");
        const getGoldenDuckRewardData = await getGoldenDuckReward(
          accessToken,
          ua
        );

        const { data } = getGoldenDuckRewardData;
        if (data.type === 0) {
          msg = "Chuc ban may man lan sau";
          console.log(`[ GOLDEN DUCK 🐥 ] : ${msg}`);
          addLog(msg, "golden");
        } else if (data.type === 1 || data.type === 4) {
          msg = `${goldenDuckRewardText(data)} > SKIP`;
          console.log(`[ GOLDEN DUCK 🐥 ] : ${msg}`);
          addLog(msg, "golden");
        } else {
          const claimGoldenDuckData = await claimGoldenDuck(
            accessToken,
            ua,
            data
          );

          goldenDuck++;

          if (data.type === 2) {
            pets += Number(data.amount);
            balancePet += Number(data.amount);
          }
          if (data.type === 3) {
            eggs += Number(data.amount);
            balanceEgg += Number(data.amount);
          }

          msg = goldenDuckRewardText(data);
          console.log(`[ GOLDEN DUCK 🐥 ] : ${msg}`);
          addLog(`${goldenDuckRewardText(data)}`, "golden");
        }

        await randomSleep();
        collectGoldenDuck(token);
      } else {
        timeToGoldenDuck =
          collectGoldenDuckInternalData.data.time_to_golden_duck;

        myInterval = setInterval(() => {
          timeToGoldenDuck--;
          checkTimeToGoldenDuck(token);
        }, 1e3);
      }
    }
  }
}

function checkTimeToGoldenDuck(token) {
  console.clear();

  if (timeToGoldenDuck <= 0) {
    clearInterval(myInterval);
    myInterval = null;
    collectGoldenDuckInternal(token);
  } else {
    collectGoldenDuck(token);
  }
}

async function collectGoldenDuck(token) {
  accessToken = token;

  if (!run) {
    wallets = await getBalance(accessToken, ua);
    wallets.forEach((w) => {
      if (w.symbol === "EGG") balanceEgg = Number(w.balance);
      if (w.symbol === "PET") balancePet = Number(w.balance);
    });
    timerInstance.start();
    run = true;
  }

  console.log("[ ONLY GOLDEN DUCK MODE ]");
  console.log();
  console.log("Link Tool : [ j2c.cc/quack-quack-v2 ]");
  console.log("PASS MỞ LIÊN KẾT : [ J2TEAM ]");
  console.log(
    `BẠN ĐANG CÓ : [ ${balanceEgg.toFixed(2)} EGG 🥚 ] [ ${balancePet.toFixed(
      2
    )} PET 🐸 ]`
  );
  console.log();
  console.log(
    `Thời Gian Chạy : [ ${timerInstance
      .getTimeValues()
      .toString(["days", "hours", "minutes", "seconds"])} ]`
  );
  console.log(
    `Tổng Thu Hoạch : [ ${eggs.toFixed(2)} EGG 🥚 ] [ ${pets.toFixed(
      2
    )} PET 🐸 ]`
  );
  console.log();

  msg = `[ GOLDEN DUCK 🐥 ] : [ ${goldenDuck} | ${timeToGoldenDuck}s nua gap ]`;
  console.log(msg);

  collectGoldenDuckInternal(token);
}

module.exports = collectGoldenDuck;
