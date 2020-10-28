import setStakeSumGenerator from '@kot-shrodingera-team/germes-generators/worker_callbacks/setStakeSum';

const setStakeSum = setStakeSumGenerator({
  sumInputSelector: 'input.bss-StakeBox_StakeValueInput',
  alreadySetCheck: {
    falseOnSumChange: true,
  },
});

export default setStakeSum;
