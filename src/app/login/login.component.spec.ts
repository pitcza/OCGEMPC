import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, CommonModule], 
      declarations: [LoginComponent], 
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should show email validation error when the email is invalid', () => {
    const emailInput = component.loginForm.get('email');
    emailInput?.setValue('invalid-email');
    fixture.detectChanges(); 

    const errorMessage = fixture.debugElement.query(By.css('.error'));
    expect(errorMessage.nativeElement.textContent).toContain('Please enter a valid email');
  });

  it('should show password input as type "password" by default', () => {
    const passwordInput = fixture.debugElement.query(By.css('input[type="password"]'));
    expect(passwordInput).toBeTruthy();
  });

  it('should toggle password visibility when the button is clicked', () => {
    const toggleButton = fixture.debugElement.query(By.css('button'));
    toggleButton.triggerEventHandler('click', null);
    fixture.detectChanges(); 

    const passwordInput = fixture.debugElement.query(By.css('input[type="text"]')); 
    expect(passwordInput).toBeTruthy();
  });

  it('should call onSubmit() when the form is submitted', () => {
    const spy = spyOn(component, 'onSubmit'); 
    component.loginForm.setValue({
      email: 'test@example.com',
      password: 'password123',
    });

    fixture.debugElement.query(By.css('button[type="submit"]')).triggerEventHandler('click', null);
    expect(spy).toHaveBeenCalled();
  });
});
