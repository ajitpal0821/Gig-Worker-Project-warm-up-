import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { AppComponent } from './app.component';
import { I18nService } from './services/i18n.service';
import { StorageService } from './services/storage.service';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        I18nService,
        StorageService
      ]
    }).compileComponents();
  });

  it('should create the Saathi root app component', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should initialize i18n service and default language', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.i18n).toBeTruthy();
    expect(['en', 'hi', 'pa']).toContain(app.i18n.currentLanguage());
  });

  it('should initialize local storage service', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.storage).toBeTruthy();
  });
});
