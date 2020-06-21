interface Locator {
  user: {
    _balance: {
      refreshBalance: () => void;
      totalBalance: string;
    };
  };
  betSlipManager: {
    getBetCount: () => number;
    deleteAllBets: () => void;
  };
}

declare global {
  const Locator: Locator;
  // eslint-disable-next-line @typescript-eslint/camelcase
  const ns_favouriteslib_ui: unknown;
}

export default {};
