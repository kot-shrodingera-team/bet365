import { getElement, awaiter } from '@kot-shrodingera-team/config/util';
import {
  remainLoginnedSelector,
  freeBetMessageCloseSelector,
  inPlayControlBarSelector,
  inPlayControlBarSelectedItemSelector,
  betslipSpinnerSelector,
  betslipCloseButtonSelector,
} from './selectors';
import checkCurrentLanguage from './checkCurrentLanguage';
import { checkCashOutEnabled, accountLimited } from './accountChecks';
import openEvent from './openEvent';
import findBet from './findBet';
import killEventListener from './killEventListener';
import checkBet from './checkBet';
import { checkLogin, updateBalance, getStakeCount } from './getInfo';

let reloadCount = 0;

export const clearReloadCount = (): void => {
  reloadCount = 0;
};

const showStake = async (): Promise<void> => {
  console.log('showStake()');
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

  await checkCurrentLanguage();
  // if (!(await checkCurrentLanguage())) {
  //   worker.JSFail();
  // }

  const cashOutEnabled = await checkCashOutEnabled();
  if (cashOutEnabled === 0) {
    worker.Helper.WriteLine('Не удалось определить порезку аккаунта');
  } else if (cashOutEnabled === -1) {
    accountLimited();
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
    window.location.href = `${window.location.origin}/#/IP/`;
  }
  const controlBarSelectedItem = document.querySelector(
    inPlayControlBarSelectedItemSelector
  );
  if (!controlBarSelectedItem) {
    worker.Helper.WriteLine(
      'Ошибка открытия купона: Не найден текущий элемент Control Bar'
    );
    worker.JSFail();
    return;
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
  }

  // Ищем нужное событие
  if (!(await openEvent())) {
    worker.JSFail();
    return;
  }

  // ///////////// Поиск исхода

  // if (!checkCurrentEvent()) {
  //     worker.Helper.WriteLine('Ошибка открытия купона: Заголовок открытого события не подходит');
  //     worker.JSFail();
  //     return;
  // }

  // await awaiter(() => bsFrame && bsFrame.bsApp);

  // if (!bsFrame.bsApp) {
  //     worker.Helper.WriteLine('Ошибка открытия купона: Не иницализирован интерфейс купона');
  //     worker.JSFail();
  //     return;
  // }
  if (document.querySelector(betslipSpinnerSelector)) {
    reloadCount += 1;
    if (reloadCount > 3) {
      worker.JSFail();
      worker.Helper.WriteLine(
        'Ошибка открытия купона: Купон в состоянии принятия ставки'
      );
      return;
    }
    worker.Helper.WriteLine(
      'Ошибка открытия купона: Купон в состоянии принятия ставки'
    );
    worker.Helper.LoadUrl(`${worker.EventUrl}#/IP/`);
    return;
  }

  const betslipCloseButton = document.querySelector(
    betslipCloseButtonSelector
  ) as HTMLElement;
  if (betslipCloseButton) {
    betslipCloseButton.click();
  }

  const participant = findBet();
  if (!participant) {
    worker.Helper.WriteLine('Ошибка открытия купона: Исход не найден');
    worker.JSFail();
    return;
  }

  worker.Helper.WriteLine('Исход найден');
  console.log(participant);
  participant.style.border = '1px solid red';
  // Скроллит и шапку сайта
  // participant.scrollIntoView();
  // eslint-disable-next-line no-underscore-dangle
  if (participant.wrapper._suspended) {
    worker.Helper.WriteLine('Исход Suspended');
    worker.JSFail();
    return;
  }

  // let betIitem = participant.wrapper.getBetItem();
  // let bet = {
  //     ConstructString: betIitem.constructString,
  //     Uid: betIitem.uid
  // };
  // bsFrame.bsApp.addBet(bet);

  killEventListener('touchstart');
  participant.click();
  // Можно добавить проверку по id
  const betAdded = await awaiter(() => getStakeCount() === 1);
  worker.Helper.WriteLine(`Количество ставок в купоне: ${getStakeCount()}`);
  if (betAdded) {
    worker.Helper.WriteLine('Купон открыт');
    if (!checkBet(true).correctness) {
      worker.Helper.WriteLine('Ставка не соответствует росписи');
      worker.JSFail();
      return;
    }
    worker.JSStop();
  } else {
    worker.Helper.WriteLine(
      'Ошибка открытия купона: Ставка так и не попала в купон'
    );
    worker.JSFail();
  }
};

export default showStake;
