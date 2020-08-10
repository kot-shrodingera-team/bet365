import authCheckReadyGenerator from '@kot-shrodingera-team/germes-generators/initialization/authCheckReady';

const authCheckReady = authCheckReadyGenerator({
  authFormSelector: '.hm-MainHeaderRHSLoggedOutWide_Login',
  accountSelector: '.hm-MainHeaderMembersWide',
});

export default authCheckReady;
