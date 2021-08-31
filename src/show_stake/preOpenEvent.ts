import {
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
import getSiteCurrency from './helpers/getSiteCurrency';

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
  /*              Проверка валюты и зеркала цуписной версии сайта             */
  /* ======================================================================== */

  if (
    /^(www\.)?bet365.ru$/.test(window.location.hostname) &&
    worker.Currency !== 'RUR'
  ) {
    throw new JsFailError(
      `Открыта RU версия сайта, но валюта не рубли (${worker.Currency}). Поменяйте валюту в настройках БК`
    );
  }
  if (
    !/^(www\.)?bet365.ru$/.test(new URL(worker.BookmakerMainUrl).hostname) &&
    worker.Currency === 'RUR'
  ) {
    throw new JsFailError(
      'Валюта рубли, но зеркало не bet365.ru. Поменяйте зеркало в настройках БК'
    );
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

  const closeButton = document.querySelector<HTMLElement>(
    '.pm-PushTargetedMessageOverlay_CloseButton'
  );
  if (closeButton) {
    closeButton.click();
  }

  if (!checkBookerHost()) {
    log('Открыта не страница конторы (или зеркала)', 'crimson');
    window.location.href = new URL(worker.BookmakerMainUrl).href;
    throw new NewUrlError('Открываем страницу БК');
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

  const siteCurrency = getSiteCurrency();
  checkCurrency(siteCurrency);
};

export default preOpenEvent;
