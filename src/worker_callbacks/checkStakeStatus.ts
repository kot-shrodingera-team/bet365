import { log } from '@kot-shrodingera-team/germes-utils';
import { updateBalance } from '../stake_info/getBalance';

const checkStakeStatus = (): boolean => {
  if (window.germesData.betProcessingStep === 'success') {
    log('Ставка принята', 'green');
    updateBalance();
    return true;
  }
  log('Ставка не принята', 'red');
  return false;
};

export default checkStakeStatus;
