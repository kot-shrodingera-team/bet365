import {
  checkBookerHost,
  getWorkerParameter,
  log,
} from '@kot-shrodingera-team/germes-utils';
import {
  NewUrlError,
  JsFailError,
} from '@kot-shrodingera-team/germes-utils/errors';

const preOpenEvent = async (): Promise<void> => {
  if (worker.GetSessionData('Bet365.AccountRestricted') === '1') {
    const message = worker.SetBookmakerPaused(true)
      ? 'Аккаунт Bet365 заблокирован! Bet365 поставлен на паузу'
      : 'Аккаунт Bet365 заблокирован! Bet365 НЕ поставлен на паузу. Поставьте на паузу вручную';
    worker.Helper.SendInformedMessage(message);
    throw new JsFailError(message);
  }

  if (!checkBookerHost()) {
    log('Открыта не страница конторы (или зеркала)', 'crimson');
    window.location.href = new URL(worker.BookmakerMainUrl).href;
    throw new NewUrlError('Открываем страницу БК');
  }

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

  if (getWorkerParameter('reloadBeforeOpenBet')) {
    if (localStorage.getItem('reloadedBeforeOpenBet') === '0') {
      localStorage.setItem('reloadedBeforeOpenBet', '1');
      window.location.reload();
      throw new NewUrlError('Перезагружаем страницу перед открытием ставки');
    }
  }
};

export default preOpenEvent;
