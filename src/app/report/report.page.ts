import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, Platform } from '@ionic/angular';
import { DatabaseService } from '../services/database';
import * as XLSX from 'xlsx';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
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

    const transactions = await this.dbService.getTransactionsByDateRange(start, end);
    if (transactions.length === 0) {
      this.message = 'No data found for these dates.';
      this.messageColor = 'warning';
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
    
    // Autofit column widths
    ws['!cols'] = [{ wch: 12 }, { wch: 10 }, { wch: 15 }, { wch: 10 }, { wch: 35 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const fileName = `Report_${new Date().toISOString().slice(0,10)}.xlsx`;

    try {
      if (this.platform.is('hybrid')) {
        const base64 = btoa(new Uint8Array(wbout).reduce((data, byte) => data + String.fromCharCode(byte), ''));
        
        const savedFile = await Filesystem.writeFile({
          path: fileName,
          data: base64,
          directory: Directory.Cache, // Using Cache makes sharing easier on some OS
          encoding: Encoding.UTF8
        });

        // Trigger native share sheet
        await Share.share({
          title: 'Business Report',
          text: 'Here is the exported transaction report.',
          url: savedFile.uri,
          dialogTitle: 'Share Report'
        });

        this.message = '✅ Exported and ready to share.';
      } else {
        // Web Download logic
        const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        this.message = '✅ Downloaded successfully.';
      }
      this.messageColor = 'success';
    } catch (err) {
      this.message = 'Export failed.';
      this.messageColor = 'danger';
    }
  }
}