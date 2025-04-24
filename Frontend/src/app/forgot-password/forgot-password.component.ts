import { Component, NgZone, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

declare var hcaptcha: any;
declare global {
  interface Window {
    onCaptchaSuccess: (token: string) => void;
    onCaptchaExpired: () => void;
  }
}

@Component({
  selector: 'app-forgot-password',
  standalone: false,
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent implements OnInit {

  forgotPasswordForm: FormGroup;
  submitted = false;
  loading = false;
  captchaToken: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private zone: NgZone
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    window.onCaptchaSuccess = (token: string) => {
      this.zone.run(() => {
        this.captchaToken = token;
        console.log('CAPTCHA success:', token);
      });
    };

    window.onCaptchaExpired = () => {
      this.zone.run(() => {
        this.captchaToken = null;
        console.log('CAPTCHA expired');
      });
    };
  }

  ngOnInit(): void {
    this.renderCaptcha();
  }

  get f() {
    return this.forgotPasswordForm.controls;
  }

  renderCaptcha() {
    const interval = setInterval(() => {
      if (typeof hcaptcha !== 'undefined' && hcaptcha.render) {
        clearInterval(interval);

        hcaptcha.render('hcaptcha-container', {
          sitekey: 'a3e81826-2e6c-479a-99ba-38fc03f06bbe',
          callback: 'onCaptchaSuccess',
          'expired-callback': 'onCaptchaExpired'
        });
      }
    }, 200);
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.forgotPasswordForm.invalid || !this.captchaToken) {
      alert('Please fill in the email and complete the CAPTCHA.');
      return;
    }

    this.loading = true;
    const email = this.forgotPasswordForm.value.email;

    this.authService.sendResetPasswordEmail(email).subscribe({
      next: () => {
        alert('Password reset link sent successfully.');
        this.loading = false;
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Reset email error:', err);
        alert('Failed to send reset email.');
        this.loading = false;
      }
    });
  }
}
