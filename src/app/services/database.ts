import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Transaction } from '../models/transaction.model';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private sqlite: SQLiteConnection;
  private db!: SQLiteDBConnection;
  private readonly DB_NAME = 'smallbiz_ledger.db';
  private isWeb = false;
  private readonly WEB_STORAGE_KEY = 'smallbiz_transactions';

  private _transactions = new BehaviorSubject<Transaction[]>([]);
  public transactions$ = this._transactions.asObservable();

  constructor(private platform: Platform) {
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
  }

  async initDB() {
    await this.platform.ready();

    // Use localStorage fallback on web — SQLite plugin doesn't work in browser
    this.isWeb = !this.platform.is('hybrid');

    if (this.isWeb) {
      console.log('[DB] Running in web mode — using localStorage fallback');
      await this.refresh();
      return;
    }

    // Native (Android / iOS) — use real SQLite
    if (this.db) return;

    try {
      this.db = await this.sqlite.createConnection(
        this.DB_NAME, false, 'no-encryption', 1, false
      );
      await this.db.open();
      await this.db.execute(`
        CREATE TABLE IF NOT EXISTS transactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          type TEXT NOT NULL,
          amount REAL NOT NULL,
          date INTEGER NOT NULL,
          description TEXT,
          category TEXT NOT NULL
        );
      `);
      await this.refresh();
    } catch (error) {
      console.error('[DB] SQLite init error:', error);
      throw error; // surface the real error instead of swallowing it
    }
  }

  private async ensureOpen() {
    if (this.isWeb) return; // localStorage needs no "open"
    if (!this.db) await this.initDB();
    const isOpen = await this.db.isDBOpen();
    if (!isOpen.result) await this.db.open();
  }

  // ─── Web localStorage helpers ───────────────────────────────────────────────

  private webGetAll(): Transaction[] {
    try {
      const raw = localStorage.getItem(this.WEB_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private webSaveAll(txns: Transaction[]): void {
    localStorage.setItem(this.WEB_STORAGE_KEY, JSON.stringify(txns));
  }

  private webNextId(txns: Transaction[]): number {
    return txns.length === 0 ? 1 : Math.max(...txns.map(t => t.id ?? 0)) + 1;
  }

  // ─── Public API (works on both web and native) ───────────────────────────────

  async refresh() {
    if (this.isWeb) {
      const txns = this.webGetAll().sort((a, b) => b.date - a.date);
      this._transactions.next(txns);
      return;
    }
    await this.ensureOpen();
    const res = await this.db.query(`SELECT * FROM transactions ORDER BY date DESC;`);
    this._transactions.next(res.values || []);
  }

  async addTransaction(txn: Omit<Transaction, 'id'>) {
    if (this.isWeb) {
      const all = this.webGetAll();
      const newTxn: Transaction = { ...txn, id: this.webNextId(all) };
      all.push(newTxn);
      this.webSaveAll(all);
      await this.refresh();
      return;
    }
    await this.ensureOpen();
    const query = `INSERT INTO transactions (type, amount, date, description, category) VALUES (?, ?, ?, ?, ?);`;
    await this.db.run(query, [txn.type, txn.amount, txn.date, txn.description, txn.category]);
    await this.refresh();
  }

  async deleteTransaction(id: number) {
    if (this.isWeb) {
      const all = this.webGetAll().filter(t => t.id !== id);
      this.webSaveAll(all);
      await this.refresh();
      return;
    }
    await this.ensureOpen();
    await this.db.run(`DELETE FROM transactions WHERE id = ?;`, [id]);
    await this.refresh();
  }

  async getTransactionsByDateRange(start: number, end: number): Promise<Transaction[]> {
    if (this.isWeb) {
      return this.webGetAll()
        .filter(t => t.date >= start && t.date <= end)
        .sort((a, b) => b.date - a.date);
    }
    await this.ensureOpen();
    const res = await this.db.query(
      `SELECT * FROM transactions WHERE date BETWEEN ? AND ? ORDER BY date DESC;`,
      [start, end]
    );
    return res.values || [];
  }
}