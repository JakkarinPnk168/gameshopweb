import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../main/header/header';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, Header],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class Home {}
