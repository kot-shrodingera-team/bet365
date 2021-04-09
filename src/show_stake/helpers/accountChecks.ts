import { getElement, log } from '@kot-shrodingera-team/germes-utils';

export const checkCashOutEnabled = async (timeout = 5000): Promise<number> => {
  window.location.hash = '#/MB/';
  await getElement('.myb-MyBetsHeader_Button', timeout);
  const myBetsFilterButtons = [
    ...document.querySelectorAll('.myb-MyBetsHeader_Button'),
  ];
  if (myBetsFilterButtons.length === 0) {
    log(
      'Ошибка проверки порезки аккаунта: не найдены кнопки фильтров истории ставок',
      'crimson'
    );
    window.location.hash = '#/IP/';
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
    window.location.hash = '#/IP/';
    return 0;
  }
  const cashOutEnabled = ![...cashOutFilterButton.classList].includes('Hidden');
  window.location.hash = '#/IP/';
  return cashOutEnabled ? 1 : -1;
};

export const accountRestricted = (): void => {
  worker.SetSessionData('Bet365.AccountRestricted', '1');
  const message = worker.SetBookmakerPaused(true)
    ? 'Аккаунт Bet365 заблокирован! Bet365 поставлен на паузу'
    : 'Аккаунт Bet365 заблокирован! Bet365 НЕ поставлен на паузу. Поставьте на паузу вручную';
  log(message, 'red');
  worker.Helper.SendInformedMessage(message);
};

export const accountStep2 = (): void => {
  worker.SetSessionData('Bet365.AccountStep2', '1');
  const message = worker.SetBookmakerPaused(true)
    ? 'В Bet365 не пройден Step 2, ставки заблокированы! Bet365 поставлен на паузу'
    : 'В Bet365 не пройден Step 2, ставки заблокированы! Поставьте на паузу вручную';
  log(message, 'red');
  worker.Helper.SendInformedMessage(message);
};

export const accountSurvey = (): void => {
  worker.SetSessionData('Bet365.AccountSurvey', '1');
  const message = worker.SetBookmakerPaused(true)
    ? 'В Bet365 не пройден опрос, ставки заблокированы! Bet365 поставлен на паузу'
    : 'В Bet365 не пройден опрос, ставки заблокированы! Поставьте на паузу вручную';
  log(message, 'red');
  worker.Helper.SendInformedMessage(message);
};

export const accountLimited = (): void => {
  worker.SetSessionData('Bet365.AccountLimited', '1');
  const message = (() => {
    let text = 'В Bet365 порезанный аккаунт (отсутствует Cash Out)';
    if (worker.PauseOnLimitedAccount) {
      text += '. В настройках включена опция паузы при порезанном аккаунте';
      if (worker.SetBookmakerPaused(true)) {
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
  if (worker.GetSessionData('Bet365.AccountLimited.Informed') !== '1') {
    worker.Helper.SendInformedMessage(message);
    worker.SetSessionData('Bet365.AccountLimited.Informed', '1');
    log(message, 'crimson');
  } else {
    log(message, 'orange');
  }
};
