import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewMakerComponent } from './new-maker.component';

describe('Newloadetails', () => {
  let component: NewMakerComponent;
  let fixture: ComponentFixture<NewMakerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NewMakerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewMakerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
