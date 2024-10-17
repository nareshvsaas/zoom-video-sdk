import { Component, Inject, PLATFORM_ID, signal } from '@angular/core';
import { KJUR } from 'jsrsasign';
// import { ZoomSdkService } from '../zoom-sdk.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-call',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './call.component.html',
  styleUrl: './call.component.css'
})
export class CallComponent {

  client: any;
  isBrowser: boolean;
  sessionName: string = "Session 2";

  isVideoMuted: boolean = true;
  isAudioMuted: boolean = true;
  sub: any;

  name: string = "";
  role: number = 0;
  user_id: string = "";

  private chatMessageSubject = new Subject<string>();

  messages: string[] = [];
  newMessage: string = '';
  isChatVisible: boolean = false;
  zoom_user_id: string = 'USER_ID'; 

  userVideos: string[] = [
  ];
  videosPerPage: number = 4; // Default number of videos per page
  currentPage: number = 1;

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private route: ActivatedRoute) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.sub = this.route.params.subscribe(params => {
      this.name= params['name'];
      this.user_id= params['user_id'];
      var roleparam = params['role'];
      if(roleparam == "host")
        this.role=1;
      else
        this.role=0;
    });
    console.log("In call component");
    this.joinMeeting();
  }

  async joinMeeting() {
    const jwtToken = this.generateVideoSdkApiJwt("iCjNmlJ0tHuA5k6qM3y7S1Vo4hjO0VyyoCXV", "ulaqib8IDthk6SQaT4GiNKFkbAfzMHjQ12x8");
    const ZoomVideo = (await import('@zoom/videosdk')).default;
    this.client = ZoomVideo.createClient();
    this.setupEventListeners();

    this.client.init('en-US', 'Global', { patchJsMedia: true }).then(async () => {
      await this.client.join(this.sessionName, jwtToken, this.name, '');

      const mediaStream = this.client.getMediaStream();
      await mediaStream.startAudio();
      await mediaStream.startVideo();

      console.log("Current User Id: " + this.client.getCurrentUserInfo().userId);
      this.updateUserVideos();
    });
  }

  updateUserVideos() {
    this.userVideos = this.client.getAllUser().map((user: { userId: any; }) => user.userId);
    console.log("Total number of users: " + this.userVideos.length);

    // Use setTimeout to ensure DOM has time to render
    setTimeout(() => {
      const mediaStream = this.client.getMediaStream();

      this.userVideos.forEach(userId => {
        const user = this.client.getAllUser().find((u: { userId: string; }) => u.userId === userId);
        if (user && user.bVideoOn) {
          mediaStream.attachVideo(userId, 3).then(() => {
            const videoElement = document.getElementById(userId);
            if (videoElement) {
              mediaStream.renderVideo(videoElement, userId);
            } else {
              console.error(`Video element for user ${userId} not found.`);
            }
          });
        }
      });
    }, 0); // Delay execution to ensure DOM is updated
  }


  async onCameraClick() {
    const mediaStream = this.client.getMediaStream();
    if (!this.isVideoMuted) {
      await mediaStream.startVideo();
      this.isVideoMuted = true;
      // await this.client.renderVideo({
      //   action: "Start", 
      //   userId: this.client.getCurrentUserInfo().userId
      // });
    } else {
      await mediaStream.stopVideo();
      this.isVideoMuted = false;
      // await this.client.renderVideo({
      //   action: "Stop", 
      //   userId: this.client.getCurrentUserInfo().userId
      // });
    }
  }

  async onMicrophoneClick() {
    const mediaStream = this.client.getMediaStream();
    this.isAudioMuted ? await mediaStream?.unmuteAudio() : await mediaStream?.muteAudio();
    this.isAudioMuted = this.client.getCurrentUserInfo().muted ?? true;
  };


  // https://www.npmjs.com/package/jsrsasign
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
      tpc: this.sessionName,
      role_type: this.role
    };

    const sHeader = JSON.stringify(oHeader);
    const sPayload = JSON.stringify(oPayload);

    // Sign the JWT using HS256 and return the token
    const videosdkApiToken = KJUR.jws.JWS.sign('HS256', sHeader, sPayload, sdkApiSecret);
    console.log(videosdkApiToken);

    return videosdkApiToken;
  }


  setupEventListeners(): void {
    this.client.on('user-added', (payload: any) => {
      console.log(payload[0].userId + ' joined the session');
    });

    // Optionally, you can handle other events as well
    this.client.on('user-removed', (payload: any) => {
      console.log(payload[0].userId + ' left the session');
    });

    this.client.on('chat-on-message', (payload: any) => {
      console.log(payload)
      console.log(`Message: ${payload.message}, from ${payload.sender.name} to ${payload.receiver.name}`);
      if(this.client.getCurrentUserInfo().userId == payload.sender.userId)
        this.messages.push( "Me: " + payload.message);
      else
      this.messages.push(payload.sender.name + ": " + payload.message);
    })
  }



  toggleChat() {
    this.isChatVisible = !this.isChatVisible;
  }

  sendMessage() {
    const chat = this.client.getChatClient();
    if (this.newMessage.trim()) {
      chat.sendToAll(this.newMessage);
      // this.messages.push(this.newMessage);
      this.newMessage = '';
    }
  }

   // Update this method to change videos per row based on user selection

   get paginatedVideos() {
    const startIndex = (this.currentPage - 1) * this.videosPerPage;
    return this.userVideos.slice(startIndex, startIndex + this.videosPerPage);
  }

  totalPages(): number {
    return Math.ceil(this.userVideos.length / this.videosPerPage);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage = page;
    }
  }

  updateVideosPerPage() {
    this.currentPage = 1; // Reset to first page when changing videos per page
  }
}
