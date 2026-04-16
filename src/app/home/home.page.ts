import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DatabaseService } from '../services/database';
import { Transaction } from '../models/transaction.model';
import { Observable } from 'rxjs';
import { addIcons } from 'ionicons';
import { add } from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class HomePage implements OnInit {
  // Use the observable from the service directly
  transactions$: Observable<Transaction[]>;
  isModalOpen = false;

  newTxn: any = {
    type: 'Income',
    amount: null, // Start with null for cleaner placeholder behavior
    dateStr: new Date().toISOString(),
    description: '',
    category: 'Sales'
  };

  constructor(private dbService: DatabaseService) {
    // Assign the stream from the service
    this.transactions$ = this.dbService.transactions$;
    addIcons({ add });
  }

  async ngOnInit() {
    // Database initialization is handled in AppComponent or TabsPage
    // but we ensure the initial data is fetched
    await this.dbService.refresh();
  }

  openAddModal() {
    this.newTxn = {
      type: 'Income',
      amount: null,
      dateStr: new Date().toISOString(),
      description: '',
      category: 'Sales'
    };
    this.isModalOpen = true;
  }

 async addTransaction() {
  console.log('Save button clicked!', this.newTxn);

  if (!this.newTxn.description || !this.newTxn.amount || this.newTxn.amount <= 0) {
   console.warn('Validation failed: fill all fields correctly');
    return;
  }

  try {
    const txn: Omit<Transaction, 'id'> = {
      type: this.newTxn.type,
      amount: Number(this.newTxn.amount),
      date: new Date(this.newTxn.dateStr).getTime(),
      description: this.newTxn.description,
      category: this.newTxn.category
    };

    await this.dbService.addTransaction(txn);
    console.log('Transaction saved successfully!');
    this.isModalOpen = false;
  } catch (error) {
    console.error('Error saving to DB:', error);
    alert('Database Error: ' + JSON.stringify(error));
  }
}

  async deleteTxn(id: number) {
    if (confirm('Delete this transaction?')) {
      await this.dbService.deleteTransaction(id);
      // No need to call loadTransactions()!
    }
  }
}