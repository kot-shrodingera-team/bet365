import {
  awaiter,
  checkBookerHost,
  checkCurrency,
  getWorkerParameter,
  log,
} from '@kot-shrodingera-team/germes-utils';
import {
  NewUrlError,
  JsFailError,
} from '@kot-shrodingera-team/germes-utils/errors';
import checkAuth, { authStateReady } from '../stake_info/checkAuth';
import { balanceReady, updateBalance } from '../stake_info/getBalance';
import { accountLimited, checkAccountLimited } from '../helpers/accountChecks';
// import checkCurrentLanguage from '../helpers/checkCurrentLanguage';
import getSiteCurrency from '../helpers/getSiteCurrency';

const preOpenEvent = async (): Promise<void> => {
  /* ======================================================================== */
  /*                    Пауза, если заблокированный аккаунт                   */
  /* ======================================================================== */

  if (worker.GetSessionData('Bet365.AccountRestricted') === '1') {
    const message = worker.SetBookmakerPaused(true)
      ? 'Аккаунт Bet365 заблокирован! Bet365 поставлен на паузу'
      : 'Аккаунт Bet365 заблокирован! Bet365 НЕ поставлен на паузу. Поставьте на паузу вручную';
    worker.Helper.SendInformedMessage(message);
    throw new JsFailError(message);
  }

  /* ======================================================================== */
  /*               Перезагрузка страницы перед открытием ставки               */
  /* ======================================================================== */

  if (getWorkerParameter('reloadBeforeOpenBet')) {
    if (localStorage.getItem('reloadedBeforeOpenBet') === '0') {
      localStorage.setItem('reloadedBeforeOpenBet', '1');
      window.location.reload();
      throw new NewUrlError('Перезагружаем страницу перед открытием ставки');
    }
  }

  /* ======================================================================== */
  /*                         Закрытие всплывающих окон                        */
  /* ======================================================================== */

  const closeButton = document.querySelector<HTMLElement>(
    '.pm-PushTargetedMessageOverlay_CloseButton'
  );
  if (closeButton) {
    closeButton.click();
  }

  const remainLoggedInButton = document.querySelector<HTMLElement>(
    '.alm-ActivityLimitAlert_Button'
  );
  if (remainLoggedInButton) {
    log('Нажимаем кнопку "Remain Logged In"', 'orange');
    remainLoggedInButton.click();
  }

  const lastLoginButton = document.querySelector<HTMLElement>(
    '.llm-LastLoginModule_Button'
  );
  if (lastLoginButton) {
    log('Нажимаем кнопку "Continue" Last Login', 'orange');
    lastLoginButton.click();
  }

  const pushBetDialogOkButton = document.querySelector<HTMLElement>(
    '.bil-BetslipPushBetDialog_OkayButton'
  );
  if (pushBetDialogOkButton) {
    log('Нажимаем кнопку "OK" PushBetDialog', 'orange');
    pushBetDialogOkButton.click();
  }

  /* ======================================================================== */
  /*                     Проверка адреса открытой страницы                    */
  /* ======================================================================== */

  if (!checkBookerHost()) {
    log('Открыта не страница конторы (или зеркала)', 'crimson');
    log(`${window.location.host} !== ${worker.BookmakerMainUrl}`, 'crimson');
    window.location.href = new URL(worker.BookmakerMainUrl).href;
    throw new NewUrlError('Открываем страницу БК');
  }

  /* ======================================================================== */
  /*                 Проверка авторизации и обновление баланса                */
  /* ======================================================================== */

  await authStateReady();
  worker.Islogin = checkAuth();
  worker.JSLogined();
  if (!worker.Islogin) {
    throw new JsFailError('Нет авторизации');
  }
  log('Есть авторизация', 'steelblue');
  await balanceReady();
  updateBalance();

  /* ======================================================================== */
  /*                              Проверка валюты                             */
  /* ======================================================================== */

  const siteCurrency = getSiteCurrency();
  checkCurrency(siteCurrency);

  /* ======================================================================== */
  /*                           Проверка загрузки API                          */
  /* ======================================================================== */

  const locatorLoaded = await awaiter(
    () =>
      typeof BetSlipLocator !== 'undefined' &&
      typeof ns_favouriteslib_ui !== 'undefined',
    10000
  );
  if (!locatorLoaded) {
    window.location.href = new URL('/#/IP/', worker.BookmakerMainUrl).href;
    throw new NewUrlError('Страница не догрузилась. Перезагружаем');
  }

  /* ======================================================================== */
  /*                         Проверка языка и кэшаута                         */
  /* ======================================================================== */

  if (
    !getWorkerParameter('fakeAuth') &&
    !getWorkerParameter('disableAccountChecks')
  ) {
    // if (!getWorkerParameter('disableLanguageCheck')) {
    //   const currentLanguageCheck = await checkCurrentLanguage();
    //   if (currentLanguageCheck === 0) {
    //     throw new JsFailError('Проверка языка не прошла');
    //   }
    //   if (currentLanguageCheck === -1) {
    //     throw new NewUrlError('Переключаем язык на английский');
    //   }
    //   log('Проверка языка прошла', 'steelblue');
    // }

    if (!getWorkerParameter('disableCashOutCheck')) {
      const cashOutEnabled = await checkAccountLimited();
      if (cashOutEnabled === 0) {
        log('Не удалось определить порезку аккаунта', 'steelblue');
      } else if (cashOutEnabled === -1) {
        accountLimited();
        if (worker.PauseOnLimitedAccount) {
          throw new JsFailError();
        }
      }
    }
  }
};

export default preOpenEvent;
