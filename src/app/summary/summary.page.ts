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
  categories: { category: string; total: number; percentage: number }[] = [];

  private sub!: Subscription;

  constructor(private dbService: DatabaseService) {}

  ngOnInit() {
    this.sub = this.dbService.transactions$.subscribe(txns => {
      this.calculateSummary(txns);
    });
  }

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

    const catMap = new Map<string, number>();
    txns.forEach(t => {
      catMap.set(t.category, (catMap.get(t.category) || 0) + t.amount);
    });

    const grandTotal = Array.from(catMap.values()).reduce((s, v) => s + v, 0);

    this.categories = Array.from(catMap.entries())
      .map(([category, total]) => ({
        category,
        total,
        percentage: grandTotal > 0 ? (total / grandTotal) * 100 : 0
      }))
      .sort((a, b) => b.total - a.total);
  }

  getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      Sales: '📈', Marketing: '📣', Salary: '💼',
      Utility: '⚡', Logistic: '🚚', Purchase: '🛒'
    };
    return icons[category] ?? '💰';
  }
}