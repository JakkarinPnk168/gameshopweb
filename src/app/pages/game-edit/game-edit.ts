import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GameService, Game } from '../../services/game.service';
import Swal from 'sweetalert2';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-game-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './game-edit.html',
  styleUrls: ['./game-edit.scss']
})
export class GameEdit implements OnInit {
  gameId = '';
  game: Game = {
    name: '',
    price: 0,
    categoryId: '',
    description: ''
  };

  categories: any[] = [];
  selectedFile?: File;
  previewImage: string | ArrayBuffer | null = null;
  loading = false;
  message = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private gameService: GameService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // ✅ รับ id จาก URL
    this.gameId = this.route.snapshot.paramMap.get('id') || '';

    // ✅ โหลดหมวดหมู่ทั้งหมด
    this.gameService.getCategories().subscribe({
      next: (data) => (this.categories = data),
      error: () => (this.message = 'โหลดหมวดหมู่ไม่สำเร็จ')
    });

    // ✅ โหลดข้อมูลเกมที่ต้องการแก้ไข
    this.loadGameData();
  }

  loadGameData() {
  this.loading = true;
  console.log('🚀 เริ่มโหลดข้อมูลเกม...');

  this.gameService.getGameById(this.gameId)
    .pipe(
      finalize(() => {
        this.loading = false;
        this.cd.detectChanges(); // ✅ บังคับให้ Angular render
        console.log('🟢 โหลดเสร็จ -> render UI ใหม่');
      })
    )
    .subscribe({
      next: (data) => {
        console.log('✅ ได้ข้อมูลจาก API:', data);
        this.game = data;
        this.previewImage = data.imageUrl || null;
      },
      error: (err) => {
        console.error('❌ โหลดข้อมูลเกมล้มเหลว:', err);
        Swal.fire({
          icon: 'error',
          title: 'ไม่พบข้อมูลเกม',
          text: err.error?.message || 'เกิดข้อผิดพลาดในระบบ',
          confirmButtonColor: '#e74c3c'
        });
        this.router.navigate(['/game-manage']);
      }
    });
}




  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => (this.previewImage = e.target?.result || null);
    reader.readAsDataURL(this.selectedFile!);
  }

  onSubmit() {
  if (!this.game.name || !this.game.price || !this.game.categoryId) {
    Swal.fire({
      icon: 'warning',
      title: 'กรุณากรอกข้อมูลให้ครบ',
      confirmButtonColor: '#e74c3c'
    });
    return;
  }

  // 🔹 แสดง SweetAlert เพื่อยืนยันก่อนบันทึก
  Swal.fire({
    title: 'ยืนยันการบันทึก?',
    text: 'คุณแน่ใจหรือไม่ว่าต้องการบันทึกการเปลี่ยนแปลงนี้',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'บันทึก',
    cancelButtonText: 'ยกเลิก',
    confirmButtonColor: '#27ae60',
    cancelButtonColor: '#7f8c8d'
  }).then((result) => {
    if (result.isConfirmed) {
      // ✅ ดำเนินการบันทึกจริงหลังจากผู้ใช้กดยืนยัน
      this.loading = true;
      const formData = new FormData();
      formData.append('name', this.game.name);
      formData.append('price', this.game.price.toString());
      formData.append('categoryId', this.game.categoryId);
      formData.append('description', this.game.description || '');
      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      }

      this.gameService.updateGame(this.gameId, formData).subscribe({
        next: () => {
          this.loading = false;
          Swal.fire({
            icon: 'success',
            title: 'อัปเดตเกมสำเร็จ!',
            text: `${this.game.name} ถูกแก้ไขเรียบร้อยแล้ว`,
            confirmButtonColor: '#27ae60'
          }).then(() => this.router.navigate(['/game-manage']));
        },
        error: (err) => {
          this.loading = false;
          Swal.fire({
            icon: 'error',
            title: 'อัปเดตไม่สำเร็จ',
            text: err.error?.message || 'เกิดข้อผิดพลาดในระบบ',
            confirmButtonColor: '#e74c3c'
          });
        }
      });
    }
  });
}


  goBack() {
  Swal.fire({
    title: 'คุณแน่ใจหรือไม่?',
    text: 'หากออกจากหน้านี้ การแก้ไขที่ยังไม่บันทึกจะหายไป!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'กลับ',
    cancelButtonText: 'ยกเลิก',
    confirmButtonColor: '#e74c3c',
    cancelButtonColor: '#7f8c8d'
  }).then((result) => {
    if (result.isConfirmed) {
      this.router.navigate(['/game-manage']);
    }
  });
}


}
