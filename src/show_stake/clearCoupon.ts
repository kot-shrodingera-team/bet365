import clearCouponGenerator from '@kot-shrodingera-team/germes-generators/show_stake/clearCoupon';
import getStakeCount from '../stake_info/getStakeCount';

const apiClear = (): void => {
  Locator.betSlipManager.deleteAllBets();
};

const clearCoupon = clearCouponGenerator({
  apiClear,
  clearMode: 'all-only',
  clearAllSelector: '',
  clearSingleSelector: '',
  getStakeCount,
});

export default clearCoupon;
