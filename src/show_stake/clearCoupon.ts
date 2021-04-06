import clearCouponGenerator from '@kot-shrodingera-team/germes-generators/show_stake/clearCoupon';
import getStakeCount from '../stake_info/getStakeCount';

// const preCheck = async (): Promise<boolean> => {
//   return true;
// };

const apiClear = (): void => {
  Locator.betSlipManager.deleteAllBets();
};

// const postCheck = async (): Promise<boolean> => {
//   return true;
// };

const clearCoupon = clearCouponGenerator({
  // preCheck,
  getStakeCount,
  apiClear,
  // clearSingleSelector: '',
  // clearAllSelector: '',
  // postCheck,
  // context: () => document,
});

export default clearCoupon;
