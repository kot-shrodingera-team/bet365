import { getElement } from '@kot-shrodingera-team/germes-utils';

const changeToStandardBetslip = async (): Promise<boolean> => {
  BetSlipLocator.betSlipManager.betslip.activeModule.quickBetslipMoveToStandard();
  const expandedBetslip = await getElement('.lbs-StandardBetslip');
  if (!expandedBetslip) {
    return false;
  }
  return true;
};

export default changeToStandardBetslip;
