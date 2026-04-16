import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { DatabaseService } from './services/database';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
  providers: [DatabaseService]
})
export class AppComponent implements OnInit {
  constructor(private databaseService: DatabaseService) {
    this.initializeDatabase();
  }

  async ngOnInit() {
    await this.databaseService.initDB();
  }

  private async initializeDatabase() {
    try {
      await this.databaseService.initDB();
    } catch (error) {
      console.error('Failed to initialize database:', error);
    }
  }
}
