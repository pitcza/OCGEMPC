import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeclinemodalComponent } from './declinemodal.component';

describe('DeclinemodalComponent', () => {
  let component: DeclinemodalComponent;
  let fixture: ComponentFixture<DeclinemodalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DeclinemodalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeclinemodalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
