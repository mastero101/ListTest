import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleConfiguracionComponent } from './detalle-configuracion.component';

describe('DetalleConfiguracionComponent', () => {
  let component: DetalleConfiguracionComponent;
  let fixture: ComponentFixture<DetalleConfiguracionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DetalleConfiguracionComponent]
    });
    fixture = TestBed.createComponent(DetalleConfiguracionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
