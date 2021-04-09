import {
  checkCashOutEnabled,
  accountLimited,
} from '../show_stake/helpers/accountChecks';
import checkCurrentLanguage from '../show_stake/helpers/checkCurrentLanguage';

const afterSuccesfulLogin = async (): Promise<void> => {
  // Сброс флага активности открытия купона, если было какое-то зависание
  localStorage.setItem('couponOpening', '0');
  await checkCurrentLanguage();
  const cashOutEnabled = await checkCashOutEnabled();
  if (cashOutEnabled === 0) {
    return;
  }
  if (cashOutEnabled === -1) {
    accountLimited();
  }
};

export default afterSuccesfulLogin;
