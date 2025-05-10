import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForReleasingComponent } from './for-releasing.component';

describe('ForReleasingComponent', () => {
  let component: ForReleasingComponent;
  let fixture: ComponentFixture<ForReleasingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ForReleasingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ForReleasingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
