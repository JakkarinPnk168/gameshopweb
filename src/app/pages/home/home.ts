import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, UserData } from '../../services/auth.service';
import { Header } from '../header/header';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, Header],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class Home {
  user: UserData | null = null;

  constructor(private auth: AuthService) {
    this.auth.user$.subscribe(u => this.user = u);
  }
}
