import { getWorkerParameter } from '@kot-shrodingera-team/germes-utils';
// import getStakeCountGenerator from '@kot-shrodingera-team/germes-generators/stake_info/getStakeCount';

// Locator.betSlipManager.getBetCount();

// const getStakeCount = getStakeCountGenerator({
//   stakeSelector:
//     '.bsm-BetslipStandardModule_Expanded .bss-NormalBetItem:not([style]), .bss-BetslipStandardModule_Minimised .bss-NormalBetItem:not([style])',
//   context: () => document,
// });

const getStakeCount = (): number => {
  if (
    getWorkerParameter('fakeStakeCount') ||
    getWorkerParameter('fakeOpenStake')
  ) {
    return 1;
  }
  return BetSlipLocator.betSlipManager.getBetCount();
};

export default getStakeCount;
