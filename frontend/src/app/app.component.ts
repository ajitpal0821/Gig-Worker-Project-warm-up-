import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { I18nService } from './services/i18n.service';
import { StorageService } from './services/storage.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  i18n = inject(I18nService);
  storage = inject(StorageService);

  clearedToast = false;

  handleClearData(): void {
    const msg = this.i18n.currentLanguage() === 'hi'
      ? 'क्या आप लोकल स्टोरेज से सभी केस और कमाई रिकॉर्ड हटाना चाहते हैं?'
      : 'Clear all locally stored demo cases and earnings records?';
    if (confirm(msg)) {
      this.storage.clearAllData();
      this.clearedToast = true;
      setTimeout(() => (this.clearedToast = false), 3000);
    }
  }
}
