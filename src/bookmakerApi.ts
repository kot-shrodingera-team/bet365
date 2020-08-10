interface Bet365Bet {
  ConstructString: string;
  Uid: string;
}

interface Bet365AddBetData {
  item: Bet365Bet;
  action: number;
  partType: string;
  constructString: string;
  key: () => string;
  getSportType: () => string;
  getCastCode: () => string;
}

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
    addBet: (data: Bet365AddBetData) => void;
  };
}

declare global {
  const Locator: Locator;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const ns_favouriteslib_ui: unknown;
}

export default {};
