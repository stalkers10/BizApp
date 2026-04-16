import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular'; // Import the full IonicModule for tabs
import { DatabaseService } from '../services/database';
import { addIcons } from 'ionicons';
import { listOutline, documentTextOutline, pieChartOutline } from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule] // Simplest way to ensure icons render
})
export class TabsPage implements OnInit {
  constructor(private dbService: DatabaseService) {
    addIcons({listOutline, documentTextOutline, pieChartOutline});
  }

  async ngOnInit() {
    await this.dbService.initDB();
  }
}