import checkStakeEnabledGenerator from '@kot-shrodingera-team/germes-generators/stake_info/checkStakeEnabled';
import { log } from '@kot-shrodingera-team/germes-utils';
import acceptChanges from '../helpers/acceptChanges';
import getStakeCount from './getStakeCount';

const preCheck = (): boolean => {
  const betslipModule = document.querySelector('.bsm-BetslipStandardModule');
  if (
    betslipModule &&
    ![...betslipModule.classList].includes('bsm-BetslipStandardModule_Expanded')
  ) {
    log('Купон не развёрнут', 'crimson');
    return false;
  }

  const acceptButton = document.querySelector('.bs-AcceptButton');
  const suspendedStake = document.querySelector(
    '.bss-NormalBetItem.bss-NormalBetItem_Suspended'
  );

  if (suspendedStake) {
    log('Ставка недоступна', 'crimson');
    return false;
  }

  if (acceptButton) {
    log('Принимаем изменения', 'orange');
    acceptChanges();
    return false;
  }
  return true;
};

const checkStakeEnabled = checkStakeEnabledGenerator({
  preCheck,
  getStakeCount,
  betCheck: {
    selector: '.bss-NormalBetItem',
    // errorClasses: [
    //   {
    //     className: 'bss-NormalBetItem_Suspended',
    //     message: 'Suspended',
    //   },
    // ],
  },
  // errorsCheck: [
  //   {
  //     selector: '',
  //     message: '',
  //   },
  // ],
  // context: () => document,
});

export default checkStakeEnabled;
