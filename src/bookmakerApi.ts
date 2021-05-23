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
      bonusBalance: string;
    };
  };
  betSlipManager: {
    getBetCount: () => number;
    deleteAllBets: () => void;
    addBet: (data: Bet365AddBetData) => void;
    betslip: {
      activeModule: {
        quickBetslipMoveToStandard: () => void;
      };
    };
  };
}

declare global {
  const Locator: Locator;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const ns_favouriteslib_ui: unknown;
  // interface Window {
  //   germesData: Bet365GermesData;
  // }
  interface GermesData {
    maximumStake: number;
    acceptChangesDelayStart: Date;
    referredBetData: {
      placeNowValue: number;
      referredValue: number;
    };
    resultCoefficient: number;
    prevLastBet: Element;
  }
}

export const clearGermesData = (): void => {
  window.germesData = {
    bookmakerName: 'Bet365',
    betProcessingStep: undefined,
    betProcessingAdditionalInfo: undefined,
    betProcessingTimeout: 50000,
    doStakeTime: undefined,

    maximumStake: undefined,
    acceptChangesDelayStart: undefined,
    referredBetData: undefined,
    resultCoefficient: undefined,
    prevLastBet: undefined,
  };
};

export default {};
