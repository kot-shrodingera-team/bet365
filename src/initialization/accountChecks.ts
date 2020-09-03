import { getElement, log } from '@kot-shrodingera-team/germes-utils';

export const checkCashOutEnabled = async (timeout = 5000): Promise<number> => {
  window.location.href = new URL('/#/MB/', window.location.origin).href;
  await getElement('.myb-MyBetsHeader_Button', timeout);
  const myBetsFilterButtons = [
    ...document.querySelectorAll('.myb-MyBetsHeader_Button'),
  ];
  if (myBetsFilterButtons.length === 0) {
    log(
      'Ошибка проверки порезки аккаунта: не найдены кнопки фильтров истории ставок',
      'crimson'
    );
    window.location.href = new URL('/#/IP/', window.location.origin).href;
    return 0;
  }
  const cashOutFilterButton = myBetsFilterButtons.find(
    (button) => button.textContent === 'Cash Out'
  );
  if (!cashOutFilterButton) {
    log(
      'Ошибка проверки порезки аккаунта: не найдена кнопка фильтра Cash Out',
      'crimson'
    );
    window.location.href = new URL('/#/IP/', window.location.origin).href;
    return 0;
  }
  const cashOutEnabled = ![...cashOutFilterButton.classList].includes('Hidden');
  window.location.href = new URL('/#/IP/', window.location.origin).href;
  return cashOutEnabled ? 1 : -1;
};

export const checkRestriction = (): boolean => {
  const betErrorMessageElement = document.querySelector(
    '.bss-Footer_MessageBody'
  );
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
  log(message, 'red');
  worker.Helper.SendInformedMessage(message);
};

export const accountLimited = (): void => {
  const message = (() => {
    let text = 'В Bet365 порезанный аккаунт (отсутствует Cash Out)';
    if (worker.PauseOnLimitedAccount) {
      text += '. В настройках включена опция паузы при порезанном аккаунте';
      if (worker.SetBookmakerPaused && worker.SetBookmakerPaused(true)) {
        text += '. БК успешно поставлена на паузу';
      } else {
        text +=
          '. Не удалось поставить БК на паузу. Поставьте на паузу вручную';
      }
    } else {
      text +=
        '. В настройках отключена опция паузы при порезанном аккаунте. БК продолжает работу';
    }
    return text;
  })();
  if (
    worker.GetSessionData &&
    worker.GetSessionData('Bet365 LimitedAccountInformed') !== '1'
  ) {
    worker.Helper.SendInformedMessage(message);
    worker.SetSessionData('Bet365 LimitedAccountInformed', '1');
    log(message, 'crimson');
  } else {
    log(message, 'orange');
  }
};
