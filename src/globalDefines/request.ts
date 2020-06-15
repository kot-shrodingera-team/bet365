import GermesRequest from '@kot-shrodingera-team/config/request';

declare global {
  interface Window {
    request: GermesRequest;
  }
}

window.request = new GermesRequest();

export default {};
