import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { KJUR } from 'jsrsasign';

@Injectable({
  providedIn: 'root'
})
export class ZoomSdkService {
  client: any;
  isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  // Initialize the Zoom SDK with necessary configurations
  async initZoomSdk(apiKey: string, apiSecret: string, sessionName: string, userName: string) {
    if (!this.isBrowser) {
      console.warn('Zoom Video SDK cannot be initialized in a non-browser environment');
      return;
    }
    
    
    try {
      // Dynamically import the Zoom Video SDK to avoid SSR issues
      const ZoomVideo = (await import('@zoom/videosdk')).default;
      this.client = ZoomVideo.createClient();
      
      await this.client.init('en-US', 'CDN');
      // const signature = this.generateSignature(apiKey, apiSecret, sessionName, userName); // Replace with your signature logic
      var signature = this.generateVideoSdkApiJwt("iCjNmlJ0tHuA5k6qM3y7S1Vo4hjO0VyyoCXV","ulaqib8IDthk6SQaT4GiNKFkbAfzMHjQ12x8");
      // const signature = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdWQiOm51bGwsImlzcyI6Im05WGhsRWR6U0wtdjBXLXlxZmktdWciLCJleHAiOjE3MjcyNTM2NzQsImlhdCI6MTcyNzI0ODI3NH0.Ufn3eS-S8tk77XR_g0JYwME2kHYT8Tf8mBKBE61k8u4";
      await this.client.join("iCjNmlJ0tHuA5k6qM3y7S1Vo4hjO0VyyoCXV", signature, sessionName, userName);
      console.log('Zoom Video SDK initialized and session joined.');
    } catch (error) {
      console.error('Error initializing Zoom Video SDK:', error);
    }
  }

  // Generate signature - this usually comes from your backend
  generateSignature(apiKey: string, apiSecret: string, sessionName: string, userName: string): string {
    // Signature generation logic (typically done server-side)
    // For simplicity, placeholder signature is used here.
    return 'your-generated-signature'; 
  }

  generateVideoSdkApiJwt(sdkApiKey: string, sdkApiSecret: string): string {
    // const KJUR = require('jsrsasign');
    const iat = Math.round((new Date().getTime() - 30000) / 1000); // issued at time
    const exp = iat + 60 * 60 * 2; // expiration time (2 hours)
    
    const oHeader = { alg: 'HS256', typ: 'JWT' };
    const oPayload = {
      app_key: sdkApiKey,
      iss: sdkApiKey, // issuer
      iat: iat, // issued at
      exp: exp, // expiration
      tpc: "Test Session",
      role_type: 1
    };
  
    const sHeader = JSON.stringify(oHeader);
    const sPayload = JSON.stringify(oPayload);
    
    // Sign the JWT using HS256 and return the token
    const videosdkApiToken = KJUR.jws.JWS.sign('HS256', sHeader, sPayload, sdkApiSecret);
    return videosdkApiToken;
  }
}
