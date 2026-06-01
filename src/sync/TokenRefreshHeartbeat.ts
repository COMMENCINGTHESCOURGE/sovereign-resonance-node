// sovereign-resonance-node/src/sync/TokenRefreshHeartbeat.ts

export class TokenRefreshHeartbeat {
    private refreshIntervalId: any = null;
    private jwtExpiryTimestamp: number = 0;
    
    // Safety buffer: trigger refresh 5 minutes before actual expiry
    private readonly REFRESH_BUFFER_MS = 5 * 60 * 1000; 

    /**
     * Initializes the heartbeat for the active signaling channel.
     * @param fetchNewToken Callback to Firebase Auth to retrieve a fresh JWT.
     * @param injectToken Callback to push the new token through the active WebSocket.
     */
    public startMonitoring(
        initialExpiryTimestamp: number, 
        fetchNewToken: () => Promise<string>,
        injectToken: (token: string) => void
    ): void {
        this.jwtExpiryTimestamp = initialExpiryTimestamp;
        
        console.log(`[TokenRefreshHeartbeat] Monitoring WebRTC signaling auth...`);

        this.refreshIntervalId = setInterval(async () => {
            const now = Date.now();
            
            if (now >= (this.jwtExpiryTimestamp - this.REFRESH_BUFFER_MS)) {
                console.log(`[TokenRefreshHeartbeat] Token nearing expiration. Executing in-channel refresh...`);
                try {
                    const freshToken = await fetchNewToken();
                    injectToken(freshToken);
                    // Mocking extension of expiry by 1 hour
                    this.jwtExpiryTimestamp = now + (60 * 60 * 1000); 
                    console.log(`[TokenRefreshHeartbeat] Refresh successful. Connection secured.`);
                } catch (err) {
                    console.error(`[TokenRefreshHeartbeat] Refresh failed. WebRTC drop imminent.`, err);
                }
            }
        }, 60000); // Check every minute
    }

    /**
     * Called when a 1006 Abnormal Closure is detected on the WebSocket.
     * Salvages the RTCPeerConnection by transmitting a RESUME_ICE payload upon reconnect.
     */
    public salvageConnection(): { action: string, payload: string } {
        console.warn(`[TokenRefreshHeartbeat] 1006 Closure detected. Initiating RESUME_ICE recovery...`);
        return {
            action: 'RESUME_ICE',
            payload: 'stale_ice_candidate_buffer'
        };
    }

    public stopMonitoring(): void {
        if (this.refreshIntervalId) clearInterval(this.refreshIntervalId);
    }
}
