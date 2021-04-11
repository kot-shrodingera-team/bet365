import {
  awaiter,
  checkBookerHost,
  getElement,
  getWorkerParameter,
  log,
} from '@kot-shrodingera-team/germes-utils';
import {
  JsFailError,
  NewUrlError,
} from '@kot-shrodingera-team/germes-utils/errors';
import { accountLimited, checkCashOutEnabled } from './helpers/accountChecks';
import checkAuth, { authStateReady } from '../stake_info/checkAuth';
import { balanceReady, updateBalance } from '../stake_info/getBalance';
import clearCoupon from './clearCoupon';
import checkCurrentLanguage from './helpers/checkCurrentLanguage';

const preCheck = async (): Promise<void> => {
  if (!checkBookerHost()) {
    log('Открыта не страница конторы (или зеркала)', 'crimson');
    window.location.href = new URL(worker.BookmakerMainUrl).href;
    throw new NewUrlError('Открываем страницу БК');
  }

  const locatorLoaded = await awaiter(
    () => typeof Locator !== 'undefined',
    10000
  );
  if (!locatorLoaded) {
    throw new JsFailError('API не загрузилось');
  }

  if (typeof ns_favouriteslib_ui === 'undefined') {
    window.location.href = new URL('/#/IP/', worker.BookmakerMainUrl).href;
    throw new NewUrlError('Страница не догрузилась. Перезагружаем');
  }

  await authStateReady();
  worker.Islogin = checkAuth();
  worker.JSLogined();
  if (!worker.Islogin) {
    throw new JsFailError('Нет авторизации');
  }
  log('Есть авторизация', 'steelblue');
  await balanceReady();
  updateBalance();

  if (
    !getWorkerParameter('fakeAuth') &&
    !getWorkerParameter('disableAccountChecks')
  ) {
    const currentLanguageCheck = await checkCurrentLanguage();
    if (currentLanguageCheck === 0) {
      throw new JsFailError('Проверка языка не прошла');
    }
    if (currentLanguageCheck === -1) {
      throw new NewUrlError('Переключаем язык на английский');
    }
    log('Проверка языка прошла', 'steelblue');

    const cashOutEnabled = await checkCashOutEnabled();
    if (cashOutEnabled === 0) {
      log('Не удалось определить порезку аккаунта', 'steelblue');
    } else if (cashOutEnabled === -1) {
      accountLimited();
      if (worker.PauseOnLimitedAccount) {
        throw new JsFailError();
      }
    }
  }

  if (!window.location.hash.startsWith('#/IP/')) {
    log('Открыт другой раздел Bet365. Переходим на In-Play', 'steelblue');
    window.location.hash = '#/IP/';
  }

  // const selectedSectionElement = document.querySelector(
  //   '.hm-HeaderMenuItem_LinkSelected'
  // );
  // if (!selectedSectionElement) {
  //   log('Не найден текущий раздел сайта. Возвращаемся на Bet365', 'steelblue');
  //   window.location.hash = '#/IP/';
  // }
  // const selectedSection = selectedSectionElement.textContent.trim();
  // if (selectedSection !== 'In-Play') {
  //   log('Открыт другой раздел Bet365. Переходим на In-Play', 'steelblue');
  //   window.location.hash = '#/IP/';
  // }

  const betslipModule = await getElement('.bsl-BetslipLoaderModule');
  if (!betslipModule) {
    throw new JsFailError('Не загрузился модуль купона');
  }

  // const remindLatterCode =
  //   `var remindLaterButton = document.querySelector('#remindLater');\n` +
  //   `if (remindLaterButton) {\n` +
  //   `  remindLatterButton.click();\n` +
  //   `}\n`;
  // worker.ExecuteCodeInAllFrames(remindLatterCode);

  // const freeBetMessageClose = document.querySelector<HTMLElement>(
  //   '.pm-FreeBetsPushGraphicOverlay_Close'
  // );
  // if (freeBetMessageClose) {
  //   log('Закрываем сообщение о фрибетах', 'orange');
  //   freeBetMessageClose.click();
  // }

  // Если осталось висеть Check My Bets в купоне
  // const closeBetslipButton = document.querySelector<HTMLElement>(
  //   '.bss-DefaultContent_Close'
  // );
  // if (closeBetslipButton) {
  //   log('Закрываем купон', 'orange);
  //   closeBetslipButton.click();
  // }

  const remainLoggedInButton = document.querySelector<HTMLElement>(
    '.alm-ActivityLimitAlert_Button'
  );
  if (remainLoggedInButton) {
    log('Нажимаем кнопку "Remain Logged In"', 'orange');
    remainLoggedInButton.click();
  }

  const couponCleared = await clearCoupon();
  if (!couponCleared) {
    throw new JsFailError('Не удалось очистить купон');
  }
};

export default preCheck;
