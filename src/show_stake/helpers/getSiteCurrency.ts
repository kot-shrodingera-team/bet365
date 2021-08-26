const getSiteCurrency = (): string => {
  if (!Locator || !Locator.user || !Locator.user.currencyCode) {
    return 'Unknown';
  }
  const { currencyCode } = Locator.user;
  if (currencyCode === 'EUR') {
    return 'EUR';
  }
  if (currencyCode === 'USD') {
    return 'USD';
  }
  if (currencyCode === 'RUB') {
    return 'RUR';
  }
  if (currencyCode === 'INR') {
    return 'INR';
  }
  return 'Unknown';
};

export default getSiteCurrency;
