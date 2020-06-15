import { checkRestriction, accountBlocked } from '../accountChecks';
import { betslipBetSelector, betslipBetSuspendedClass } from '../selectors';
import checkBet from '../checkBet';

const checkStakeEnabled = (): boolean => {
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

export default checkStakeEnabled;
