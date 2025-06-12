import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoMakersComponent } from './comakers.component';

describe('CoMakersComponent', () => {
  let component: CoMakersComponent;
  let fixture: ComponentFixture<CoMakersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CoMakersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoMakersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
