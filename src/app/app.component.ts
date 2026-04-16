import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { DatabaseService } from './services/database';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet]
})
export class AppComponent implements OnInit {
  constructor(private databaseService: DatabaseService) {}

  async ngOnInit() {
    await this.databaseService.initDB();
  }
}