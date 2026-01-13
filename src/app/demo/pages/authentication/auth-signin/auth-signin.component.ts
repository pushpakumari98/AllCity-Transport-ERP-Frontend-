import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterModule } from '@angular/router';
import { Appservice } from 'src/app/myservice/appservice';

@Component({
  selector: 'app-auth-signin',
  templateUrl: './auth-signin.component.html',
  styleUrls: ['./auth-signin.component.scss'],
  imports: [
    CommonModule,
    FormsModule,   // ✅ This enables ngModel
    RouterModule
    // other modules
  ]

})
export class AuthSigninComponent {
  loginData = {
    email: '',
    password: ''
  };

  errorMessage: string = '';

  constructor(private myService: Appservice, private router: Router,private snackBar: MatSnackBar
) {}

  onSignUp(){
    alert('alert');
  }

  onLogin() {


    if (this.loginData.email === '' || this.loginData.password === '') {
      this.errorMessage = "Email and Password are required!";
      return;
    }

    this.myService.login(this.loginData).subscribe({
      next: (res: any) => {
        console.log("login successful:", res);
          // alert('login successful');
        this.showAutoCloseAlert();

        if (res.token) {
          localStorage.setItem('token', res.token);
        }

        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.log(err);
        this.errorMessage = err.error?.message || "Invalid login credentials!";
      }
    });
  }



  showAutoCloseAlert() {
  this.snackBar.open('Login successful!', '', {
    duration: 3000, // auto-close after 5 seconds
    verticalPosition: 'top',
    horizontalPosition: 'center'
  });
}


}
