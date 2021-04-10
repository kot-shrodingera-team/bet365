import { getWorkerParameter } from '@kot-shrodingera-team/germes-utils';
import {
  checkCashOutEnabled,
  accountLimited,
} from '../show_stake/helpers/accountChecks';
import checkCurrentLanguage from '../show_stake/helpers/checkCurrentLanguage';

const afterSuccesfulLogin = async (): Promise<void> => {
  if (!getWorkerParameter('fakeAuth')) {
    await checkCurrentLanguage();
    const cashOutEnabled = await checkCashOutEnabled();
    if (cashOutEnabled === 0) {
      return;
    }
    if (cashOutEnabled === -1) {
      accountLimited();
    }
  }
};

export default afterSuccesfulLogin;
