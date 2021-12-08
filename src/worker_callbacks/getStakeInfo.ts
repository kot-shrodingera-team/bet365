import getStakeInfoGenerator from '@kot-shrodingera-team/germes-generators/worker_callbacks/getStakeInfo';
// import { getWorkerParameter, log } from '@kot-shrodingera-team/germes-utils';
import checkAuth from '../stake_info/checkAuth';
import getStakeCount from '../stake_info/getStakeCount';
import getBalance from '../stake_info/getBalance';
import checkStakeEnabled from '../stake_info/checkStakeEnabled';
import getCoefficient from '../stake_info/getCoefficient';
import getParameter from '../stake_info/getParameter';
import getMinimumStake from '../stake_info/getMinimumStake';
import getMaximumStake from '../stake_info/getMaximumStake';
import getCurrentSum from '../stake_info/getCurrentSum';
// import showStake from '../show_stake';

// const isReShowStakeNeeded = () => {
//   if (
//     getWorkerParameter('fakeStakeEnabled') ||
//     getWorkerParameter('fakeOpenStake')
//   ) {
//     return false;
//   }
//   const bet = document.querySelector('.lbs-NormalBetItem');
//   if (!bet) {
//     log('Не найдена ставка в купоне', 'crimson');
//     return true;
//   }
//   if (bet.classList.contains('lbs-NormalBetItem_Suspended')) {
//     log('Ставка в купоне недоступна', 'crimson');
//     return true;
//   }
//   return false;
// };

// const preAction = (): void => {};

const getStakeInfo = getStakeInfoGenerator({
  // reShowStake: {
  //   isNeeded: isReShowStakeNeeded,
  //   showStake,
  // },
  // preAction,
  checkAuth,
  getStakeCount,
  getBalance,
  getMinimumStake,
  getMaximumStake,
  getCurrentSum,
  checkStakeEnabled,
  getCoefficient,
  getParameter,
});

export default getStakeInfo;
