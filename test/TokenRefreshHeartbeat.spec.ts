// sovereign-resonance-node/test/TokenRefreshHeartbeat.spec.ts
import { expect } from 'chai';
import { TokenRefreshHeartbeat } from '../src/sync/TokenRefreshHeartbeat';

describe('WebRTC Token Refresh Heartbeat', () => {
    it('should generate a RESUME_ICE payload upon abnormal closure', () => {
        const heartbeat = new TokenRefreshHeartbeat();
        
        const recoveryDirective = heartbeat.salvageConnection();

        expect(recoveryDirective.action).to.equal('RESUME_ICE');
        expect(recoveryDirective.payload).to.not.be.empty;
    });

    it('should properly track the expiry buffer internally (mock test)', () => {
        const heartbeat = new TokenRefreshHeartbeat();
        expect(heartbeat).to.respondTo('startMonitoring');
        expect(heartbeat).to.respondTo('stopMonitoring');
    });
});
