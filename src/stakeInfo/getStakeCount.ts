// import { betslipBetSelector } from '../selectors';

const getStakeCount = (): number => {
  // return document.querySelectorAll(betslipBetSelector).length;
  return Locator.betSlipManager.getBetCount();
  // let betCount = Locator.betSlipManager.getBetCount();
  // if (Number.isInteger(betCount)) {
  //     return betCount;
  // } else {
  //     return -1;
  // }
};

export default getStakeCount;
