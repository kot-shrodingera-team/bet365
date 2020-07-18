import { getElement, awaiter } from '@kot-shrodingera-team/config/util';
import {
  remainLoginnedSelector,
  freeBetMessageCloseSelector,
  inPlayControlBarSelector,
} from '../selectors';
import checkLogin from '../stakeInfo/checkLogin';
import updateBalance from '../stakeInfo/updateBalance';
import { checkCashOutEnabled, accountLimited } from '../accountChecks';
import getStakeCount from '../stakeInfo/getStakeCount';
import checkBet from '../checkBet';
import getCurrentEventName from '../checkBet/getCurrentEventName';
import checkUrl from '../checkUrl';
import changeToStandardBetslip from './changeToStandardBetslip';

let reloadCount = 0;
let cashOutChecked = false;

export const clearReloadCount = (): void => {
  reloadCount = 0;
};

export const clearCashoutChecked = (): void => {
  cashOutChecked = false;
};

const showStake = async (): Promise<void> => {
  if (!checkUrl()) {
    worker.Helper.WriteLine('Открыт не сайт Bet365 или указанное зеркало');
    worker.JSFail();
    return;
  }
  if (
    worker.GetSessionData &&
    worker.GetSessionData('Bet365 Blocked') === '1'
  ) {
    if (worker.SetBookmakerPaused && worker.SetBookmakerPaused(true)) {
      const pauseMessage = 'Bet365 поставлен на паузу';
      worker.Helper.WriteLine(pauseMessage);
      worker.Helper.SendInformedMessage(pauseMessage);
    }
    worker.Helper.WriteLine('Аккаунт заблокирован');
    worker.JSFail();
    return;
  }

  const locatorLoaded = await awaiter(
    () => typeof Locator !== 'undefined',
    10000
  );
  if (!locatorLoaded) {
    worker.Helper.WriteLine('API не загрузилось');
    worker.JSFail();
    return;
  }

  const remindLatterCode =
    `var remindLaterButton = document.querySelector('#remindLater');\n` +
    `if (remindLaterButton) {\n` +
    `  remindLatterButton.click();\n` +
    `}\n`;
  worker.ExecuteCodeInAllFrames(remindLatterCode);

  const remainLoginned = document.querySelector(
    remainLoginnedSelector
  ) as HTMLElement;
  if (remainLoginned) {
    worker.Helper.WriteLine('Нажимаем кнопку "Оставаться в системе"');
    remainLoginned.click();
  }

  const freeBetMessageClose = document.querySelector(
    freeBetMessageCloseSelector
  ) as HTMLElement;
  if (freeBetMessageClose) {
    freeBetMessageClose.click();
  }

  worker.Islogin = checkLogin();
  worker.JSLogined();
  if (!worker.Islogin) {
    worker.Helper.WriteLine('Ошибка открытия купона: Нет авторизации');
    worker.JSFail();
    return;
  }
  updateBalance();

  // await checkCurrentLanguage();
  // if (!(await checkCurrentLanguage())) {
  //   worker.JSFail();
  // }

  if (!cashOutChecked) {
    const cashOutEnabled = await checkCashOutEnabled();
    if (cashOutEnabled === 0) {
      worker.Helper.WriteLine('Не удалось определить порезку аккаунта');
    } else if (cashOutEnabled === -1) {
      accountLimited();
    }
    cashOutChecked = true;
  }

  const controlBar = await getElement(inPlayControlBarSelector);
  if (!controlBar) {
    worker.Helper.WriteLine('Ошибка открытия купона: Не найден Control Bar');
    worker.JSFail();
    return;
  }
  // eslint-disable-next-line @typescript-eslint/camelcase, camelcase
  if (typeof ns_favouriteslib_ui === 'undefined') {
    console.log('ns_favouriteslib_ui is undefined');
    worker.Helper.WriteLine(
      'Ошибка открытия купона: страница не догрузилась, перезагружаем'
    );
    reloadCount += 1;
    if (reloadCount > 5) {
      worker.JSFail();
      return;
    }
    window.location.href = `${worker.BookmakerMainUrl}/#/IP/`;
  }

  // Если осталось висеть Check My Bets в купоне
  const closeBetslipButton = document.querySelector(
    '.bss-DefaultContent_Close'
  ) as HTMLElement;
  if (closeBetslipButton) {
    worker.Helper.WriteLine('Закрываем купон');
    closeBetslipButton.click();
  }
  const stakeCount = getStakeCount();
  if (stakeCount === 0) {
    worker.Helper.WriteLine('Купон пуст');
  } else {
    worker.Helper.WriteLine(`Купон не пуст (ставок в купоне: ${stakeCount})`);
    if (
      !Locator ||
      !Locator.betSlipManager ||
      !Locator.betSlipManager.deleteAllBets
    ) {
      worker.Helper.WriteLine(
        'Ошибка открытия купона: Функция очистки купона недоступна'
      );
      worker.JSFail();
      return;
    }
    Locator.betSlipManager.deleteAllBets();
    const betslipCleared = await awaiter(() => getStakeCount() === 0);
    if (!betslipCleared) {
      worker.Helper.WriteLine(
        'Ошибка открытия купона: Не удалось очистить купон'
      );
      worker.JSFail();
      worker.Helper.LoadUrl(`${window.location.origin}/#/IP/`);
      return;
    }
    worker.Helper.WriteLine('Купон успешно очищен');
  }

  const rawBetData = worker.BetId.split('_');
  if (rawBetData.length < 5) {
    worker.Helper.WriteLine(
      'Некорректный формат данных о ставке. Сообщите в ТП'
    );
    worker.JSFail();
    return;
  }
  const betData = rawBetData.slice(0, 4).concat(rawBetData.slice(4).join('_'));
  const [betId, fi, od, zw /* , betName */] = betData;

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

  Locator.betSlipManager.addBet({
    item: bet,
    action: 0,
    partType,
    constructString: ConstructString,
    key,
    getSportType,
    getCastCode,
  });

  console.log(bet);

  const betAdded = await awaiter(() => getStakeCount() === 1);
  worker.Helper.WriteLine(`Количество ставок в купоне: ${getStakeCount()}`);
  if (betAdded) {
    worker.Helper.WriteLine('Купон открыт');
    await Promise.race([
      awaiter(() => getCurrentEventName() !== null),
      getElement('.qbs-StakeBox_StakeInput'),
    ]);
    const qbsStakeInput = document.querySelector('.qbs-StakeBox_StakeInput');
    if (qbsStakeInput) {
      worker.Helper.WriteLine('Мобильный купон. Переключаем на стандартный');
      if (!changeToStandardBetslip()) {
        worker.Helper.WriteLine('Не удалось переключится на стандартный купон');
        worker.JSFail();
        return;
      }
      await awaiter(() => getCurrentEventName() !== null);
    }
    if (getCurrentEventName() === null) {
      worker.Helper.WriteLine('Название события так и не повилось в купоне');
      worker.JSFail();
      return;
    }
    // Если есть параметр, нужно его дождаться
    await getElement('.bss-NormalBetItem_Handicap', 100);
    if (!checkBet(true).correctness) {
      worker.Helper.WriteLine('Ставка не соответствует росписи');
      worker.JSFail();
      return;
    }
    worker.JSStop();
    // const eventUrl = worker.EventUrl;
    // const [eventId] = eventUrl.split('/').slice(-1);
    // window.location.href = `${window.location.origin}/#/IP/${eventId}`;
  } else {
    worker.Helper.WriteLine(
      'Ошибка открытия купона: Ставка так и не попала в купон'
    );
    worker.JSFail();
  }
};

export default showStake;
