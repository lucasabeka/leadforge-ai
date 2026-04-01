import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app-sidebar.component.html',
  styleUrls: ['./app-sidebar.component.scss']
})
export class AppSidebarComponent implements OnInit {
  open = false;
  credits = 0;
  userEmail = '';
  userInitial = '';

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.credits = user.credits ?? 0;
        this.userEmail = user.email ?? '';
        this.userInitial = (user.name || user.email || 'U')[0].toUpperCase();
      }
    });
  }

  logout() {
    this.authService.logout();
  }
}
