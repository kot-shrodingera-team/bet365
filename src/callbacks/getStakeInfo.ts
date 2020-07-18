import checkLogin from '../stakeInfo/checkLogin';
import getStakeCount from '../stakeInfo/getStakeCount';
import checkStakeEnabled from '../stakeInfo/checkStakeEnabled';
import getCoefficient from '../stakeInfo/getCoefficient';
import getBalance from '../stakeInfo/getBalance';
import getMinimumStake from '../stakeInfo/getMinimumStake';
import getSumFromCoupon from '../stakeInfo/getSumFromCoupon';
import getParameter from '../stakeInfo/getParameter';
import getMaximumStake from '../stakeInfo/getMaximumStake';
import { betslipAcceptChangesButtonSelector } from '../selectors';
import showStake from '../showStake';

const getStakeInfo = (): void => {
  worker.Helper.WriteLine('Получение информации о ставке');
  const acceptButton = document.querySelector(
    betslipAcceptChangesButtonSelector
  ) as HTMLElement;
  if (acceptButton) {
    const footerMessage = document.querySelector('.bss-Footer_MessageBody');
    if (footerMessage) {
      worker.Helper.WriteLine(
        `Принимаем изменения (${footerMessage.textContent.trim()})`
      );
    } else {
      worker.Helper.WriteLine(
        `Принимаем изменения (текст изменений не найден)`
      );
    }
    acceptButton.click();
  }
  worker.StakeInfo.Auth = checkLogin();
  worker.StakeInfo.StakeCount = getStakeCount();
  worker.StakeInfo.IsEnebled = checkStakeEnabled();
  worker.StakeInfo.Coef = getCoefficient();
  worker.StakeInfo.Balance = getBalance();
  worker.StakeInfo.MinSumm = getMinimumStake();
  worker.StakeInfo.MaxSumm = getMaximumStake();
  worker.StakeInfo.Summ = getSumFromCoupon();
  worker.StakeInfo.Parametr = getParameter();
  if (getStakeCount() !== 1) {
    showStake();
  }
};

export default getStakeInfo;
