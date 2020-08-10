import getStakeCountGenerator from '@kot-shrodingera-team/germes-generators/stake_info/getStakeCount';
import { log } from '@kot-shrodingera-team/germes-utils';

// Locator.betSlipManager.getBetCount();

// const getStakeCount = getStakeCountGenerator({
//   stakeElementSelector:
//     '.bsm-BetslipStandardModule_Expanded .bss-NormalBetItem:not([style]), .bss-BetslipStandardModule_Minimised .bss-NormalBetItem:not([style])',
// });

const getStakeCount = (): number => {
  // const domStakeCount = [
  //   ...document.querySelectorAll(
  //     '.bsm-BetslipStandardModule_Expanded .bss-NormalBetItem:not([style]), .bss-BetslipStandardModule_Minimised .bss-NormalBetItem:not([style])'
  //   ),
  // ].length;
  // const apiStakeCount = Locator.betSlipManager.getBetCount();
  // if (domStakeCount !== apiStakeCount) {
  //   const message =
  //     `domStakeCount = ${domStakeCount}\n` +
  //     `apiStakeCount = ${apiStakeCount}\n`;
  //   worker.Helper.SendInformedMessage(message);
  //   log(message, 'tan');
  // }
  return Locator.betSlipManager.getBetCount();
};

export default getStakeCount;
