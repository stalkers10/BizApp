import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DatabaseService } from '../services/database';
import { Transaction } from '../models/transaction.model';
import { Observable } from 'rxjs';
import { addIcons } from 'ionicons';
import { add, trashOutline } from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class HomePage implements OnInit {
  transactions$: Observable<Transaction[]>;
  isModalOpen = false;

  newTxn: any = {
    type: 'Income',
    amount: null,
    dateStr: new Date().toISOString(),
    description: '',
    category: 'Sales'
  };

  constructor(private dbService: DatabaseService) {
    this.transactions$ = this.dbService.transactions$;
    addIcons({ add, trashOutline });
  }

  async ngOnInit() {
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
    if (!this.newTxn.description || !this.newTxn.amount || this.newTxn.amount <= 0) {
      console.warn('Validation failed: fill all fields');
      return;
    }
    const txn: Omit<Transaction, 'id'> = {
      type: this.newTxn.type,
      amount: Number(this.newTxn.amount),
      date: new Date(this.newTxn.dateStr).getTime(),
      description: this.newTxn.description,
      category: this.newTxn.category
    };
    await this.dbService.addTransaction(txn);
    this.isModalOpen = false;
  }

  async deleteTxn(id: number) {
    if (confirm('Delete this transaction?')) {
      await this.dbService.deleteTransaction(id);
    }
  }

  getNet(txns: Transaction[]): number {
    return txns.reduce((sum, t) => t.type === 'Income' ? sum + t.amount : sum - t.amount, 0);
  }

  getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      Sales: '📈',
      Marketing: '📣',
      Salary: '💼',
      Utility: '⚡',
      Logistic: '🚚',
      Purchase: '🛒'
    };
    return icons[category] ?? '💰';
  }
}