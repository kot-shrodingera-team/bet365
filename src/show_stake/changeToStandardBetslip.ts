import { getElement } from '@kot-shrodingera-team/germes-utils';

const changeToStandardBetslip = async (): Promise<boolean> => {
  Locator.betSlipManager.betslip.activeModule.quickBetslipMoveToStandard();
  const expandedBetslip = await getElement(
    '.bss-BetslipStandardModule_Expanded'
  );
  if (!expandedBetslip) {
    return false;
  }
  await getElement('.bss-NormalBetItem_FixtureDescription');
  return true;
};

export default changeToStandardBetslip;
