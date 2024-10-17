import { RouterModule, Routes } from '@angular/router';
import { CallComponent } from './call/call.component';
import { HomeComponent } from './home/home.component';
import { NgModule } from '@angular/core';
import { CallSchedulerComponent } from './call-scheduler/call-scheduler.component';

export const routes: Routes = [
    {path: 'call/:name/:role/:user_id', component: CallComponent},
    {path: 'home', component: CallSchedulerComponent},
    { path: '', redirectTo: 'home', pathMatch: 'full' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
  })
  export class AppRoutingModule {}
