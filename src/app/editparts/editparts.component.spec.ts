import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditpartsComponent } from './editparts.component';

describe('EditpartsComponent', () => {
  let component: EditpartsComponent;
  let fixture: ComponentFixture<EditpartsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditpartsComponent]
    });
    fixture = TestBed.createComponent(EditpartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
