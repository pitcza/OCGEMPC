import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewLoanDetails } from './newloandetails.component';

describe('Newloadetails', () => {
  let component: NewLoanDetails;
  let fixture: ComponentFixture<NewLoanDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NewLoanDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewLoanDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
