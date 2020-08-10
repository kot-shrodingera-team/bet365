import WorkerBetObject from '@kot-shrodingera-team/worker-declaration/workerBetObject';
import { log } from '@kot-shrodingera-team/germes-utils';
import getCheckMarket from './checkMarket';
import getCheckOdd from './checkOdd';
import getCurrentEventName from './getCurrentEventName';

type CheckBetObject = { parameter: number; correctness: boolean };

const checkBet = (logResult = false): CheckBetObject => {
  const badBet = (): CheckBetObject => ({
    parameter: -9999,
    correctness: false,
  });
  const goodBet = (parameter = -6666): CheckBetObject => ({
    parameter,
    correctness: true,
  });

  const betslipBetDescriptionElement = document.querySelector(
    '.bss-NormalBetItem_Title'
  );
  if (!betslipBetDescriptionElement) {
    log('Ошибка проверки росписи купона: не найдена роспись', 'crimson');
    return badBet();
  }
  const betslipBetDetailsElement = document.querySelector(
    '.bss-NormalBetItem_Market'
  );
  if (!betslipBetDetailsElement) {
    log('Ошибка проверки росписи купона: не найдена вторая роспись', 'crimson');
    return badBet();
  }
  let betslipBetDescription = betslipBetDescriptionElement.textContent.trim();

  // Бывало, что параметр гандикапа указывался сразу после ставки, без пробела
  // Это нужно нормализировать
  const betslipBetHandicapElement = document.querySelector(
    '.bss-NormalBetItem_Handicap'
  );
  if (betslipBetHandicapElement) {
    const betslipBetHandicap = betslipBetHandicapElement.textContent.trim();
    if (
      betslipBetHandicap &&
      betslipBetDescription.endsWith(betslipBetHandicap) &&
      !betslipBetDescription.endsWith(` ${betslipBetHandicap}`)
    ) {
      betslipBetDescription = betslipBetDescription.replace(
        betslipBetHandicap,
        ` ${betslipBetHandicap}`
      );
    }
  }

  const betslipBetDetails = betslipBetDetailsElement.textContent.trim();

  const eventName = getCurrentEventName();

  if (logResult) {
    const { market, odd, param, period, subperiod, overtimeType } = JSON.parse(
      worker.ForkObj
    ) as WorkerBetObject;
    const message =
      `Событие: "${eventName}"\n` +
      `Маркет: "${betslipBetDetails}"\n` +
      `Ставка: "${betslipBetDescription}"\n` +
      `Роспись в боте: "${worker.BetName.trim()}"\n` +
      `market: ${market}, odd: ${odd}, param: ${param}, period: ${period}, subperiod: ${subperiod}, overtimeType: ${overtimeType}`;
    log(message, 'lightgrey');
  }

  const checkMarket = getCheckMarket(betslipBetDetails);
  if (checkMarket.error) {
    log(checkMarket.errorMessage, 'crimson');
    return badBet();
  }
  const checkOdd = getCheckOdd(betslipBetDetails, betslipBetDescription);
  if (checkOdd.error) {
    log(checkOdd.errorMessage, 'crimson');
    return badBet();
  }
  return goodBet(checkOdd.parameter);
};

export default checkBet;
