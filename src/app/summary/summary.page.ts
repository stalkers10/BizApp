import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { DatabaseService } from '../services/database';
import { Transaction } from '../models/transaction.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.page.html',
  styleUrls: ['./summary.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class SummaryPage implements OnInit, OnDestroy {
  totalIncome = 0;
  totalExpense = 0;
  netBalance = 0;
  categories: { category: string; total: number }[] = [];
  
  private sub!: Subscription;

  constructor(private dbService: DatabaseService) {}

  ngOnInit() {
    // Subscribe to the transaction stream
    this.sub = this.dbService.transactions$.subscribe(txns => {
      this.calculateSummary(txns);
    });
  }

  // Always unsubscribe to prevent memory leaks
  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }

  calculateSummary(txns: Transaction[]) {
    this.totalIncome = txns
      .filter(t => t.type === 'Income')
      .reduce((sum, t) => sum + t.amount, 0);

    this.totalExpense = txns
      .filter(t => t.type === 'Expense')
      .reduce((sum, t) => sum + t.amount, 0);

    this.netBalance = this.totalIncome - this.totalExpense;

    // Group by category
    const catMap = new Map<string, number>();
    txns.forEach(t => {
      const current = catMap.get(t.category) || 0;
      catMap.set(t.category, current + t.amount);
    });

    this.categories = Array.from(catMap.entries()).map(([category, total]) => ({
      category,
      total
    }));
  }
}