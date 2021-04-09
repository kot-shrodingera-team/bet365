import WorkerBetObject from '@kot-shrodingera-team/worker-declaration/workerBetObject';

type CheckMarketData = {
  error: boolean;
  errorMessage: string;
};

const getCheckMarket = (betslipBetDetails: string): CheckMarketData => {
  const {
    market,
    // odd,
    // param,
    period,
    subperiod,
    overtimeType,
  } = JSON.parse(worker.ForkObj) as WorkerBetObject;
  const error = (errorMessage: string): CheckMarketData => ({
    error: true,
    errorMessage,
  });
  const success = (): CheckMarketData => ({
    error: false,
    errorMessage: null,
  });
  if (/^ML$/i.test(market)) {
    if (worker.SportId === 2) {
      if (period === 0) {
        if (!/^Match Winner$/i.test(betslipBetDetails)) {
          return error('Открыта не победа в матче');
        }
      } else if (period !== 0 && subperiod === 0) {
        if (!/^(Current|Next) Set Winner$/i.test(betslipBetDetails)) {
          return error('Открыта не победа в сете');
        }
      } else if (period !== 0 && subperiod !== 0) {
        if (!/^(Current Game Winner|Next Game)$/i.test(betslipBetDetails)) {
          return error('Открыта не победа в гейме');
        }
      } else {
        return error(`Необрабатываемый период (${period}). Напишите в ТП`);
      }
    }
    //
  } else if (/^F$/i.test(market)) {
    if (worker.SportId === 1) {
      if (period === 0) {
        if (
          !/^(Alternative Asian Handicap|Asian Handicap In-Play|Draw No Bet)$/i.test(
            betslipBetDetails
          )
        ) {
          return error('Открыта не фора в матче');
        }
      } else if (period === 1) {
        if (
          !/^(Alternative 1st Half Asian|1st Half Asian Handicap)$/i.test(
            betslipBetDetails
          )
        ) {
          return error('Открыта не фора в первом тайме');
        }
      } else if (period === 2) {
        return error(
          'На Bet365 нет фор на второй тайм в футболе. Если это фора на второй тайм, скиньте скрин в ТП'
        );
      } else {
        return error(`Необрабатываемый период (${period}). Напишите в ТП`);
      }
    } else if (worker.SportId === 2) {
      if (period === 0) {
        if (!/^Match Handicap$/i.test(betslipBetDetails)) {
          return error('Открыта не фора в матче');
        }
      } else if (period === 0 && overtimeType === 3) {
        if (!/^Match Tie Break Handicap$/i.test(betslipBetDetails)) {
          return error('Открыта не фора в матче (doubles)');
        }
      } else if (period !== 0) {
        if (
          !/^(Current Set Handicap|Next Set Handicap)$/i.test(betslipBetDetails)
        ) {
          return error('Открыта не фора в сете');
        }
      } else {
        return error(`Необрабатываемый период (${period}). Напишите в ТП`);
      }
    }
  } else if (/^1X2$/i.test(market)) {
    if (worker.SportId === 1) {
      if (period === 0) {
        if (!/^Fulltime Result$/i.test(betslipBetDetails)) {
          return error('Открыта не победа в матче');
        }
      } else if (period === 1) {
        if (!/^Half Time Result$/i.test(betslipBetDetails)) {
          return error('Открыта не победа в первом тайме');
        }
      } else if (period === 2) {
        if (!/^To Win 2nd Half$/.test(betslipBetDetails)) {
          return error('Открыта не победа во втором тайме');
        }
      } else {
        return error(`Необрабатываемый период (${period}). Напишите в ТП`);
      }
    }
  } else if (/^OU$/i.test(market)) {
    if (worker.SportId === 1) {
      if (period === 0) {
        if (
          !/^(Alternative Goal Line|Goal Line In-Play|(Alternative )?Match Goals)$/i.test(
            betslipBetDetails
          )
        ) {
          return error('Открыт не тотал в матче');
        }
      } else if (period === 1) {
        if (
          !/^((Alternative )?1st Half Goal Line|(?:Alternative 1st|First) Half Goals)$/i.test(
            betslipBetDetails
          )
        ) {
          return error('Открыт не тотал в первом тайме');
        }
      } else if (period === 2) {
        if (
          !/^((Alternative )?2nd Half Goal Line|(?:Alternative 2nd|Second) Half Goals)$/i.test(
            betslipBetDetails
          )
        ) {
          return error('Открыт не тотал во втором тайме');
        }
      } else {
        return error(`Необрабатываемый период (${period}). Напишите в ТП`);
      }
    } else if (worker.SportId === 2) {
      if (period === 0 && overtimeType === 0) {
        if (!/^Total Games in Match$/i.test(betslipBetDetails)) {
          return error('Открыт не тотал в матче');
        }
      } else if (period === 0 && overtimeType === 3) {
        return error(
          'На Bet365 нет тоталов в матче (doubles). Если это тотал в матче (doubles), скиньте скрин в ТП'
        );
      } else if (period !== 0) {
        if (!/^Games in Current Set$/i.test(betslipBetDetails)) {
          return error('Открыт не тотал в первом тайме');
        }
      } else {
        return error(`Необрабатываемый период (${period}). Напишите в ТП`);
      }
    }
  } else if (/^OU[12]$/i.test(market)) {
    if (worker.SportId === 1) {
      if (period === 0) {
        if (/^OU1$/i.test(market)) {
          if (!/^Home Team Goals$/i.test(betslipBetDetails)) {
            return error('Открыт не тотал первой команды');
          }
        } else if (/^OU2$/i.test(market)) {
          if (!/^Away Team Goals$/i.test(betslipBetDetails)) {
            return error('Открыт не тотал второй команды');
          }
        }
      } else if ([1, 2].includes(period)) {
        return error(
          'На Bet365 нет индивидуальных тоталов в таймах в футболе. Если это индивидуальный тотал в тайме, скиньте скрин в ТП'
        );
      } else {
        return error(`Необрабатываемый период (${period}). Напишите в ТП`);
      }
    } else if (worker.SportId === 2) {
      if (period === 0) {
        if (!/^Player Total Games$/i.test(betslipBetDetails)) {
          return error('Открыт не тотал игрока в матче');
        }
      } else {
        return error(
          'На Bet365 нет индивидуальных тоталов в сете в теннисе. Если это индивидуальный тотал в сете, скиньте скрин в ТП'
        );
      }
    }
  } else if (/^DC$/i.test(market)) {
    if (worker.SportId === 1) {
      if (period === 0) {
        if (!/^Double Chance$/i.test(betslipBetDetails)) {
          return error('Открыт не двойной шанс в матче');
        }
      } else if (period === 1) {
        if (!/^Halftime Double Chance$/i.test(betslipBetDetails)) {
          return error('Открыт не двойной шанс в первом тайме');
        }
      } else if (period === 2) {
        return error(
          'На Bet365 нет двойного шанса во втором тайме в футболе. Если это двойной шанс на второй тайм, скиньте скрин в ТП'
        );
      } else {
        return error(`Необрабатываемый период (${period}). Напишите в ТП`);
      }
    }
  } else if (/^EH$/i.test(market)) {
    if (worker.SportId === 1) {
      if (period === 0) {
        if (!/^(Alternative )?3-Way Handicap$/i.test(betslipBetDetails)) {
          return error('Открыт не европейский гандикап в матче');
        }
      } else if (period === 1) {
        if (
          !/^(Alternative )?1st Half 3-Way Handicap$/i.test(betslipBetDetails)
        ) {
          return error('Открыт не европейский гандикап в первом тайме');
        }
      } else if (period === 2) {
        return error(
          'На Bet365 нет европейских гандикапов во втором тайме в футболе. Если это европейский гандикап на второй тайм, скиньте скрин в ТП'
        );
      } else {
        return error(`Необрабатываемый период (${period}). Напишите в ТП`);
      }
    }
  } else if (/^BTS$/i.test(market)) {
    if (worker.SportId === 1) {
      if (period === 0) {
        if (!/^Both Teams to Score$/i.test(betslipBetDetails)) {
          return error('Открыт не BTS в матче');
        }
      } else if (period === 1) {
        if (!/^Both Teams to Score in 1st Half$/i.test(betslipBetDetails)) {
          return error('Открыт не BTS в первом тайме');
        }
      } else if (period === 2) {
        if (!/^Both Teams to Score in 2nd Half$/i.test(betslipBetDetails)) {
          return error('Открыт не BTS во втором тайме');
        }
      } else {
        return error(`Необрабатываемый период (${period}). Напишите в ТП`);
      }
    }
  } else if (/^CNR_F$/i.test(market)) {
    return error(
      'На Bet365 нет фор на угловые. Если это фора на угловые, скиньте скрин в ТП'
    );
  } else if (/^CNR_OU$/i.test(market)) {
    if (worker.SportId === 1) {
      if (period === 0) {
        if (
          !/^((Alternative )?Total Corners|2-Way Corners|Asian Corners)$/i.test(
            betslipBetDetails
          )
        ) {
          return error('Открыт не тотал угловых в матче');
        }
      } else if (period === 1) {
        if (
          !/^(1st Half Corners|1st Half Asian Corners)$/i.test(
            betslipBetDetails
          )
        ) {
          return error('Открыт не тотал угловых в первом тайме');
        }
      } else if (period === 2) {
        if (
          !/^(2nd Half Corners|2nd Half Asian Corners)$/i.test(
            betslipBetDetails
          )
        ) {
          return error('Открыт не тотал угловых во втором тайме');
        }
      } else {
        return error(`Необрабатываемый период (${period}). Напишите в ТП`);
      }
    }
  }
  return success();
};

export default getCheckMarket;
