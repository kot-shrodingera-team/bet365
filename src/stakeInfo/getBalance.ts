const getBalance = (): number => {
  /* eslint-disable no-underscore-dangle */
  Locator.user._balance.refreshBalance();
  const balance = Locator.user._balance.totalBalance;
  /* eslint-enable no-underscore-dangle */
  if (typeof balance === 'undefined') {
    console.log('Баланса ещё нет');
    return -1;
  }
  try {
    return parseFloat(balance);
  } catch (e) {
    worker.Helper.WriteLine(
      `Ошибка получения баланса: Не удалось спарсить - ${e}`
    );
    return -1;
  }
};

export default getBalance;
