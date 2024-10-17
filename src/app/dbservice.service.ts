import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DBServiceService {
  SERVER_LINK: string = "https://demo.1o1fitness.com/trainerservice/api/trainer";

  constructor() { }

  // getData(data: any, index: any): Observable<any> {
  //   return this.http.post(this.SERVER_LINK + index, data);
  // }
}
