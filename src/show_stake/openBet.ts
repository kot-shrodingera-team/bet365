import {
  getElement,
  log,
  repeatingOpenBet,
} from '@kot-shrodingera-team/germes-utils';
import { JsFailError } from '@kot-shrodingera-team/germes-utils/errors';
import getStakeCount from '../stake_info/getStakeCount';
import clearCoupon from './clearCoupon';
import changeToStandardBetslip from './helpers/changeToStandardBetslip';

const openBet = async (): Promise<void> => {
  const couponCleared = await clearCoupon();
  if (!couponCleared) {
    throw new JsFailError('Не удалось очистить купон');
  }

  // Получение данных из меты
  const { betId, fi, od, zw } = (() => {
    if (worker.BetId.startsWith('{')) {
      return JSON.parse(worker.BetId);
    }
    const rawBetData = worker.BetId.split('_');
    if (rawBetData.length < 5) {
      throw new JsFailError(
        'Некорректный формат данных о ставке. Сообщите в ТП'
      );
    }
    const betData = rawBetData
      .slice(0, 4)
      .concat(rawBetData.slice(4).join('_'));
    return {
      betId: betData[0],
      fi: betData[1],
      od: betData[2],
      zw: betData[3],
    };
  })();

  const ConstructString = `pt=N#o=${od}#f=${fi}#fp=${betId}#so=#c=1#mt=1#id=${zw}Y#|TP=BS${zw}#`;
  const Uid = '';
  // const pom = '1';
  const partType = 'N';
  const getSportType = (): string => partType;
  const getCastCode = (): string => '';
  const key = (): string => zw;
  const bet = {
    // pom,
    ConstructString,
    Uid,
  };

  // Открытие ставки, проверка, что ставка попала в купон
  const openingAction = async () => {
    Locator.betSlipManager.addBet({
      item: bet,
      action: 0,
      partType,
      constructString: ConstructString,
      key,
      getSportType,
      getCastCode,
    });
  };
  await repeatingOpenBet(openingAction, getStakeCount, 5, 1000, 50);

  const quickBetslipSelector = '.bss-BetslipStandardModule_QuickBetExpanded';
  const eventNameSelector = '.bss-NormalBetItem_FixtureDescription';
  const marketNameSelector = '.bss-NormalBetItem_Market';
  const betNameSelector = '.bss-NormalBetItem_Title ';

  await Promise.race([
    getElement(eventNameSelector),
    getElement(quickBetslipSelector),
  ]);
  const qbsStakeInput = document.querySelector(quickBetslipSelector);
  if (qbsStakeInput) {
    log('Мобильный купон. Переключаем на стандартный', 'orange');
    const changed = await changeToStandardBetslip();
    if (!changed) {
      throw new JsFailError('Не удалось переключится на стандартный купон');
    }
    await getElement(eventNameSelector);
  }

  const eventNameElement = document.querySelector(eventNameSelector);
  if (!eventNameElement) {
    throw new JsFailError('Не найдено событие открытой ставки');
  }
  const marketNameElement = document.querySelector(marketNameSelector);
  if (!marketNameElement) {
    throw new JsFailError('Не найден маркет открытой ставки');
  }
  const betNameElement = document.querySelector(betNameSelector);
  if (!betNameElement) {
    throw new JsFailError('Не найдена роспись открытой ставки');
  }

  const eventName = eventNameElement.textContent.trim();
  const marketName = marketNameElement.textContent.trim();

  // Если есть параметр, нужно его дождаться
  const { param } = JSON.parse(worker.ForkObj);
  if (param) {
    if (!/^(Draw No Bet)$/i.test(marketName)) {
      log(
        'Ставка с параметром, ожидаем появления параметра в купоне',
        'steelblue'
      );
      // const parameterLoaded = await awaiter(
      //   () => getParameter() !== -6666 && getParameter() !== -9999,
      //   5000,
      //   50
      // );
      const parameterLoaded = await getElement('.bss-NormalBetItem_Handicap');
      if (!parameterLoaded) {
        throw new JsFailError('Не дождались появления параметра');
      }
    }
  }

  const betName = betNameElement.textContent.trim();

  log(`Открыта ставка\n${eventName}\n${marketName}\n${betName}`, 'steelblue');
};

export default openBet;
