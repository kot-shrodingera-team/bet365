import getCurrentEventName from './getCurrentEventName';

type TeamNames = { teamOne: string; teamTwo: string };

const getSiteTeamNames = (): TeamNames => {
  const eventName = getCurrentEventName();
  let eventTeams = eventName.split(' v ');
  if (eventTeams.length !== 2) {
    eventTeams = eventName.split(' vs ');
  }
  if (eventTeams.length !== 2) {
    eventTeams = eventName.split(' @ ');
  }
  if (eventTeams.length !== 2) {
    return null;
  }
  return { teamOne: eventTeams[0], teamTwo: eventTeams[1] };
};

export default getSiteTeamNames;
