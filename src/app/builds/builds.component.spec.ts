import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BuildsComponent } from './builds.component';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import axios from 'axios';

describe('BuildsComponent', () => {
  let component: BuildsComponent;
  let fixture: ComponentFixture<BuildsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatCardModule, MatFormFieldModule, MatSelectModule, BrowserAnimationsModule],
      declarations: [BuildsComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BuildsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize variables correctly', () => {
    expect(component.procesadores).toEqual([]);
    expect(component.motherboard).toEqual([]);
    // Add assertions for other variables as needed
  });

  it('should call recoverProcesadores on initialization', async () => {
    spyOn(component, 'recoverProcesadores').and.callFake(() => Promise.resolve({}));
  
    fixture.detectChanges(); // Call detectChanges
  
    // Verify if the spy has been called
    expect(component.recoverProcesadores).toHaveBeenCalled();
  
    await fixture.whenStable(); // Wait for promises to resolve (if any)
  });
  
  
  
  // Add more test cases to cover different scenarios and functionality
});
