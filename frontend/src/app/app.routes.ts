import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { GrievanceAssistantComponent } from './components/grievance/grievance.component';
import { SchemesFinderComponent } from './components/schemes/schemes.component';
import { EarningsCalculatorComponent } from './components/earnings/earnings.component';
import { SafetySupportComponent } from './components/safety/safety.component';
import { MyCasesComponent } from './components/cases/cases.component';
import { LoginComponent } from './components/auth/login/login.component';
import { SignupComponent } from './components/auth/signup/signup.component';
import { authGuard, guestGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'signup', component: SignupComponent, canActivate: [guestGuard] },
  { path: 'complaint', component: GrievanceAssistantComponent },
  { path: 'schemes', component: SchemesFinderComponent },
  { path: 'earnings', component: EarningsCalculatorComponent, canActivate: [authGuard] },
  { path: 'safety', component: SafetySupportComponent },
  { path: 'cases', component: MyCasesComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
