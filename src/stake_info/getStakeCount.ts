// import getStakeCountGenerator from '@kot-shrodingera-team/germes-generators/stake_info/getStakeCount';

// Locator.betSlipManager.getBetCount();

// const getStakeCount = getStakeCountGenerator({
//   stakeSelector:
//     '.bsm-BetslipStandardModule_Expanded .bss-NormalBetItem:not([style]), .bss-BetslipStandardModule_Minimised .bss-NormalBetItem:not([style])',
//   context: () => document,
// });

const getStakeCount = (): number => {
  return Locator.betSlipManager.getBetCount();
};

export default getStakeCount;
