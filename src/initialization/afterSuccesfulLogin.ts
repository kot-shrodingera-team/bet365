import { log } from '@kot-shrodingera-team/germes-utils';
import checkCurrentLanguage from './checkCurrentLanguage';
import { checkCashOutEnabled, accountLimited } from './accountChecks';

const afterSuccesfulLogin = async (): Promise<void> => {
  checkCurrentLanguage();
  const cashOutEnabled = await checkCashOutEnabled();
  if (cashOutEnabled === 0) {
    log('Не удалось определить порезку аккаунта', 'crimson');
    return;
  }
  if (cashOutEnabled === -1) {
    accountLimited();
  }
};

export default afterSuccesfulLogin;
