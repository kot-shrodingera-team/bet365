import checkStakeEnabledGenerator from '@kot-shrodingera-team/germes-generators/stake_info/checkStakeEnabled';
import { log } from '@kot-shrodingera-team/germes-utils';
import {
  checkRestriction,
  accountBlocked,
} from '../initialization/accountChecks';
import getStakeCount from './getStakeCount';

const preCheck = (): boolean => {
  if (checkRestriction()) {
    accountBlocked();
    return false;
  }
  const betslipModule = document.querySelector('.bsm-BetslipStandardModule');
  if (
    betslipModule &&
    ![...betslipModule.classList].includes('bsm-BetslipStandardModule_Expanded')
  ) {
    log(
      'Ошибка определения доступности ставки: купон не отображается',
      'crimson'
    );
    return false;
  }
  return true;
};

const checkStakeEnabled = checkStakeEnabledGenerator({
  preCheck,
  getStakeCount,
  betCheck: {
    selector: '.bss-NormalBetItem',
    errorClasses: [
      {
        className: 'bss-NormalBetItem_Suspended',
        message: 'Suspended',
      },
    ],
  },
});

export default checkStakeEnabled;
