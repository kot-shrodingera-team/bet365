import {
  // awaiter,
  getElement,
  getWorkerParameter,
  log,
  repeatingOpenBet,
  // sleep,
  text,
} from '@kot-shrodingera-team/germes-utils';
import { JsFailError } from '@kot-shrodingera-team/germes-utils/errors';
import getStakeCount from '../stake_info/getStakeCount';
import clearCoupon from './clearCoupon';
import changeToStandardBetslip from '../helpers/changeToStandardBetslip';

const openBet = async (): Promise<void> => {
  /* ======================================================================== */
  /*                              Очистка купона                              */
  /* ======================================================================== */

  const couponCleared = await clearCoupon();
  if (!couponCleared) {
    throw new JsFailError('Не удалось очистить купон');
  }

  /* ======================================================================== */
  /*                      Формирование данных для поиска                      */
  /* ======================================================================== */

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  /* ======================================================================== */
  /*                               Поиск ставки                               */
  /* ======================================================================== */

  // const checkedBets = <HTMLElement[]>[];
  // const bet = await awaiter(() => {
  //   const bets = [
  //     ...document.querySelectorAll<HTMLElement>('.gl-Participant_General'),
  //   ];
  //   return bets.find((_bet) => {
  //     if (checkedBets.includes(_bet)) {
  //       return null;
  //     }
  //     checkedBets.push(_bet);
  //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //     const testZW = (<any>_bet)?.wrapper?.twinEmphasizedHandlerType;
  //     return testZW === zw;
  //   });
  // });
  // if (!bet) {
  //   throw new JsFailError('Ставка не найдена');
  // }

  // if ([...bet.classList].some((className) => /_Suspended$/i.test(className))) {
  //   throw new JsFailError('Ставка недоступна');
  // }

  /* ======================================================================== */
  /*           Открытие ставки, проверка, что ставка попала в купон           */
  /* ======================================================================== */

  const openingAction = async () => {
    BetSlipLocator.betSlipManager.addBet({
      item: bet,
      action: 0,
      partType,
      constructString: ConstructString,
      key,
      getSportType,
      getCastCode,
    });
    // bet.click();
  };
  await repeatingOpenBet(openingAction, getStakeCount, 5, 1000, 50);

  /* ======================================================================== */
  /*         Проверка на всплывающее окно о целых параметрах в Италии         */
  /* ======================================================================== */

  const pushBetDialogCheckTimeout = getWorkerParameter(
    'pushBetDialogCheckTimeout',
    'number'
  ) as number;
  if (pushBetDialogCheckTimeout) {
    log('Ожидаем всплывающее окно о целых параметрах', 'white', true);
    const pushBetDialogOkButton = await getElement<HTMLElement>(
      '.bil-BetslipPushBetDialog_OkayButton',
      pushBetDialogCheckTimeout
    );
    if (pushBetDialogOkButton) {
      log('Нажимаем "OK" в окне о целых параметрах', 'orange');
      pushBetDialogOkButton.click();
    } else {
      log('Не было всплывающего окна о целых параметрах', 'steelblue');
    }
  }

  /* ======================================================================== */
  /*                      Переключение мобильного купона                      */
  /* ======================================================================== */

  const qbsBetTitleSelector = '.qbs-NormalBetItem_Title';
  const eventNameSelector = '.bss-NormalBetItem_FixtureDescription';

  await Promise.race([
    getElement(eventNameSelector),
    getElement(qbsBetTitleSelector),
  ]);
  const qbsBetTitle = document.querySelector(qbsBetTitleSelector);
  if (qbsBetTitle) {
    log('Мобильный купон. Переключаем на стандартный', 'orange');
    const changed = await changeToStandardBetslip();
    if (!changed) {
      throw new JsFailError('Не удалось переключится на стандартный купон');
    }
    await getElement(eventNameSelector);
  }

  /* ======================================================================== */
  /*                    Вывод информации об открытой ставке                   */
  /* ======================================================================== */

  const marketNameSelector = '.bss-NormalBetItem_Market';
  const betNameSelector = '.bss-NormalBetItem_Title';
  const betHandicapSelector = '.bss-NormalBetItem_Handicap';

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

  const eventName = text(eventNameElement);
  const marketName = text(marketNameElement);

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

  const betHandicapElement = document.querySelector(betHandicapSelector);
  const betHandicap = betHandicapElement ? text(betHandicapElement) : '';

  const betNameRaw = text(betNameElement);

  const betName = betHandicap
    ? betNameRaw.replace(betHandicap, ` ${betHandicap}`)
    : betNameRaw;

  log(`Открыта ставка\n${eventName}\n${marketName}\n${betName}`, 'steelblue');
};

export default openBet;
