import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, Platform } from '@ionic/angular';
import { DatabaseService } from '../services/database';
import * as XLSX from 'xlsx';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

@Component({
  selector: 'app-report',
  templateUrl: './report.page.html',
  styleUrls: ['./report.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ReportPage {
  startDate: string = '';
  endDate: string = '';
  message = '';
  messageColor = 'medium';

  constructor(private dbService: DatabaseService, private platform: Platform) {}

  async exportToExcel() {
    if (!this.startDate || !this.endDate) return;

    const start = new Date(this.startDate).getTime();
    const end = new Date(this.endDate).getTime() + 86400000 - 1;

    try {
      const transactions = await this.dbService.getTransactionsByDateRange(start, end);

      if (transactions.length === 0) {
        this.message = 'No data found for these dates.';
        this.messageColor = 'danger';
        return;
      }

      const excelData = transactions.map(t => ({
        Date: new Date(t.date).toLocaleDateString(),
        Type: t.type,
        Category: t.category,
        Amount: t.amount,
        Description: t.description
      }));

      const ws = XLSX.utils.json_to_sheet(excelData);
      ws['!cols'] = [{ wch: 12 }, { wch: 10 }, { wch: 15 }, { wch: 10 }, { wch: 35 }];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Transactions');

      // Use 'array' type for both platforms — gives us a Uint8Array
      const wbout: ArrayBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const fileName = `Report_${new Date().toISOString().slice(0, 10)}.xlsx`;

      if (this.platform.is('hybrid')) {
        // ✅ Correct base64 encoding for binary data (no Encoding.UTF8 — that corrupts xlsx)
        const base64 = btoa(
          new Uint8Array(wbout).reduce((data, byte) => data + String.fromCharCode(byte), '')
        );

        const savedFile = await Filesystem.writeFile({
          path: fileName,
          data: base64,
          directory: Directory.Cache
          // ✅ No encoding property — omitting it tells Capacitor the data is base64 binary
        });

        await Share.share({
          title: 'Business Report',
          text: 'Exported transaction report.',
          url: savedFile.uri,
          dialogTitle: 'Share Report'
        });

        this.message = '✅ Exported and ready to share.';
      } else {
        // Web: trigger browser download
        const blob = new Blob([wbout], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(url);
        this.message = '✅ Downloaded successfully.';
      }

      this.messageColor = 'success';
    } catch (err) {
      console.error('[Export] Error:', err);
      this.message = `Export failed: ${err instanceof Error ? err.message : JSON.stringify(err)}`;
      this.messageColor = 'danger';
    }
  }
}