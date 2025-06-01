import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovemodalComponent } from './approvemodal.component';

describe('ApprovemodalComponent', () => {
  let component: ApprovemodalComponent;
  let fixture: ComponentFixture<ApprovemodalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ApprovemodalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApprovemodalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
