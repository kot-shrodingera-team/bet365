import { getWorkerParameter } from '@kot-shrodingera-team/germes-utils';

const getMinimumStake = (): number => {
  if (
    getWorkerParameter('fakeMinimumStake', 'number') ||
    getWorkerParameter('fakeAuth') ||
    getWorkerParameter('fakeOpenStake')
  ) {
    const fakeMinimumStake = getWorkerParameter(
      'fakeMinimumStake',
      'number'
    ) as number;
    if (fakeMinimumStake !== undefined) {
      return fakeMinimumStake;
    }
    return 0;
  }
  if (worker.Currency === 'RUR') {
    return 10;
  }
  return 0.2;
};

export default getMinimumStake;
