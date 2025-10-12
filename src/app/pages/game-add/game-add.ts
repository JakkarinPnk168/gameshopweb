import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GameService } from '../../services/game.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-game',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './game-add.html',
  styleUrls: ['./game-add.scss']
})
export class GameAdd implements OnInit {
  name = '';
  price: number | null = null;
  categoryId = '';
  description = '';
  imageFile?: File;
  previewUrl: string | ArrayBuffer | null = null;
  categories: any[] = [];
  loading = false;
  message = '';

  constructor(
    private gameService: GameService,
    private router: Router
  ) {}

  ngOnInit() {
    this.gameService.getCategories().subscribe({
      next: (cats) => (this.categories = cats || []),
      error: () => (this.message = '❌ โหลดประเภทเกมไม่สำเร็จ')
    });
  }

  /** ✅ เมื่อเลือกไฟล์ ให้แสดงตัวอย่างทันที */
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.imageFile = file;
      const reader = new FileReader();
      reader.onload = () => (this.previewUrl = reader.result);
      reader.readAsDataURL(file);
    }
  }

  /** ✅ เมื่อกด "บันทึก" */
  addGame() {
    if (!this.name || !this.price || !this.categoryId || !this.imageFile) {
      this.message = '⚠️ กรุณากรอกข้อมูลและเลือกรูปภาพให้ครบ';
      return;
    }

    const formData = new FormData();
    formData.append('name', this.name);
    formData.append('price', String(this.price));
    formData.append('categoryId', this.categoryId);
    formData.append('description', this.description);
    formData.append('image', this.imageFile);

    this.loading = true;

    this.gameService.addGame(formData).subscribe({
      next: (res: any) => {
        this.loading = false;

        if (res && res.success) {
          Swal.fire({
            icon: 'success',
            title: 'เพิ่มเกมสำเร็จ!',
            showConfirmButton: false,
            timer: 1500
          }).then(() => {
            // ✅ กลับไปหน้า game-manage พร้อมสั่งให้ reload ข้อมูลใหม่
            this.router.navigate(['/game-manage'], {
              state: { refresh: true } // ส่ง flag ไปให้หน้า game-manage โหลดใหม่
            });
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'เพิ่มเกมไม่สำเร็จ',
            text: res?.message || 'เกิดข้อผิดพลาดในระบบ'
          });
        }
      },
      error: (err) => {
        console.error('❌ Error adding game:', err);
        this.loading = false;
        Swal.fire({
          icon: 'error',
          title: 'เพิ่มเกมไม่สำเร็จ',
          text: 'เกิดข้อผิดพลาดในระบบ'
        });
      }
    });
  }
}
