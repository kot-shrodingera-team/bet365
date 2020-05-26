import {
  memberHeaderSelector,
  betslipBetSelector,
  betslipBetSuspendedClass,
  betslipBetOddsSelector,
  betslipAlertMessage,
  betslipBetStakeSumInputSelector,
  betslipAcceptChangesButtonSelector,
} from './selectors';
import { checkRestriction, accountBlocked } from './accountChecks';
import checkBet from './checkBet';

const minimumStake = 0.1;
let tempMaximumStake = -1;

export const getTempMaximumStake = (): number => {
  return tempMaximumStake;
};
export const setTempMaximumStake = (newMaximumStake: number): void => {
  tempMaximumStake = newMaximumStake;
};
export const clearTempMaximumStake = (): void => {
  tempMaximumStake = -1;
};

export const checkLogin = (): boolean => {
  return Boolean(document.querySelector(memberHeaderSelector));
};

export const getStakeCount = (): number => {
  return document.querySelectorAll(betslipBetSelector).length;
  // let betCount = Locator.betSlipManager.getBetCount();
  // if (Number.isInteger(betCount)) {
  //     return betCount;
  // } else {
  //     return -1;
  // }
};

export const checkStakeEnabled = (): boolean => {
  if (checkRestriction()) {
    accountBlocked();
    return false;
  }
  const bet = document.querySelector(betslipBetSelector);
  if (!bet) {
    console.log('Нет ставки');
    return false;
  }
  // let betslipBetSuspended = bet.querySelector(betslipBetSuspendedSelector);
  if ([...bet.classList].includes(betslipBetSuspendedClass)) {
    worker.Helper.WriteLine('Ставка Suspended');
    return false;
  }
  return checkBet().correctness;
};

export const getCoefficientFromCoupon = (): number => {
  const bet = document.querySelector(betslipBetSelector);
  if (!bet) {
    console.log('Нет ставки');
    return -1;
  }
  const odds = bet.querySelector(betslipBetOddsSelector);
  try {
    return parseFloat(odds.textContent);
  } catch (e) {
    worker.Helper.WriteLine(`Ошибка получения коэффициента - ${e}`);
    return -1;
  }
};

export const getBalance = (): number => {
  /* eslint-disable no-underscore-dangle */
  Locator.user._balance.refreshBalance();
  const balance = Locator.user._balance.totalBalance;
  /* eslint-enable no-underscore-dangle */
  if (typeof balance === 'undefined') {
    console.log('Баланса ещё нет');
    return -1;
  }
  try {
    return parseFloat(balance);
  } catch (e) {
    worker.Helper.WriteLine(
      `Ошибка получения баланса: Не удалось спарсить - ${e}`
    );
    return -1;
  }
};

export const getMinimumStake = (): number => {
  return minimumStake;
};

export const getMaximumStake = (): number => {
  const betErrorMessageElement = document.querySelector(betslipAlertMessage);
  if (betErrorMessageElement) {
    const betErrorMessage = betErrorMessageElement.textContent.trim();
    const matches = betErrorMessage.match(
      /^Stake\/risk entered on selection .* is above the available maximum of .*(\d+\.\d+)\.$/
    );
    if (matches) {
      const acceptButton = document.querySelector(
        betslipAcceptChangesButtonSelector
      ) as HTMLElement;
      if (!acceptButton) {
        worker.Helper.WriteLine('Ошибка макса: Нет кнопки принятия изменений');
        return 0;
      }
      acceptButton.click();
      worker.Helper.WriteLine(`Есть макс: ${matches[1]}`);
      tempMaximumStake = Number(matches[1]);
      return Number(matches[1]);
    }
  }
  if (tempMaximumStake !== -1) {
    return tempMaximumStake;
  }
  return getBalance();
};

export const getSumFromCoupon = (): number => {
  const bet = document.querySelector(betslipBetSelector);
  if (!bet) {
    console.log('Нет ставки');
    return -1;
  }
  const stakeSumInput = bet.querySelector(
    betslipBetStakeSumInputSelector
  ) as HTMLInputElement;
  try {
    return parseFloat(stakeSumInput.value);
  } catch (e) {
    worker.Helper.WriteLine(`Ошибка получения суммы ставки - ${e}`);
    return -1;
  }
};

export const getParameterFromCoupon = (): number => {
  return checkBet().parameter;
};

export const updateBalance = (): void => {
  const balance = getBalance();
  console.log(`balance = ${balance}`);
  worker.JSBalanceChange(balance);
};
