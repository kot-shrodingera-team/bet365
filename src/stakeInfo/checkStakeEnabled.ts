import { checkRestriction, accountBlocked } from '../accountChecks';
import checkBet from '../checkBet';
import getStakeCount from './getStakeCount';

const checkStakeEnabled = (): boolean => {
  if (checkRestriction()) {
    accountBlocked();
    return false;
  }
  if (getStakeCount() !== 1) {
    return false;
  }
  const betslipModule = document.querySelector('.bsm-BetslipStandardModule');
  if (
    betslipModule &&
    ![...betslipModule.classList].includes('bsm-BetslipStandardModule_Expanded')
  ) {
    worker.Helper.WriteLine('Купон не отображается');
    return false;
  }
  const bet = document.querySelector('.bss-NormalBetItem');
  if (!bet) {
    console.log('Нет ставки');
    return false;
  }
  // let betslipBetSuspended = bet.querySelector(betslipBetSuspendedSelector);
  if ([...bet.classList].includes('bss-NormalBetItem_Suspended')) {
    worker.Helper.WriteLine('Ставка Suspended');
    return false;
  }
  return checkBet().correctness;
};

export default checkStakeEnabled;
