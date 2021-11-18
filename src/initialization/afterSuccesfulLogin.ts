import { getWorkerParameter } from '@kot-shrodingera-team/germes-utils';
import { checkAccountLimited, accountLimited } from '../helpers/accountChecks';
import checkCurrentLanguage from '../helpers/checkCurrentLanguage';

const afterSuccesfulLogin = async (): Promise<void> => {
  if (
    !getWorkerParameter('fakeAuth') &&
    !getWorkerParameter('disableAccountChecks')
  ) {
    if (!getWorkerParameter('disableLanguageCheck')) {
      await checkCurrentLanguage();
    }
    if (!getWorkerParameter('disableCashOutCheck')) {
      const cashOutEnabled = await checkAccountLimited();
      if (cashOutEnabled === 0) {
        return;
      }
      if (cashOutEnabled === -1) {
        accountLimited();
      }
    }
  }
};

export default afterSuccesfulLogin;
