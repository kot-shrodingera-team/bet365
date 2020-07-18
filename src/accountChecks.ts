import { getElement } from '@kot-shrodingera-team/config/util';
import { myBetsFilterButtonsSelector, betslipAlertMessage } from './selectors';

export const checkCashOutEnabled = async (timeout = 1000): Promise<number> => {
  window.location.href = `${window.location.origin}/#/MB/`;
  await getElement(myBetsFilterButtonsSelector, timeout);
  const myBetsFilterButtons = [
    ...document.querySelectorAll(myBetsFilterButtonsSelector),
  ];
  if (myBetsFilterButtons.length === 0) {
    worker.Helper.WriteLine('Не найдены кнопки фильтров истории ставок');
    return 0;
  }
  console.log(myBetsFilterButtons);
  const cashOutFilterButton = myBetsFilterButtons.find(
    (button) => button.textContent === 'Cash Out'
  );
  if (!cashOutFilterButton) {
    worker.Helper.WriteLine('Не найдена кнопка фильтра Cash Out');
    return 0;
  }
  const cashOutEnabled = ![...cashOutFilterButton.classList].includes('Hidden');
  window.location.href = `${window.location.origin}/#/IP/`;
  return cashOutEnabled ? 1 : -1;
};

export const checkRestriction = (): boolean => {
  const betErrorMessageElement = document.querySelector(betslipAlertMessage);
  if (betErrorMessageElement) {
    const betErrorMessage = betErrorMessageElement.textContent.trim();
    const restrictedAccountMessage =
      'Certain restrictions may be applied to your account. ' +
      'If you have an account balance you can request to withdraw these funds now by going to the Withdrawal page in Members.';
    if (betErrorMessage === restrictedAccountMessage) {
      return true;
    }
  }
  return false;
};

export const accountBlocked = (): void => {
  if (worker.SetSessionData) {
    worker.SetSessionData('Bet365 Blocked', '1');
  }
  const message =
    worker.SetBookmakerPaused && worker.SetBookmakerPaused(true)
      ? 'Аккаунт Bet365 заблокирован! Bet365 поставлен на паузу'
      : 'Аккаунт Bet365 заблокирован! Bet365 НЕ поставлен на паузу. Поставьте на паузу вручную';
  worker.Helper.WriteLine(message);
  worker.Helper.SendInformedMessage(message);
};

export const accountLimited = (): void => {
  worker.Helper.WriteLine('Порезанный аккаунт (отсутствует Cash Out)');
  if (
    !worker.GetSessionData ||
    worker.GetSessionData('Bet365 LimitedAccountInformed') !== '1'
  ) {
    const limitedAccountMessage =
      'В Bet365 порезанный аккаунт (отсутствует Cash Out)';
    worker.Helper.SendInformedMessage(limitedAccountMessage);
    if (worker.GetSessionData) {
      worker.SetSessionData('Bet365 LimitedAccountInformed', '1');
    }
  }
  if (worker.PauseOnLimitedAccount) {
    if (worker.SetBookmakerPaused && worker.SetBookmakerPaused(true)) {
      const pauseMessage = 'Bet365 поставлен на паузу';
      worker.Helper.WriteLine(pauseMessage);
      worker.Helper.SendInformedMessage(pauseMessage);
    }
    if (worker.IsShowStake) {
      worker.JSFail();
    }
  }
};
