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
  const footerMessageElement = document.querySelector(
    '.bss-Footer_MessageBody'
  );
  if (footerMessageElement) {
    const footerMessage = footerMessageElement.textContent.trim();
    if (
      /In accordance with licensing conditions we are required to verify your age and identity. Certain restrictions may be applied to your account until we are able to verify your details. Please go to the Know Your Customer page in Members and provide the requested information./i.test(
        footerMessage
      )
    ) {
      log('Ставка недоступна (ошибка, не пройден Step 2)', 'crimson');
      return false;
    }
    if (
      /As part of the ongoing management of your account we need you to answer a set of questions relating to Responsible Gambling. Certain restrictions may be applied to your account until you have successfully completed this. You can answer these questions now by going to the Self-Assessment page in Members./i.test(
        footerMessage
      )
    ) {
      log('Ставка недоступна (ошибка, не пройден опрос)', 'crimson');
      return false;
    }
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
