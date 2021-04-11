import { getWorkerParameter } from '@kot-shrodingera-team/germes-utils';
import getBalance from './getBalance';

const getMaximumStake = (): number => {
  if (
    getWorkerParameter('fakeMaximumStake', 'number') ||
    getWorkerParameter('fakeAuth') ||
    getWorkerParameter('fakeOpenStake')
  ) {
    const fakeMaximumStake = getWorkerParameter(
      'fakeMaximumStake',
      'number'
    ) as number;
    if (fakeMaximumStake !== undefined) {
      return fakeMaximumStake;
    }
    return 100000;
  }
  if (window.germesData.maximumStake !== undefined) {
    return window.germesData.maximumStake;
  }
  return getBalance();
};

export default getMaximumStake;
