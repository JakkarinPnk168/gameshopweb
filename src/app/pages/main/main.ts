import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Header } from './header/header';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule, RouterModule, Header],
  templateUrl: './main.html',
  styleUrls: ['./main.scss']
})
export class Main {
  title = 'Welcome to GameShop';

  // ตัวอย่าง property สำหรับ binding
  description = 'ยินดีต้อนรับสู่เว็บขายเกม! เลือกเมนูด้านบนเพื่อเริ่มต้น';
}
