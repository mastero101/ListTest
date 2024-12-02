export interface Componente {
  id: number;
  modelo: string;
  precio: number;
  tipo: string; // Por ejemplo: 'procesador', 'motherboard', etc.
  img: string; // URL de la imagen
  socket?: string; // Opcional, solo para procesadores
  tienda: string; // Nombre de la tienda
  url: string; // URL del producto
  consumo?: string; // Opcional, solo si aplica
  potencia?: string; // Opcional, solo si aplica
  rams?: string; // Opcional, solo si aplica
}
