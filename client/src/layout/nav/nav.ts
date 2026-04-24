import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../core/services/account-service';
import { Router, RouterLink, RouterLinkActive } from "@angular/router";
import { ToastService } from '../../core/services/toast-service';
import { themes } from './theme';
import { BusyService } from '../../core/services/busy-service';

@Component({
  selector: 'app-nav',
  imports: [FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './nav.html',
  styleUrl: './nav.css',
})
export class Nav implements OnInit {
  ngOnInit(): void {
    document.documentElement.setAttribute('data-theme', this.selectedTheme());
  }
  protected accountService = inject(AccountService);
  protected busyService = inject(BusyService);
  protected creds: any = {}
  private toast = inject(ToastService);
  private router = inject(Router);
  protected themes = themes;
  protected selectedTheme = signal<string>(
    localStorage.getItem('data-theme') || 'light'
  );

  handleSelectTheme(theme: string) {
    this.selectedTheme.set(theme);
    localStorage.setItem('data-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }
  login() {
    this.accountService.login(this.creds).subscribe({
      next: () => {
        this.router.navigateByUrl('/members');
        this.toast.success('Logged in successfully');
        this.creds = {};
      },
      error: error => {
        this.toast.error(error.error);
      }
    });
  }

  logout() {
    this.accountService.logout();
  }
}
