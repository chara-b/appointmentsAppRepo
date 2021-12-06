import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class DataserviceService {

private LabelNameBehaviorSubject = new BehaviorSubject<any>('Default Name');
currentLabelName = this.LabelNameBehaviorSubject.asObservable();

  constructor() { }

changeValueOfLabelName(msg: any) {
  this.LabelNameBehaviorSubject.next(msg);
}

}
