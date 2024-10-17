import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  name:string ='';
  role:string = '';
  constructor(private route: Router){

  }
joinMeeting(){
console.log(this.name + "   " + this.role);
this.route.navigate(['call/'+this.name +'/' + this.role])
}
}
