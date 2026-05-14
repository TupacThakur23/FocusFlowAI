export class PrivacyFirstAnalytics {
  constructor() {
    this.isConsented = false;
    this.sessionId = 'disabled';
    this.userId = 'disabled';
  }
  initializeAnalytics() {}
  trackEvent() {}
  trackWorkflow() {}
  trackFeatureUsage() {}
  trackPerformance() {}
  trackError() {}
  trackSessionQuality() {}
  trackUserFriction() {}
  updateConsent() {}
  clearAllData() {}
  getAnalyticsSummary() {
    return {
      message: 'Analytics disabled'
    };
  }
}
export const privacyFirstAnalytics = new PrivacyFirstAnalytics();
export const analyticsTrackEvent = () => {};
export const analyticsTrackWorkflow = () => {};
export const analyticsTrackFeatureUsage = () => {};
export const analyticsTrackPerformance = () => {};
export const analyticsTrackError = () => {};
export const analyticsTrackSessionQuality = () => {};
export const analyticsTrackUserFriction = () => {};
export const analyticsUpdateConsent = () => {};
export const analyticsGetSummary = () => ({});
export const analyticsClearAllData = () => {};
export default privacyFirstAnalytics;
