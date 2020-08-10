import getCurrentSumGenerator from '@kot-shrodingera-team/germes-generators/stake_info/getCurrentSum';

const getCurrentSum = getCurrentSumGenerator({
  sumInput: 'input.bss-StakeBox_StakeValueInput',
  zeroValues: ['Stake'],
});

export default getCurrentSum;
