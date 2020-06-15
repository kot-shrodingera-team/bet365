import showStake from '../showStake';
import checkLogin from '../stakeInfo/checkLogin';
import getStakeCount from '../stakeInfo/getStakeCount';
import checkStakeEnabled from '../stakeInfo/checkStakeEnabled';
import getCoefficient from '../stakeInfo/getCoefficient';
import getBalance from '../stakeInfo/getBalance';
import getMinimumStake from '../stakeInfo/getMinimumStake';
import getSumFromCoupon from '../stakeInfo/getSumFromCoupon';
import getParameter from '../stakeInfo/getParameter';
import getMaximumStake from '../stakeInfo/getMaximumStake';

const getStakeInfo = (): string => {
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
  return JSON.stringify(worker.StakeInfo);
};

export default getStakeInfo;
