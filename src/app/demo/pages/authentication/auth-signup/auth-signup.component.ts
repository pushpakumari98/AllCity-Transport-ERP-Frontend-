import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Appservice } from 'src/app/myservice/appservice';

@Component({
  selector: 'app-auth-signup',
  imports: [RouterModule,CommonModule, HttpClientModule, FormsModule],
  templateUrl: './auth-signup.component.html',
  styleUrls: ['./auth-signup.component.scss']
})
export class AuthSignupComponent {
  email: string = '';
  password: string = '';
  firstName: string = '';
  lastName: string = '';
  phoneNumber: string = '';
  role: string = 'USER';



  error: any = null;
  constructor(private myService: Appservice, private router: Router) {}

onSignup() {

  const signupData = {
    email: this.email,
    password: this.password,
    firstName: this.firstName,
    lastName: this.lastName,
    phoneNumber: this.phoneNumber,
    role: this.role
  };

  this.myService.registerUser(signupData).subscribe({
    next: (res: any) => {

      if (res.status === 200) {
        alert('Registration successful! Please log in with your credentials.');
        this.router.navigate(['/login']); // ✅ correct redirect
      }

      if (res.status === 409) {
        alert('Welcome back! An account with this email already exists. Please sign in to continue.');
        this.router.navigate(['/login']);
      }
    },
    error: (err) => {
      this.showError(err?.error?.message || 'Signup failed');
    }
  });
}


    showError(msg: string){
    this.error = msg;
    setTimeout(()=> {
      this.error = null
    }, 4000);
  }

  }
