import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { User, UserPageResponse } from '../user.service'; 
import { Router } from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnInit {
  users: User[] = [];
  page = 0;
  size = 10;
  totalPages = 0;
  totalElements = 0;
  searchQuery: string = '';
  visiblePages: (number | '...')[] = [];

  constructor(private router : Router, private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  onSearch(): void {
  this.page = 0; // reset to first page
  this.loadUsers();
}

  loadUsers(): void {
    this.userService.getUserTable(this.page, this.size, this.searchQuery).subscribe({
      next: (res: UserPageResponse) => {
        this.users = res.content;
        this.totalPages = res.totalPages;
        this.totalElements = res.totalElements;
        this.updateVisiblePages();
      },
      error: (err) => console.error('Error loading users:', err)
    });
  }
  
  isValidBase64(image: string): boolean {
    const base64Pattern = /^data:image\/(png|jpeg|jpg|gif);base64,/;
    return base64Pattern.test(image);
  }

  viewProfile(user: User): void {
    this.router.navigate(['/dashboard', user.email]);
  }

  deleteUser(id: number): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(id).subscribe({
        next: (res) => {
          if (res) {
            alert('User deleted successfully.');
            this.loadUsers(); // refresh the table
          } else {
            alert('Failed to delete user.');
          }
        },
        error: (err) => {
          console.error('Error deleting user:', err);
          alert('An error occurred while deleting the user.');
        }
      });
    }
  }

  onDownloadCsv(): void {
    this.userService.downloadCsv().subscribe({
      next: blob => this.saveFile(blob, 'users.csv'),
      error: err => { console.error(err); alert('Download failed'); }
    });
  }

  private saveFile(data: Blob, filename: string) {
    const blob = new Blob([data], { type: data.type });
    const url  = window.URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  getUserInitials(name: string): string {
    if (!name) return '';
    const parts = name.trim().split(' ');
    return parts.map(p => p[0]).join('').toUpperCase().slice(0, 2);
  }

  /** Call after loading users to recalc visiblePages */
updateVisiblePages(): void {
  const total = this.totalPages;      // e.g. 20
  const curr  = this.page;            // 0-based
  const maxButtons = 8;               // always show up to 9 numeric buttons
  const pages: (number | '...')[] = [];

  if (total <= maxButtons) {
    // fewer pages than max — show all
    for (let i = 0; i < total; i++) pages.push(i);
  } else {
    const half = Math.floor(maxButtons / 2); // 4
    let start = curr - half;
    let end   = curr + half;

    // adjust when near the edges
    if (start < 1) {
      start = 1;
      end   = start + maxButtons - 1;
    }
    if (end > total - 2) {
      end   = total - 2;
      start = end - (maxButtons - 1);
    }

    // 1st page
    pages.push(0);

    // ellipsis if gap between 1 and start
    if (start > 1) {
      pages.push('...');
    }

    // main window
    for (let p = start; p <= end; p++) {
      pages.push(p);
    }

    // ellipsis if gap between end and last-1
    if (end < total - 2) {
      pages.push('...');
    }

    // last page
    pages.push(total - 1);
  }

  this.visiblePages = pages;
}

onPageClick(p: number | '...'): void {
  if (typeof p === 'number') {
    this.goToPage(p);
    this.loadUsers();
  }
}

  goToPage(pageNum: number): void {
    this.page = pageNum;
    this.loadUsers();
  }

  nextPage(): void {
    if (this.page + 1 < this.totalPages) {
      this.page++;
      this.loadUsers();
    }
  }

  prevPage(): void {
    if (this.page > 0) {
      this.page--;
      this.loadUsers();
    }
  }

  onPageSizeChange(): void {
    this.page = 0;
    this.loadUsers();
  }
}