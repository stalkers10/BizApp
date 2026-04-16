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
  
  // Array for displaying category breakdown in the UI
  categoryTotals: { name: string; value: number; percentage: number }[] = [];
  
  private sub!: Subscription;

  constructor(private dbService: DatabaseService) {}

  ngOnInit() {
    this.sub = this.dbService.transactions$.subscribe(txns => {
      this.calculateSummary(txns);
    });
  }

  calculateSummary(txns: Transaction[]) {
    // 1. Calculate Totals
    this.totalIncome = txns
      .filter(t => t.type === 'Income')
      .reduce((sum, t) => sum + t.amount, 0);

    this.totalExpense = txns
      .filter(t => t.type === 'Expense')
      .reduce((sum, t) => sum + t.amount, 0);

    this.netBalance = this.totalIncome - this.totalExpense;

    // 2. Calculate Category Breakdown
    const groupMap = new Map<string, number>();
    txns.forEach(t => {
      const current = groupMap.get(t.category) || 0;
      groupMap.set(t.category, current + t.amount);
    });

    // 3. Convert Map to Array for *ngFor and calculate percentages
    const grandTotal = this.totalIncome + this.totalExpense;
    this.categoryTotals = Array.from(groupMap.entries()).map(([name, value]) => ({
      name,
      value,
      percentage: grandTotal > 0 ? (value / grandTotal) : 0
    })).sort((a, b) => b.value - a.value); // Sort highest spenders first
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}