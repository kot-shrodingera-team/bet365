declare global {
  const Locator: Locator;
  const BetSlipLocator: BetSlipLocator;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const ns_favouriteslib_ui: unknown;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const ns_mybetssubscriptionlib: {
    MyBetsSubscriptionsManager: {
      GetInstance: () => {
        closeBetsEnabled: boolean;
      };
    };
  };

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
      currencyCode: string;
    };
    treeLookup: {
      getReference: (id: string) => unknown;
    };
    subscriptionManager: {
      subscribe: (eventId: string) => unknown;
    };
  }

  interface BetSlipLocator {
    betSlipManager: {
      getBetCount: () => number;
      deleteAllBets: () => void;
      addBet: (data: Bet365AddBetData) => void;
      betslip: {
        activeModule: {
          quickBetslipMoveToStandard: () => void;
          slip: {
            footer: {
              model: {
                acceptChanges: () => unknown;
                placeBet: () => unknown;
              };
            };
          };
        };
      };
    };
  }

  interface GermesData {
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
  if (window.germesData && window.germesData.updateManualDataIntervalId) {
    clearInterval(window.germesData.updateManualDataIntervalId);
  }
  window.germesData = {
    bookmakerName: 'Bet365',
    minimumStake: undefined,
    maximumStake: undefined,
    doStakeTime: undefined,
    betProcessingStep: undefined,
    betProcessingAdditionalInfo: undefined,
    betProcessingTimeout: 50000,
    stakeDisabled: undefined,
    stopBetProcessing: () => {
      window.germesData.betProcessingStep = 'error';
      window.germesData.stakeDisabled = true;
    },
    updateManualDataIntervalId: undefined,
    stopUpdateManualData: undefined,
    manualMaximumStake: undefined,
    manualCoefficient: undefined,
    manualParameter: undefined,
    manualStakeEnabled: undefined,

    acceptChangesDelayStart: undefined,
    referredBetData: {
      placeNowValue: undefined,
      referredValue: undefined,
    },
    resultCoefficient: undefined,
    prevLastBet: undefined,
  };
};

export default {};
