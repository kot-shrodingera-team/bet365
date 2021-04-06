import { log } from '@kot-shrodingera-team/germes-utils';
import { version } from '../package.json';
import showStake from './show_stake';

const clearGermesData = () => {
  window.germesData = {
    betProcessingStep: undefined,
    betProcessingAdditionalInfo: undefined,
    doStakeTime: undefined,

    maximumStake: undefined,
    acceptChangesDelayStart: undefined,
    referredBetData: undefined,
  };
};

const fastLoad = async (): Promise<void> => {
  log(`Быстрая загрузка (${version})`, 'steelblue');
  clearGermesData();
  localStorage.setItem('reloadedBeforeShowStake', '0');
  showStake();
};

export default fastLoad;
