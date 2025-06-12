import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewCoMakerComponent } from './new-comaker.component';

describe('Newcomaker', () => {
  let component: NewCoMakerComponent;
  let fixture: ComponentFixture<NewCoMakerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NewCoMakerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewCoMakerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
