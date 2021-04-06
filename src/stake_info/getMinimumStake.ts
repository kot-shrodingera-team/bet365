const getMinimumStake = (): number => {
  if (worker.Currency === 'RUR') {
    return 10;
  }
  return 0.2;
};

export default getMinimumStake;
