import { betslipBetSelector } from '../selectors';

const getStakeCount = (): number => {
  return document.querySelectorAll(betslipBetSelector).length;
  // let betCount = Locator.betSlipManager.getBetCount();
  // if (Number.isInteger(betCount)) {
  //     return betCount;
  // } else {
  //     return -1;
  // }
};

export default getStakeCount;
