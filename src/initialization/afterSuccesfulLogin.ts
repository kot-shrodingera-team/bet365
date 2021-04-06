import checkCurrentLanguage from './checkCurrentLanguage';
import { checkCashOutEnabled, accountLimited } from './accountChecks';

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
