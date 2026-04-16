import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Transaction } from '../models/transaction.model';
import{Platform} from '@ionic/angular';
@Injectable({
  providedIn: 'root',
})
export class Export {
  constructor(private platform: Platform) {}
  async exportToExcel(transactions: Transaction[], fileName = 'transactions.xlsx') {
  if (transactions.length === 0) {
    alert('No transactions in the selected range.');
    return;
  }

  const data = transactions.map(t => ({
    ID: t.id,
    Type: t.type,
    Amount: t.amount,
    Date: new Date(t.date).toLocaleDateString(),
    Description: t.description,
    Category: t.category
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Transactions');

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

  // For web + mobile (Capacitor)
  try {
    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    if (this.platform.is('hybrid')) {
      // Mobile: save to Documents / Downloads
      const fileNameWithExt = fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`;
      await Filesystem.writeFile({
        path: fileNameWithExt,
        data: Array.from(new Uint8Array(wbout)).map(b => String.fromCharCode(b)).join(''),
        directory: Directory.Documents,
        encoding: Encoding.UTF8
      });
      alert(`File saved to Documents folder: ${fileNameWithExt}`);
    } else {
      // Web: trigger download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);
    }
  } catch (e) {
    console.error('Export error', e);
  }
}
}
