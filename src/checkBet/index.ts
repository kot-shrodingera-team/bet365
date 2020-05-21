import {
  betslipBetDescriptionSelector,
  betslipBetHandicapSelector,
  betslipBetDetailsSelector,
} from '../selectors';
import { getCurrentEventName } from '../openEvent';
import getCheckMarket from './checkMarket';
import getCheckOdd from './checkOdd';

type checkBetObject = { parameter: number; correctness: boolean };

const checkBet = (log = false): checkBetObject => {
  const badBet = (): checkBetObject => ({
    parameter: null as number,
    correctness: false,
  });
  const goodBet = (parameter = -6666): checkBetObject => ({
    parameter,
    correctness: true,
  });

  const betslipBetDescriptionElement = document.querySelector(
    betslipBetDescriptionSelector
  );
  if (!betslipBetDescriptionElement) {
    worker.Helper.WriteLine(
      'Ошибка проверки росписи купона: Не найдена роспись'
    );
    return badBet();
  }
  const betslipBetDetailsElement = document.querySelector(
    betslipBetDetailsSelector
  );
  if (!betslipBetDetailsElement) {
    worker.Helper.WriteLine(
      'Ошибка проверки росписи купона: Не найдена вторая роспись'
    );
    return badBet();
  }
  let betslipBetDescription = betslipBetDescriptionElement.textContent.trim();

  // Бывало, что параметр гандикапа указывался сразу после ставки, без пробела
  // Это нужно нормализировать
  const betslipBetHandicapElement = document.querySelector(
    betslipBetHandicapSelector
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

  if (log) {
    worker.Helper.WriteLine(`Событие '${eventName}'`);
    worker.Helper.WriteLine(`Маркет '${betslipBetDetails}'`);
    worker.Helper.WriteLine(`Ставка '${betslipBetDescription}'`);
    worker.Helper.WriteLine(`Роспись в боте '${worker.BetName}'`);
    const {
      market,
      odd,
      param,
      period,
      subperiod,
      overtimeType,
    } = worker.GetSessionData('dev')
      ? (JSON.parse(worker.GetSessionData('ForkObj')) as WorkerBetObject)
      : (JSON.parse(worker.ForkObj) as WorkerBetObject);
    worker.Helper.WriteLine(
      `market: ${market}, odd: ${odd}, param: ${param}, period: ${period}, subperiod: ${subperiod}, overtimeType: ${overtimeType}`
    );
  }

  const checkMarket = getCheckMarket(betslipBetDetails);
  if (checkMarket.error) {
    worker.Helper.WriteLine(checkMarket.errorMessage);
    return badBet();
  }
  const checkOdd = getCheckOdd(betslipBetDetails, betslipBetDescription);
  if (checkOdd.error) {
    worker.Helper.WriteLine(checkOdd.errorMessage);
    return badBet();
  }
  return goodBet(checkOdd.parameter);
};

export default checkBet;
