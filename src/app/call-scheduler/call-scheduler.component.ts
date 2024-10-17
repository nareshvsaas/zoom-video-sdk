import { Component } from '@angular/core';
import { DBServiceService } from '../dbservice.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-call-scheduler',
  standalone: true,
  imports: [HttpClientModule, FormsModule, CommonModule],
  templateUrl: './call-scheduler.component.html',
  styleUrl: './call-scheduler.component.css'
})
export class CallSchedulerComponent {
  userID: any  = "7922fff2-9865-481a-a95b-45c29068aa53";
  currentMonth: any = "September/2024";
  timezone: any = "Asia/Calcutta";
  SERVER_LINK: string = "https://demo.1o1fitness.com/trainerservice/api/trainer";

  daysdata: any;
  name: string = "";
  role: string = "";
  user_id: string = "";
  constructor(private db_service: DBServiceService, private http: HttpClient, private route: Router){

  }
  
  ngOnInit() {
    this.getSchedulerDataFromServer();
  }

  getSchedulerDataFromServer() {
    var index = '/scheduler/slots';
    var data = {
      "trainerId": this.userID,
      "month": this.currentMonth,
      "timezone": this.timezone,
    }
    this.http.post(this.SERVER_LINK + index, data).subscribe(
      (response:any) => {
        this.daysdata = response.data;
        this.daysdata = this.daysdata.filter((data: any) => data.participants.length > 0 && data.status=='open');
      },
      error => {
        console.log("An error has occurred while retriving profile data.");
      }
    )
  }

  onJoinRoom(slotId: string, name: string, trainee_id: string){
    this.name = name;
    this.user_id = trainee_id; 
    console.log(this.name + "   " + this.role);
    this.route.navigate(['call/'+this.name +'/' + this.role + '/' + this.user_id])
  }

  joinMeeting(){
    console.log(this.name + "   " + this.role);
    this.route.navigate(['call/'+this.name +'/' + this.role+ '/' + this.userID])
    }
}
