import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoMakerDetailsComponent } from './details.component';

describe('DetailsComponent', () => {
  let component: CoMakerDetailsComponent;
  let fixture: ComponentFixture<CoMakerDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CoMakerDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoMakerDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
