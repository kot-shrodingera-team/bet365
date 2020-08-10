import setStakeSumGenerator from '@kot-shrodingera-team/germes-generators/worker_callbacks/setStakeSum';

const setStakeSum = setStakeSumGenerator({
  sumInputSelector: 'input.bss-StakeBox_StakeValueInput',
});

export default setStakeSum;
