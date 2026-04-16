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
  
  // Reactive data stream
  private _transactions = new BehaviorSubject<Transaction[]>([]);
  public transactions$ = this._transactions.asObservable();

  constructor(private platform: Platform) {
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
  }

  async initDB() {
    if (this.db) return;
    await this.platform.ready();
    try {
      this.db = await this.sqlite.createConnection(this.DB_NAME, false, 'no-encryption', 1, false);
      await this.db.open();
      const createTable = `
        CREATE TABLE IF NOT EXISTS transactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          type TEXT NOT NULL,
          amount REAL NOT NULL,
          date INTEGER NOT NULL,
          description TEXT,
          category TEXT NOT NULL
        );
      `;
      await this.db.execute(createTable);
      await this.refresh(); // Initial load
    } catch (error) {
      console.error('Database init error:', error);
    }
  }

  private async ensureOpen() {
    if (!this.db) await this.initDB();
    const isOpen = await this.db.isDBOpen();
    if (!isOpen.result) await this.db.open();
  }

  // Updates the BehaviorSubject stream
  async refresh() {
    await this.ensureOpen();
    const res = await this.db.query(`SELECT * FROM transactions ORDER BY date DESC;`);
    this._transactions.next(res.values || []);
  }

  async addTransaction(txn: Omit<Transaction, 'id'>) {
    await this.ensureOpen();
    const query = `INSERT INTO transactions (type, amount, date, description, category) VALUES (?, ?, ?, ?, ?);`;
    await this.db.run(query, [txn.type, txn.amount, txn.date, txn.description, txn.category]);
    await this.refresh(); 
  }

  async deleteTransaction(id: number) {
    await this.ensureOpen();
    await this.db.run(`DELETE FROM transactions WHERE id = ?;`, [id]);
    await this.refresh();
  }

  async getTransactionsByDateRange(start: number, end: number): Promise<Transaction[]> {
    await this.ensureOpen();
    const res = await this.db.query(`SELECT * FROM transactions WHERE date BETWEEN ? AND ? ORDER BY date DESC;`, [start, end]);
    return res.values || [];
  }
}